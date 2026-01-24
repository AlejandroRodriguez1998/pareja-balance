'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { getUserPairId } from '@/lib/pairs';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import AuthGuard from '@/components/AuthGuard';

type Meal = {
  id: string;
  day: number;
  name: string;
  createdAt?: { seconds: number } | Date;
};

export default function MealsPage() {
  const weekdays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  const [pairId, setPairId] = useState<string | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [newMealByDay, setNewMealByDay] = useState<Record<number, string>>({});
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editingMealName, setEditingMealName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    let unsubscribeMeals: (() => void) | null = null;

    getUserPairId(user.uid).then((resolvedPairId) => {
      if (!resolvedPairId) {
        alert('No se encontro una pareja asociada a este usuario.');
        setLoading(false);
        return;
      }

      setPairId(resolvedPairId);

      const mealsQuery = query(
        collection(db, 'meals'),
        where('pairId', '==', resolvedPairId)
      );

      unsubscribeMeals = onSnapshot(mealsQuery, (snap) => {
        const items: Meal[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          items.push({
            id: d.id,
            day: Number(data.day ?? 0),
            name: data.name || '',
            createdAt: data.createdAt,
          });
        });
        setMeals(items);
        setLoading(false);
      });
    });

    return () => {
      if (unsubscribeMeals) unsubscribeMeals();
    };
  }, []);

  const getMealTime = (meal: Meal) => {
    if (!meal.createdAt) return 0;
    const anyDate = meal.createdAt as any;
    if (typeof anyDate.seconds === 'number') return anyDate.seconds;
    if (anyDate instanceof Date) return Math.floor(anyDate.getTime() / 1000);
    return 0;
  };

  const handleAddMeal = async (dayIndex: number) => {
    if (!pairId) return;
    const name = (newMealByDay[dayIndex] || '').trim();
    if (!name) return;
    await addDoc(collection(db, 'meals'), {
      pairId,
      day: dayIndex,
      name,
      createdAt: new Date(),
    });
    setNewMealByDay((prev) => ({ ...prev, [dayIndex]: '' }));
  };

  const handleStartEditMeal = (meal: Meal) => {
    setEditingMealId(meal.id);
    setEditingMealName(meal.name);
  };

  const handleCancelEditMeal = () => {
    setEditingMealId(null);
    setEditingMealName('');
  };

  const handleSaveMeal = async () => {
    if (!editingMealId) return;
    const name = editingMealName.trim();
    if (!name) return alert('Anade un nombre para la comida.');
    await updateDoc(doc(db, 'meals', editingMealId), {
      name,
      updatedAt: new Date(),
    });
    handleCancelEditMeal();
  };

  const handleDeleteMeal = async (meal: Meal) => {
    const confirmed = confirm('Seguro que deseas eliminar esta comida?');
    if (!confirmed) return;
    await deleteDoc(doc(db, 'meals', meal.id));
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-light bg-dark">
        <div className="spinner-border text-light" role="status"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <TopNav title="Comidas" />
      <div className="container mt-4 mb-5 pb-5">
        <div className="card shadow-sm bg-dark border-0 mb-4">
          <div className="card-body">
            <h5 className="fw-bold text-center text-white mb-3">Plan semanal de comidas</h5>
            <div className="row g-3">
              {weekdays.map((dayLabel, dayIndex) => {
                const dayMeals = meals
                  .filter((meal) => meal.day === dayIndex)
                  .sort((a, b) => getMealTime(a) - getMealTime(b));

                return (
                  <div className="col-12 col-md-6" key={dayLabel}>
                    <div className="meal-day-card p-3 h-100">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="meal-day-title">{dayLabel}</span>
                        <span className="meal-count">{dayMeals.length}</span>
                      </div>

                      {dayMeals.length === 0 ? (
                        <p className="text-light-50 small mb-2">Sin comidas planeadas.</p>
                      ) : (
                        <div className="d-flex flex-column gap-2">
                          {dayMeals.map((meal) => (
                            <div className="meal-item" key={meal.id}>
                              {editingMealId === meal.id ? (
                                <>
                                  <input
                                    className="form-control form-control-sm meal-edit-input"
                                    value={editingMealName}
                                    onChange={(e) => setEditingMealName(e.target.value)}
                                  />
                                  <div className="btn-group btn-group-sm">
                                    <button className="btn btn-success" onClick={handleSaveMeal}>
                                      Guardar
                                    </button>
                                    <button className="btn btn-outline-light" onClick={handleCancelEditMeal}>
                                      Cancelar
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <span className="meal-item-name">{meal.name}</span>
                                  <div className="btn-group btn-group-sm">
                                    <button
                                      className="btn btn-outline-light"
                                      onClick={() => handleStartEditMeal(meal)}
                                    >
                                      Editar
                                    </button>
                                    <button
                                      className="btn btn-outline-danger"
                                      onClick={() => handleDeleteMeal(meal)}
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="input-group input-group-sm mt-3">
                        <input
                          className="form-control"
                          placeholder="Agregar comida"
                          value={newMealByDay[dayIndex] || ''}
                          onChange={(e) =>
                            setNewMealByDay((prev) => ({ ...prev, [dayIndex]: e.target.value }))
                          }
                        />
                        <button className="btn btn-primary" onClick={() => handleAddMeal(dayIndex)}>
                          Anadir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </AuthGuard>
  );
}
