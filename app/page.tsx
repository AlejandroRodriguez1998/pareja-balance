'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.replace('/dashboard');
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <div className="container text-center mt-5">
      <h1 className="display-5 fw-bold text-primary">💸 Pareja Balance</h1>
      <p className="lead mt-3">
        Lleva el control de tus gastos en pareja de forma sencilla y equitativa.
      </p>
      <div className="mt-4">
        <Link href="/login" className="btn btn-primary btn-lg mx-2">
          Iniciar sesión
        </Link>
        <Link href="/dashboard" className="btn btn-outline-primary btn-lg mx-2">
          Ver ejemplo
        </Link>
      </div>
    </div>
  );
}
