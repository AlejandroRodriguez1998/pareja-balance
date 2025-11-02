'use client';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
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
  pagadoPareja: number;
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

  useEffect(() => {
    const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data: Expense[] = [];
      snap.forEach((d) => {
        const e = d.data() as any;
        data.push({
          id: d.id,
          description: e.description,
          total: e.total,
          pagadoAlec: e.pagadoAlec,
          pagadoPareja: e.pagadoPareja,
          date: e.date,
        });
      });

      const grouped: { [key: string]: WeekGroup } = {};

      data.forEach((e) => {
        const fecha = e.date?.seconds ? dayjs.unix(e.date.seconds) : dayjs();
        const start = fecha.startOf('isoWeek').format('YYYY-MM-DD');
        const end = fecha.endOf('isoWeek').format('YYYY-MM-DD');
        const key = start;

        if (!grouped[key]) {
          grouped[key] = { weekStart: start, weekEnd: end, expenses: [], balance: 0 };
        }

        grouped[key].expenses.push(e);
        grouped[key].balance += e.pagadoAlec - e.pagadoPareja;
      });

      const result = Object.values(grouped).sort(
        (a, b) => dayjs(b.weekStart).unix() - dayjs(a.weekStart).unix()
      );

      setWeeks(result);
    });
    return () => unsub();
  }, []);

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
                  Semana del{' '}
                  {dayjs(week.weekStart).format('D')} al {dayjs(week.weekEnd).format('D')} de{' '}
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
                          Total: {(e.total ?? 0).toFixed(2)} € | Alejandro: {(e.pagadoAlec ?? 0).toFixed(2)} € | Mario:{' '}
                          {(e.pagadoPareja ?? 0).toFixed(2)} €
                        </small>
                      </div>
                      <span
                        className={`badge px-3 ${
                          e.pagadoAlec - e.pagadoPareja >= 0
                            ? 'bg-success-subtle text-success'
                            : 'bg-danger-subtle text-danger'
                        }`}
                      >
                        {e.pagadoAlec - e.pagadoPareja > 0 ? '+' : ''}
                        {(e.pagadoAlec - e.pagadoPareja).toFixed(2)} €
                      </span>
                    </li>
                  ))}
                </ul>

                <div className={`text-end fw-bold ${week.balance >= 0 ? 'text-success' : 'text-danger'}`}>
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
