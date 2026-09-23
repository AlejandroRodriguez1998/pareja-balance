'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getUserPairId } from '@/lib/pairs';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import AuthGuard from '@/components/AuthGuard';
import EditExpenseModal from '@/components/EditExpenseModal';
import { CalendarWeek, Receipt } from 'react-bootstrap-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);
dayjs.locale('es');

type Expense = {
  id: string;
  description: string;
  total: number;
  pagadoAlec: number;
  pagadoMario: number;
  date?: { seconds: number };
};

type ExpenseData = Omit<Expense, 'id'>;

type WeekGroup = {
  weekStart: string;
  weekEnd: string;
  expenses: Expense[];
  balance: number;
};

export default function HistoryPage() {
  const [weeks, setWeeks] = useState<WeekGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

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
            const data: Expense[] = [];
            snap.forEach((d) => {
              const e = d.data() as ExpenseData;
              data.push({
                id: d.id,
                description: e.description,
                total: Number(e.total || 0),
                pagadoAlec: Number(e.pagadoAlec || 0),
                pagadoMario: Number(e.pagadoMario || 0),
                date: e.date,
              });
            });

            const grouped: Record<string, WeekGroup> = {};
            const isAlec = user.email?.toLowerCase().includes('alex');

            data.forEach((e) => {
              const date = e.date?.seconds ? dayjs.unix(e.date.seconds) : dayjs();
              const start = date.startOf('isoWeek').format('YYYY-MM-DD');
              const end = date.endOf('isoWeek').format('YYYY-MM-DD');

              if (!grouped[start]) {
                grouped[start] = { weekStart: start, weekEnd: end, expenses: [], balance: 0 };
              }

              grouped[start].expenses.push(e);
              grouped[start].balance += isAlec
                ? e.pagadoAlec - e.pagadoMario
                : e.pagadoMario - e.pagadoAlec;
            });

            const result = Object.values(grouped).sort(
              (a, b) => dayjs(b.weekStart).unix() - dayjs(a.weekStart).unix()
            );

            setWeeks(result);
            setLoading(false);
          }, (error) => {
            console.error('Error loading history:', error);
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

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner-border app-loading-spinner" role="status"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <TopNav title="Gastos" />
      <main className="dashboard-shell">
        <div className="container dashboard-container">
          {weeks.length === 0 ? (
            <div className="empty-state">
              <p>Aun no hay gastos registrados.</p>
            </div>
          ) : (
            <div className="history-week-list">
              {weeks.map((week) => (
                <section key={week.weekStart} className="recent-expenses-panel">
                  <div className="section-heading">
                    <div>
                      <span className="section-kicker">Semana</span>
                      <h2>
                        {dayjs(week.weekStart).format('DD/MM')} -{' '}
                        {dayjs(week.weekEnd).format('DD/MM/YYYY')}
                      </h2>
                    </div>
                    <CalendarWeek size={22} />
                  </div>

                  <div className="expense-list">
                    {week.expenses.map((e) => {
                      const diff = e.pagadoAlec - e.pagadoMario;

                      return (
                        <button
                          key={e.id}
                          type="button"
                          className="expense-row"
                          onClick={() => setSelectedExpense(e)}
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
                          <span
                            className={`expense-delta ${diff >= 0 ? 'is-positive' : 'is-negative'}`}
                          >
                            {diff > 0 ? '+' : ''}
                            {diff.toFixed(2)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className={`week-balance ${week.balance >= 0 ? 'is-positive' : 'is-negative'}`}>
                    <span>{week.balance >= 0 ? 'Saldo a favor' : 'Saldo en contra'}</span>
                    <strong>{Math.abs(week.balance).toFixed(2)} EUR</strong>
                  </div>
                </section>
              ))}
            </div>
          )}

          {selectedExpense && (
            <EditExpenseModal
              show={!!selectedExpense}
              expense={selectedExpense}
              onHide={() => setSelectedExpense(null)}
            />
          )}
        </div>
      </main>
      <BottomNav />
    </AuthGuard>
  );
}
