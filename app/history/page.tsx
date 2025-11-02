'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { getUserPairId } from '@/lib/pairs';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import AuthGuard from '@/components/AuthGuard';
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

type WeekGroup = {
  weekStart: string;
  weekEnd: string;
  expenses: Expense[];
  balance: number;
};

export default function HistoryPage() {
  const [weeks, setWeeks] = useState<WeekGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    getUserPairId(user.uid).then((pairId) => {
      if (!pairId) {
        alert('No se encontró una pareja asociada a este usuario.');
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'expenses'),
        where('pairId', '==', pairId),
        orderBy('date', 'desc')
      );

      const unsub = onSnapshot(q, (snap) => {
        const data: Expense[] = [];
        snap.forEach((d) => {
          const e = d.data() as any;
          data.push({
            id: d.id,
            description: e.description,
            total: e.total,
            pagadoAlec: e.pagadoAlec,
            pagadoMario: e.pagadoMario,
            date: e.date,
          });
        });

        const grouped: Record<string, WeekGroup> = {};
        const isAlec = user.email?.toLowerCase().includes('alec');

        data.forEach((e) => {
          const fecha = e.date?.seconds ? dayjs.unix(e.date.seconds) : dayjs();
          const start = fecha.startOf('isoWeek').format('YYYY-MM-DD');
          const end = fecha.endOf('isoWeek').format('YYYY-MM-DD');
          const key = start;

          if (!grouped[key]) {
            grouped[key] = { weekStart: start, weekEnd: end, expenses: [], balance: 0 };
          }

          grouped[key].expenses.push(e);

          // 🧮 Calculamos el balance según quién es el usuario
          const diff = isAlec
            ? e.pagadoAlec - e.pagadoMario
            : e.pagadoMario - e.pagadoAlec;

          grouped[key].balance += diff;
        });

        const result = Object.values(grouped).sort(
          (a, b) => dayjs(b.weekStart).unix() - dayjs(a.weekStart).unix()
        );

        setWeeks(result);
        setLoading(false);
      });

      return () => unsub();
    });
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-light bg-dark">
        <div className="spinner-border text-light" role="status"></div>
        <p className="mt-3">Cargando historial...</p>
      </div>
    );
  }

  return (
    <>
      <AuthGuard>
        <TopNav title="Historial" />
        <div className="container mt-3 mb-5 pb-5">
          {weeks.length === 0 ? (
            <p className="text-center mt-5">Aún no hay gastos registrados.</p>
          ) : (
            weeks.map((week) => (
              <div key={week.weekStart} className="mb-4">
                <h5 className="fw-bold text-white mb-3">
                  Semana del {dayjs(week.weekStart).format('D')} al{' '}
                  {dayjs(week.weekEnd).format('D')} de{' '}
                  {dayjs(week.weekEnd).format('MMMM YYYY')}
                </h5>

                <ul className="list-group mb-2">
                  {week.expenses.map((e) => (
                    <li
                      key={e.id}
                      className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center border-secondary"
                    >
                      <div>
                        <div className="fw-semibold text-capitalize">{e.description}</div>
                        <small className="text-secondary white-important">
                          Total: {(e.total ?? 0).toFixed(2)} € <br />
                          Alejandro: {(e.pagadoAlec ?? 0).toFixed(2)} € <br />
                          Mario: {(e.pagadoMario ?? 0).toFixed(2)} €
                        </small>
                      </div>
                      <span
                        className={`badge px-3 ${
                          e.pagadoAlec - e.pagadoMario >= 0
                            ? 'bg-success-subtle text-success'
                            : 'bg-danger-subtle text-danger'
                        }`}
                      >
                        {e.pagadoAlec - e.pagadoMario > 0 ? '+' : ''}
                        {(e.pagadoAlec - e.pagadoMario).toFixed(2)} €
                      </span>
                    </li>
                  ))}
                </ul>

                <div
                  className={`text-end fw-bold ${
                    week.balance >= 0 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {week.balance >= 0 ? 'Saldo a favor: ' : 'Saldo en contra: '}
                  {week.balance.toFixed(2)} €
                </div>

                <hr />
              </div>
            ))
          )}
        </div>
        <BottomNav />
      </AuthGuard>
    </>
  );
}
