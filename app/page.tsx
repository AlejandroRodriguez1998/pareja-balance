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
        <div
          className="card shadow-lg border-0 d-flex justify-content-center align-items-center text-center p-4"
          style={{
            width: '18rem',
            height: '20rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <img
            src="/icon-96x96.png"
            alt="Logo"
            width="80"
            height="80"
            className="mb-3"
            style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' }}
          />

          <h4 className="fw-bold text-light mb-2">Pareja Balance</h4>

          <p className="text-light mb-3" style={{ fontSize: '0.95rem', opacity: 0.8 }}>
            Bienvenido de nuevo
          </p>

          <div className="spinner-border text-light mt-2" role="status"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="landing-hero">
      <div className="landing-glow landing-glow-a" />
      <div className="landing-glow landing-glow-b" />
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-12 col-lg-6 text-center text-lg-start">
            <div className="landing-badge">
              <img src="/icon-96x96.png" alt="Logo" width="26" height="26" />
              <span>Tu economia en pareja, sin fricciones</span>
            </div>
            <h1 className="landing-title">
              Gestiona gastos en pareja sin discusiones y con claridad real.
            </h1>
            <p className="landing-subtitle">
              Distribuye pagos, revisa el historial y manten el balance al dia con un panel
              limpio y rapido.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
              <Link href="/login" className="btn btn-primary btn-lg landing-cta">
                Iniciar sesion
              </Link>
              <Link href="/dashboard" className="btn btn-outline-primary btn-lg landing-ghost">
                Ver ejemplo
              </Link>
            </div>
            <div className="landing-meta">
              <div>
                <div className="landing-meta-title">Rapido</div>
                <div className="landing-meta-text">Registra gastos en segundos.</div>
              </div>
              <div>
                <div className="landing-meta-title">Equitativo</div>
                <div className="landing-meta-text">Balance claro y sin lios.</div>
              </div>
              <div>
                <div className="landing-meta-title">Compartido</div>
                <div className="landing-meta-text">Acceso desde cualquier lugar.</div>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="landing-card">
              <div className="landing-card-header">
                <div>
                  <h4>Pareja Balance</h4>
                  <p>Resumen semanal sincronizado</p>
                </div>
                <span className="landing-pill">Live</span>
              </div>
              <div className="landing-card-body">
                <div className="landing-stat">
                  <div className="landing-stat-label">Balance actual</div>
                  <div className="landing-stat-value">+42,50 EUR</div>
                </div>
                <div className="landing-progress">
                  <div className="landing-progress-fill" />
                </div>
                <div className="landing-list">
                  <div className="landing-list-item">
                    <span>Cena viernes</span>
                    <span className="text-success">+18,00</span>
                  </div>
                  <div className="landing-list-item">
                    <span>Supermercado</span>
                    <span className="text-danger">-24,00</span>
                  </div>
                  <div className="landing-list-item">
                    <span>Gasolina</span>
                    <span className="text-success">+7,50</span>
                  </div>
                </div>
                <div className="landing-card-footer">
                  <div className="landing-avatar-group">
                    <span className="landing-avatar">A</span>
                    <span className="landing-avatar">M</span>
                  </div>
                  <span className="landing-muted">Sincronizado hace 2 min</span>
                </div>
              </div>
            </div>
            <div className="landing-note">
              Planifica comidas, revisa historial y controla el balance en un mismo lugar.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
