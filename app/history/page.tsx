'use client';
import AuthGuard from '@/component/AuthGuard';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function HistoryPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  return (
    <AuthGuard>
      <h1 className="text-2xl font-semibold mb-4">Historial</h1>
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
            {rows.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="px-3 py-2">{new Date(e.date).toLocaleString()}</td>
                <td className="px-3 py-2">{e.description}</td>
                <td className="px-3 py-2">{e.aportado_alec}</td>
                <td className="px-3 py-2">{e.aportado_pareja}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AuthGuard>
  );
}
