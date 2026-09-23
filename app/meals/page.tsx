'use client';
import { useEffect, useRef, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { getUserPairId } from '@/lib/pairs';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import AuthGuard from '@/components/AuthGuard';
import AddMealModal from '@/components/AddMealModal';
import EditMealModal from '@/components/EditMealModal';
import ShoppingList, { type ShoppingListHandle } from '@/components/ShoppingList';
import { Basket2, EggFried } from 'react-bootstrap-icons';

type Meal = {
  id: string;
  day: number;
  name: string;
  createdAt?: { seconds: number } | Date;
};

type MealData = Omit<Meal, 'id'>;

export default function MealsPage() {
  const weekdays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [pairId, setPairId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'meals' | 'shopping'>('meals');
  const shoppingListRef = useRef<ShoppingListHandle>(null);

  useEffect(() => {
    let unsubscribeMeals: (() => void) | null = null;
    let cancelled = false;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeMeals) {
        unsubscribeMeals();
        unsubscribeMeals = null;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      getUserPairId(user.uid)
        .then((resolvedPairId) => {
          if (cancelled) return;

          if (!resolvedPairId) {
            alert('No se encontro una pareja asociada a este usuario.');
            setLoading(false);
            return;
          }

          setPairId(resolvedPairId);

          const mealsQuery = query(collection(db, 'meals'), where('pairId', '==', resolvedPairId));

          unsubscribeMeals = onSnapshot(mealsQuery, (snap) => {
            const items: Meal[] = [];
            snap.forEach((d) => {
              const data = d.data() as MealData;
              items.push({
                id: d.id,
                day: Number(data.day ?? 0),
                name: data.name || '',
                createdAt: data.createdAt,
              });
            });
            setMeals(items);
            setLoading(false);
          }, (error) => {
            console.error('Error loading meals:', error);
            setLoading(false);
          });
        })
        .catch((error) => {
          console.error('Error loading pair:', error);
          setLoading(false);
        });
    });

    return () => {
      cancelled = true;
      unsubscribeAuth();
      if (unsubscribeMeals) unsubscribeMeals();
    };
  }, []);

  const getMealTime = (meal: Meal) => {
    if (!meal.createdAt) return 0;
    const createdAt = meal.createdAt;
    if (createdAt instanceof Date) return Math.floor(createdAt.getTime() / 1000);
    if (typeof createdAt === 'object' && 'seconds' in createdAt) return createdAt.seconds;
    return 0;
  };

  const todayIndex = (new Date().getDay() + 6) % 7;
  const tomorrowIndex = (todayIndex + 1) % 7;
  const todayMeals = meals
    .filter((meal) => meal.day === todayIndex)
    .sort((a, b) => getMealTime(a) - getMealTime(b));
  const tomorrowMeals = meals
    .filter((meal) => meal.day === tomorrowIndex)
    .sort((a, b) => getMealTime(a) - getMealTime(b));

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner-border app-loading-spinner" role="status"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <TopNav title="Comidas" onAddClick={() => {
        if (activeView === 'shopping') shoppingListRef.current?.focusInput();
        else setShowAddMeal(true);
      }} />
      <AddMealModal show={showAddMeal} onHide={() => setShowAddMeal(false)} />
      <EditMealModal
        show={!!selectedMeal}
        meal={selectedMeal}
        onHide={() => setSelectedMeal(null)}
      />

      <main className="dashboard-shell">
        <div className="container dashboard-container">
          <div className="meals-view-switcher" role="tablist" aria-label="Vista de comidas">
            <button type="button" role="tab" aria-selected={activeView === 'meals'} className={activeView === 'meals' ? 'is-active' : ''} onClick={() => setActiveView('meals')}><EggFried aria-hidden="true" />Comidas</button>
            <button type="button" role="tab" aria-selected={activeView === 'shopping'} className={activeView === 'shopping' ? 'is-active' : ''} onClick={() => setActiveView('shopping')}><Basket2 aria-hidden="true" />Lista de compra</button>
          </div>

          {activeView === 'shopping' && pairId ? <ShoppingList ref={shoppingListRef} pairId={pairId} /> : activeView === 'shopping' ? (
            <div className="empty-state">No se encontró una pareja asociada.</div>
          ) : <>
          <section className="today-meal-panel">
            <div>
              <span className="section-kicker">Hoy</span>
              <h1>{weekdays[todayIndex]}</h1>
            </div>

            {todayMeals.length === 0 ? (
              <p className="today-meal-empty">No hay comida planeada.</p>
            ) : (
              <div className="today-meal-list">
                {todayMeals.map((meal) => (
                  <button
                    type="button"
                    className="today-meal-item"
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal)}
                  >
                    {meal.name}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="tomorrow-meal-panel">
            <div>
              <span className="section-kicker">Manana</span>
              <h2>{weekdays[tomorrowIndex]}</h2>
            </div>

            {tomorrowMeals.length === 0 ? (
              <p className="today-meal-empty">No hay comida planeada.</p>
            ) : (
              <div className="today-meal-list">
                {tomorrowMeals.map((meal) => (
                  <button
                    type="button"
                    className="today-meal-item"
                    key={meal.id}
                    onClick={() => setSelectedMeal(meal)}
                  >
                    {meal.name}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="meals-overview">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Semana</span>
                <h2>Plan de comidas</h2>
              </div>
              <EggFried size={22} />
            </div>

            <div className="meal-week-list">
              {weekdays.map((dayLabel, dayIndex) => {
                const dayMeals = meals
                  .filter((meal) => meal.day === dayIndex)
                  .sort((a, b) => getMealTime(a) - getMealTime(b));

                return (
                  <section className="meal-day-panel" key={dayLabel}>
                    <div className="meal-day-marker">
                      <span>{dayLabel.slice(0, 3)}</span>
                    </div>

                    <div className="meal-day-content">
                      {dayMeals.length > 1 && (
                        <div className="meal-day-count-row">
                          <span className="meal-count">{dayMeals.length}</span>
                        </div>
                      )}
                      {dayMeals.length === 0 ? (
                        <p className="meal-empty">Sin comidas planeadas.</p>
                      ) : (
                        <div className="meal-list">
                          {dayMeals.map((meal) => (
                            <button
                              type="button"
                              className="meal-row"
                              key={meal.id}
                              onClick={() => setSelectedMeal(meal)}
                            >
                              <span>{meal.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
          </>}
        </div>
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
