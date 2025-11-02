'use client';
import AuthGuard from '@/component/AuthGuard';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

type Expense = {
  id?: string;
  description: string;
  aportado_alec: number;
  aportado_pareja: number;
  date: string; // ISO
};

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totals, setTotals] = useState({ alec: 0, pareja: 0 });

  useEffect(() => {
    (async () => {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      const rows: Expense[] = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      setExpenses(rows);

      let a = 0, p = 0;
      for (const e of rows) {
        a += Number(e.aportado_alec || 0);
        p += Number(e.aportado_pareja || 0);
      }
      setTotals({ alec: a, pareja: p });
    })();
  }, []);

  const balance = totals.alec - totals.pareja;

  return (
    <AuthGuard>
      <h1 className="text-2xl font-bold mb-4">💰 Balance actual</h1>
      {balance > 0 && <p>Tu pareja te debe {balance.toFixed(2)} €</p>}
      {balance < 0 && <p>Tú le debes {Math.abs(balance).toFixed(2)} €</p>}
      {balance === 0 && <p>Estáis a mano ✅</p>}

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded shadow">Tú has pagado: <b>{totals.alec.toFixed(2)} €</b></div>
        <div className="p-4 bg-white rounded shadow">Tu pareja ha pagado: <b>{totals.pareja.toFixed(2)} €</b></div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-3">Últimos gastos</h2>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-100 text-sm">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Alec (€)</th>
              <th className="px-3 py-2">Pareja (€)</th>
            </tr>
          </thead>
          <tbody>
            {expenses.slice(0,10).map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-3 py-2">{new Date(e.date).toLocaleDateString()}</td>
                <td className="px-3 py-2">{e.description}</td>
                <td className="px-3 py-2 text-green-700">{e.aportado_alec}</td>
                <td className="px-3 py-2 text-pink-700">{e.aportado_pareja}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AuthGuard>
  );
}
