'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getUserPairId } from '@/lib/pairs';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import EditExpenseModal from '@/components/EditExpenseModal';
import { ArrowRight, Receipt, Wallet2 } from 'react-bootstrap-icons';

type Expense = {
  id: string;
  description: string;
  total: number;
  pagadoAlec: number;
  pagadoMario: number;
  date?: { seconds: number };
};

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);
  const [totalAlec, setTotalAlec] = useState(0);
  const [totalMario, setTotalMario] = useState(0);
  const [lastExpenses, setLastExpenses] = useState<Expense[]>([]);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
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
              const e = d.data() as any;
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
              Ver historial completo
              <ArrowRight size={18} />
            </Link>
          </section>
        </div>
      </main>

      <BottomNav />
    </AuthGuard>
  );
}
