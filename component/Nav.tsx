'use client';
import { auth } from '@/lib/firebase';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => onAuthStateChanged(auth, setUser), []);

  return (
    <nav className="border-b bg-white">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">ParejaBalance</Link>
        <div className="flex items-center gap-3">
          {user && <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/add-expense">Añadir</Link>
            <Link href="/history">Historial</Link>
            <button
              className="px-3 py-1 rounded bg-neutral-200"
              onClick={() => signOut(auth)}
            >Salir</button>
          </>}
          {!user && <Link href="/login" className="px-3 py-1 rounded bg-blue-600 text-white">Entrar</Link>}
        </div>
      </div>
    </nav>
  );
}
