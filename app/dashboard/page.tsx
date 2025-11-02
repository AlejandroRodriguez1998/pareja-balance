'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { getUserPairId } from '@/lib/pairs';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Buscar la pareja asociada a este usuario
    getUserPairId(user.uid).then((pairId) => {
      if (!pairId) {
        alert('No se encontró una pareja asociada a este usuario.');
        setLoading(false);
        return;
      }

      // Escuchar los gastos de la pareja
      const q = query(
        collection(db, 'expenses'),
        where('pairId', '==', pairId),
        orderBy('date', 'desc')
      );

      const unsub = onSnapshot(q, (snap) => {
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

        // Detectar quién soy para invertir el balance según el caso
        const isAlec = user.email?.toLowerCase().includes('alex');
        const calculatedBalance = isAlec
          ? totalAlecTemp - totalMarioTemp
          : totalMarioTemp - totalAlecTemp;

        setBalance(calculatedBalance);
        setLastExpenses(allExpenses.slice(0, 5));
        setLoading(false);
      });

      return () => unsub();
    });
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-light bg-dark">
        <div className="spinner-border text-light" role="status"></div>
        <p className="mt-3">Cargando gastos...</p>
      </div>
    );
  }

  return (
    <AuthGuard>
      <TopNav title="Pareja Balance" />

      <div className="container mt-4">
        {/* 💰 Balance */}
        <div className="card shadow-sm bg-dark border-0 mb-4">
          <div className="card-body text-center text-white">
            <h5 className="fw-bold mb-2">Estado actual</h5>
            {balance > 0 && (
              <p className="mb-0">
                Tu pareja te debe <b className="text-success">{balance.toFixed(2)} €</b>
              </p>
            )}
            {balance < 0 && (
              <p className="mb-0">
                Tú le debes <b className="text-danger">{Math.abs(balance).toFixed(2)} €</b>
              </p>
            )}
            {balance === 0 && <p className="mb-0"><b className="text-white">Estáis a mano ✅</b></p>}
          </div>
        </div>

        {/* 💳 Totales */}
        <div className="row g-3 mb-3 text-center">
          <div className="col-6">
            <div className="card bg-dark shadow-sm border-0">
              <div className="card-body text-white">
                <h6 className="card-title fw-bold mb-1">Alejandro</h6>
                <p className="card-text fs-5 mb-0">{totalAlec.toFixed(2)} €</p>
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card bg-dark shadow-sm border-0">
              <div className="card-body text-white">
                <h6 className="card-title fw-bold mb-1">Mario</h6>
                <p className="card-text fs-5 mb-0">{totalMario.toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </div>

        {/* 🧾 Últimos gastos */}
        <div className="card bg-dark shadow-sm border-0">
          <h5 className="fw-bold mt-4 text-center text-white">Últimos gastos</h5>
          {lastExpenses.length === 0 ? (
            <p className="text-muted white-important text-center">Aún no hay gastos registrados.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {lastExpenses.map((e) => (
                <div key={e.id} className="card bg-transparent shadow-sm border m-2">
                  <div className="card-body text-white d-flex justify-content-between align-items-center">
                    <div className="text-start">
                      <div className="fw-semibold text-capitalize">{e.description}</div>
                      <small className="text-muted white-important d-block text-start">
                        Total: {e.total.toFixed(2)} € <br />
                        Alejandro: {e.pagadoAlec.toFixed(2)} € <br />
                        Mario: {e.pagadoMario.toFixed(2)} €
                      </small>
                    </div>
                    <span
                      className={`badge px-3 py-2 ${
                        e.pagadoAlec - e.pagadoMario >= 0
                          ? 'bg-success-subtle text-success'
                          : 'bg-danger-subtle text-danger'
                      }`}
                    >
                      {e.pagadoAlec - e.pagadoMario > 0 ? '+' : ''}
                      {(e.pagadoAlec - e.pagadoMario).toFixed(2)} €
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-4">
            <Link href="/history" className="btn btn-outline-primary w-75 fw-semibold mb-4">
              Ver todo el historial
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </AuthGuard>
  );
}
