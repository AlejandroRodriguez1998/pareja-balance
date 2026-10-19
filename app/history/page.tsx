'use client';
import { useEffect, useMemo, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getUserPairId } from '@/lib/pairs';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import AuthGuard from '@/components/AuthGuard';
import EditExpenseModal from '@/components/EditExpenseModal';
import { CalendarWeek, ChevronLeft, ChevronRight, PieChartFill, Receipt } from 'react-bootstrap-icons';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_COLORS, inferExpenseCategory, type ExpenseCategory } from '@/lib/expenseCategories';
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
  const [selectedWeekStart, setSelectedWeekStart] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'Todas'>('Todas');

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
            setSelectedWeekStart((current) => current && result.some((week) => week.weekStart === current)
              ? current
              : result[0]?.weekStart || null);
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

  const selectedWeekIndex = Math.max(0, weeks.findIndex((week) => week.weekStart === selectedWeekStart));
  const selectedWeek = weeks[selectedWeekIndex];

  const categoryBreakdown = useMemo(() => {
    if (!selectedWeek) return [];
    const totals = new Map<ExpenseCategory, number>();
    selectedWeek.expenses.forEach((expense) => {
      const category = inferExpenseCategory(expense.description);
      totals.set(category, (totals.get(category) || 0) + expense.total);
    });
    return EXPENSE_CATEGORIES
      .map((category) => ({ category, total: totals.get(category) || 0 }))
      .filter((entry) => entry.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [selectedWeek]);

  const weeklyTotal = categoryBreakdown.reduce((sum, entry) => sum + entry.total, 0);
  const chartBackground = useMemo(() => {
    if (!weeklyTotal) return 'var(--app-surface-inset)';
    let cursor = 0;
    const segments = categoryBreakdown.map(({ category, total }) => {
      const start = cursor;
      cursor += (total / weeklyTotal) * 100;
      return `${EXPENSE_CATEGORY_COLORS[category]} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${segments.join(', ')})`;
  }, [categoryBreakdown, weeklyTotal]);

  const visibleExpenses = selectedWeek?.expenses.filter((expense) =>
    categoryFilter === 'Todas' || inferExpenseCategory(expense.description) === categoryFilter
  ) || [];

  const selectWeek = (index: number) => {
    const week = weeks[index];
    if (!week) return;
    setSelectedWeekStart(week.weekStart);
    setCategoryFilter('Todas');
  };

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
          {!selectedWeek ? (
            <div className="empty-state">
              <p>Aun no hay gastos registrados.</p>
            </div>
          ) : (
            <div className="expense-analysis-page">
              <section className="expense-week-overview" aria-labelledby="expense-week-title">
                <div className="expense-week-picker">
                  <button type="button" onClick={() => selectWeek(selectedWeekIndex + 1)} disabled={selectedWeekIndex >= weeks.length - 1} aria-label="Semana anterior"><ChevronLeft /></button>
                  <div>
                    <span className="section-kicker">Semana</span>
                    <h1 id="expense-week-title">{dayjs(selectedWeek.weekStart).format('DD/MM/YYYY')} - {dayjs(selectedWeek.weekEnd).format('DD/MM/YYYY')}</h1>
                  </div>
                  <button type="button" onClick={() => selectWeek(selectedWeekIndex - 1)} disabled={selectedWeekIndex <= 0} aria-label="Semana siguiente"><ChevronRight /></button>
                </div>

                <div className="expense-breakdown">
                  <div className="expense-donut" style={{ background: chartBackground }} role="img" aria-label={`Gasto total de la semana: ${weeklyTotal.toFixed(2)} euros`}>
                    <div><strong>{weeklyTotal.toFixed(2)}</strong><span>EUR</span></div>
                  </div>
                  <div className="expense-legend">
                    {categoryBreakdown.map(({ category, total }) => (
                      <button type="button" key={category} className={categoryFilter === category ? 'is-active' : ''} onClick={() => setCategoryFilter(categoryFilter === category ? 'Todas' : category)} aria-pressed={categoryFilter === category}>
                        <i style={{ background: EXPENSE_CATEGORY_COLORS[category] }} aria-hidden="true" />
                        <span>{category}</span><strong>{total.toFixed(2)} €</strong>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="recent-expenses-panel">
                <div className="section-heading">
                  <div><span className="section-kicker">Movimientos</span><h2>{categoryFilter === 'Todas' ? 'Todos los gastos' : categoryFilter}</h2></div>
                  {categoryFilter === 'Todas' ? <CalendarWeek size={22} /> : <PieChartFill size={22} />}
                </div>
                <div className="expense-category-filters" aria-label="Filtrar por categoría">
                  <button type="button" className={categoryFilter === 'Todas' ? 'is-active' : ''} onClick={() => setCategoryFilter('Todas')}>Todos</button>
                  {categoryBreakdown.map(({ category }) => <button type="button" key={category} className={categoryFilter === category ? 'is-active' : ''} onClick={() => setCategoryFilter(category)}>{category}</button>)}
                </div>

                <div className="expense-list">
                    {visibleExpenses.map((e) => {
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
                            <span className="expense-category-label">{inferExpenseCategory(e.description)}</span>
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

                  <div className={`week-balance ${selectedWeek.balance >= 0 ? 'is-positive' : 'is-negative'}`}>
                    <span>{selectedWeek.balance >= 0 ? 'Saldo a favor' : 'Saldo en contra'}</span>
                    <strong>{Math.abs(selectedWeek.balance).toFixed(2)} EUR</strong>
                  </div>
              </section>
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
