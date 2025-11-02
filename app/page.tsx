'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white">
        <img src="/icon-192x192.png" alt="Logo" width="80" height="80" className="mb-3" />
        <h4 className="fw-bold">Pareja Balance</h4>
        <div className="spinner-border text-light mt-3" role="status"></div>
      </div>
    );
  }

  // 🔹 Si no hay sesión, renderizamos la portada normal
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
