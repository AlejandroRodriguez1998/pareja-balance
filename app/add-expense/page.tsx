'use client';
import AuthGuard from '@/component/AuthGuard';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AddExpensePage() {
  const [description, setDescription] = useState('');
  const [aportadoAlec, setAportadoAlec] = useState('');
  const [aportadoPareja, setAportadoPareja] = useState('');
  const router = useRouter();

  async function save() {
    const user = auth.currentUser;
    if (!user) return alert('No autenticado');

    await addDoc(collection(db, 'expenses'), {
      user_id: user.uid,
      description,
      aportado_alec: Number(aportadoAlec || 0),
      aportado_pareja: Number(aportadoPareja || 0),
      date: new Date().toISOString()
    });

    router.push('/dashboard');
  }

  return (
    <AuthGuard>
      <h1 className="text-2xl font-semibold mb-4">Añadir gasto</h1>
      <div className="bg-white p-6 rounded shadow max-w-md">
        <label className="block text-sm mb-1">Descripción</label>
        <input className="input mb-3" onChange={e=>setDescription(e.target.value)} />

        <label className="block text-sm mb-1">Aportado por Alec (€)</label>
        <input className="input mb-3" type="number" onChange={e=>setAportadoAlec(e.target.value)} />

        <label className="block text-sm mb-1">Aportado por tu pareja (€)</label>
        <input className="input mb-4" type="number" onChange={e=>setAportadoPareja(e.target.value)} />

        <button onClick={save} className="btn-primary w-full">Guardar</button>
      </div>
    </AuthGuard>
  );
}
