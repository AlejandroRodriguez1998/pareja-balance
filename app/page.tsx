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
     <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
        <div className="card shadow-lg border-0 d-flex justify-content-center align-items-center text-center p-4"
        style={{width: '18rem',height: '20rem', backgroundColor: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(6px)',}}>
          <img src="/icon-96x96.png" alt="Logo" width="80" height="80" className="mb-3" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' }}/>

          <h4 className="fw-bold mb-2">Pareja Balance</h4>

          <p className="text-light mb-3"
            style={{ fontSize: '0.95rem', opacity: 0.8 }}
          >
            Bienvenido de nuevo
          </p>

          <div className="spinner-border text-light mt-2" role="status"></div>
        </div>
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
