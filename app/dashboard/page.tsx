'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getUserPairId } from '@/lib/pairs';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import EditExpenseModal from '@/components/EditExpenseModal';
import { ArrowRight, Check2Square, EggFried, HeartFill, Receipt, Wallet2 } from 'react-bootstrap-icons';
import type { CoupleData, SharedTask } from '@/lib/types';

type Expense = {
  id: string;
  description: string;
  total: number;
  pagadoAlec: number;
  pagadoMario: number;
  date?: { seconds: number };
};

type ExpenseData = Omit<Expense, 'id'>;

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [totalAlec, setTotalAlec] = useState(0);
  const [totalMario, setTotalMario] = useState(0);
  const [lastExpenses, setLastExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [weekMeals, setWeekMeals] = useState<string[]>([]);
  const [weekTasks, setWeekTasks] = useState<SharedTask[]>([]);
  const [coupleData, setCoupleData] = useState<CoupleData | null>(null);
  const [loading, setLoading] = useState(true);

  const balanceTone = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'neutral';

  useEffect(() => {
    let unsubscribeExpenses: (() => void) | null = null;
    let cancelled = false;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeExpenses) {
        unsubscribeExpenses();
        unsubscribeExpenses = null;
      }

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      getUserPairId(user.uid)
        .then((pairId) => {
          if (cancelled) return;

          if (!pairId) {
            alert('No se encontro una pareja asociada a este usuario.');
            setLoading(false);
            return;
          }

          const q = query(
            collection(db, 'expenses'),
            where('pairId', '==', pairId),
            orderBy('date', 'desc')
          );

          unsubscribeExpenses = onSnapshot(q, (snap) => {
            let totalAlecTemp = 0;
            let totalMarioTemp = 0;
            const allExpenses: Expense[] = [];

            snap.forEach((d) => {
              const e = d.data() as ExpenseData;
              totalAlecTemp += Number(e.pagadoAlec || 0);
              totalMarioTemp += Number(e.pagadoMario || 0);
              allExpenses.push({
                id: d.id,
                description: e.description,
                total: Number(e.total || 0),
                pagadoAlec: Number(e.pagadoAlec || 0),
                pagadoMario: Number(e.pagadoMario || 0),
                date: e.date,
              });
            });

            setTotalAlec(totalAlecTemp);
            setTotalMario(totalMarioTemp);

            const isAlec = user.email?.toLowerCase().includes('alex');
            const calculatedBalance = isAlec
              ? totalAlecTemp - totalMarioTemp
              : totalMarioTemp - totalAlecTemp;

            setBalance(calculatedBalance);
            setLastExpenses(allExpenses.slice(0, 5));
            setLoading(false);
          }, (error) => {
            console.error('Error loading expenses:', error);
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
      if (unsubscribeExpenses) unsubscribeExpenses();
    };
  }, []);

  useEffect(() => {
    const dataUnsubscribers: Array<() => void> = [];
    let cancelled = false;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      dataUnsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
      if (!user) return;
      try {
        const pairId = await getUserPairId(user.uid);
        if (!pairId || cancelled) return;
        dataUnsubscribers.push(onSnapshot(query(collection(db, 'meals'), where('pairId', '==', pairId)), (snapshot) => {
          const todayIndex = (new Date().getDay() + 6) % 7;
          const meals = snapshot.docs
            .map((mealDoc) => mealDoc.data() as { day?: number; name?: string })
            .filter((meal) => Number(meal.day) >= todayIndex && meal.name)
            .sort((a, b) => Number(a.day) - Number(b.day))
            .slice(0, 3)
            .map((meal) => meal.name as string);
          setWeekMeals(meals);
        }));
        dataUnsubscribers.push(onSnapshot(query(collection(db, 'tasks'), where('pairId', '==', pairId)), (snapshot) => {
          setWeekTasks(snapshot.docs.map((taskDoc) => ({ id: taskDoc.id, ...taskDoc.data() } as SharedTask)));
        }));
        dataUnsubscribers.push(onSnapshot(doc(db, 'coupleData', pairId), (snapshot) => {
          setCoupleData(snapshot.exists() ? snapshot.data() as CoupleData : null);
        }));
      } catch (error) {
        console.error('Error loading weekly summary:', error);
      }
    });
    return () => { cancelled = true; unsubscribeAuth(); dataUnsubscribers.forEach((unsubscribe) => unsubscribe()); };
  }, []);

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner-border app-loading-spinner" role="status"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <TopNav title="Pareja Balance" />

      <main className="dashboard-shell">
        <div className="container dashboard-container">
          <section className={`balance-hero balance-hero-${balanceTone}`}>
            <div className="balance-hero-top">
              <div>
                <span className="section-kicker">Estado actual</span>
                <h1>
                  {balance > 0 && 'Saldo a tu favor'}
                  {balance < 0 && 'Saldo pendiente'}
                  {balance === 0 && 'Todo cuadrado'}
                </h1>
              </div>
              <span className="balance-icon">
                <Wallet2 size={20} />
              </span>
            </div>

            <div className="balance-amount">
              {balance === 0 ? '0.00' : Math.abs(balance).toFixed(2)}
              <span>EUR</span>
            </div>

            <p className="balance-copy">
              {balance > 0 && 'Tu pareja te debe este importe.'}
              {balance < 0 && 'Le debes este importe a tu pareja.'}
              {balance === 0 && 'Estais a mano por ahora.'}
            </p>
          </section>

          <section className="dashboard-stat-grid" aria-label="Totales pagados">
            <div className="dashboard-stat-card">
              <span>Alejandro</span>
              <strong>{totalAlec.toFixed(2)} EUR</strong>
            </div>
            <div className="dashboard-stat-card">
              <span>Mario</span>
              <strong>{totalMario.toFixed(2)} EUR</strong>
            </div>
          </section>

          <section className="week-summary" aria-labelledby="week-summary-title">
            <div className="section-heading week-summary-heading">
              <div><span className="section-kicker">En común</span><h2 id="week-summary-title">Nuestra semana</h2></div>
            </div>
            <div className="week-summary-grid">
              <Link href="/meals" className="week-summary-card is-featured-meal">
                <span className="week-summary-icon"><EggFried /></span>
                <div>
                  <span className="week-summary-label">Próxima comida</span>
                  <strong>{weekMeals[0] || 'Nada planeado todavía'}</strong>
                  {weekMeals.length > 1 && <small>Y {weekMeals.length - 1} más esta semana</small>}
                </div>
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/us" className="week-summary-card is-compact is-couple">
                <span className="week-summary-icon"><HeartFill /></span>
                <div><strong>Nosotros</strong><small>{coupleData?.nextPlan?.title || 'Sin próximo plan'}</small></div>
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/tasks" className="week-summary-card is-compact">
                <span className="week-summary-icon"><Check2Square /></span>
                <div><strong>Tareas</strong><small>{weekTasks.filter((task) => !task.completed).length} pendientes</small></div>
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </section>

          <section className="recent-expenses-panel">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Actividad</span>
                <h2>Ultimos gastos</h2>
              </div>
              <Receipt size={22} />
            </div>

            {lastExpenses.length === 0 ? (
              <div className="empty-state">
                <p>Aun no hay gastos registrados.</p>
              </div>
            ) : (
              <div className="expense-list">
                {lastExpenses.map((e) => {
                  const diff = e.pagadoAlec - e.pagadoMario;

                  return (
                    <button
                      type="button"
                      key={e.id}
                      onClick={() => setSelectedExpense(e)}
                      className="expense-row"
                    >
                      <span className="expense-icon">
                        <Receipt size={18} />
                      </span>
                      <span className="expense-main">
                        <strong>{e.description}</strong>
                        <small>
                          Total {e.total.toFixed(2)} EUR | A {e.pagadoAlec.toFixed(2)} | M{' '}
                          {e.pagadoMario.toFixed(2)}
                        </small>
                      </span>
                      <span className={`expense-delta ${diff >= 0 ? 'is-positive' : 'is-negative'}`}>
                        {diff > 0 ? '+' : ''}
                        {diff.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedExpense && (
              <EditExpenseModal
                show={!!selectedExpense}
                expense={selectedExpense}
                onHide={() => setSelectedExpense(null)}
              />
            )}

            <Link href="/history" className="history-link">
              Ver todos los gastos
              <ArrowRight size={18} />
            </Link>
          </section>

        </div>
      </main>

      <BottomNav />
    </AuthGuard>
  );
}
