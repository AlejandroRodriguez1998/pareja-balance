'use client';
import { ReactNode, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AuthGuard({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace('/login');
      else setReady(true);
    });
    return () => unsub();
  }, [router]);

  if (!ready) return <div className="mt-10 text-center">Cargando...</div>;
  return <>{children}</>;
}
