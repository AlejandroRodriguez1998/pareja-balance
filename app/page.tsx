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

        <div className="landing-divider" />

        <div className="row g-4 mt-4">
          <div className="col-12 col-lg-4">
            <div className="landing-panel">
              <h3>Todo claro en una vista</h3>
              <p>
                Dashboard con balance actualizado, historial completo y gastos recientes con
                detalle por persona.
              </p>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="landing-panel">
              <h3>Plan semanal de comidas</h3>
              <p>
                Organiza la semana en minutos y evita improvisar. Cambia el dia de cada comida
                con un toque.
              </p>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="landing-panel">
              <h3>Sincronizado en tiempo real</h3>
              <p>
                Todo se actualiza al instante para ambos. Sin mensajes, sin dudas, sin lios.
              </p>
            </div>
          </div>
        </div>

        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-number">1</div>
            <div>
              <h4>Crea tu par</h4>
              <p>Entra con tu cuenta y conecta con tu pareja.</p>
            </div>
          </div>
          <div className="landing-step">
            <div className="landing-step-number">2</div>
            <div>
              <h4>Registra gastos</h4>
              <p>Divide pagos en segundos y guarda cada gasto con detalle.</p>
            </div>
          </div>
          <div className="landing-step">
            <div className="landing-step-number">3</div>
            <div>
              <h4>Consulta el balance</h4>
              <p>Saldo siempre visible para evitar discusiones.</p>
            </div>
          </div>
        </div>

        <div className="landing-testimonials">
          <div className="landing-testimonial">
            <p>“Por fin un balance claro, sin excels ni mensajes cada semana.”</p>
            <div className="landing-testimonial-user">
              <span className="landing-avatar">L</span>
              <div>
                <strong>Laura</strong>
                <span>Madrid</span>
              </div>
            </div>
          </div>
          <div className="landing-testimonial">
            <p>“La parte de comidas nos ha salvado entre semana.”</p>
            <div className="landing-testimonial-user">
              <span className="landing-avatar">J</span>
              <div>
                <strong>Javi</strong>
                <span>Valencia</span>
              </div>
            </div>
          </div>
          <div className="landing-testimonial">
            <p>“Rápido, limpio y se entiende a la primera.”</p>
            <div className="landing-testimonial-user">
              <span className="landing-avatar">M</span>
              <div>
                <strong>Mar</strong>
                <span>Sevilla</span>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-faq">
          <div className="landing-faq-item">
            <h4>¿Es gratis?</h4>
            <p>Si, puedes usar todas las funciones sin coste.</p>
          </div>
          <div className="landing-faq-item">
            <h4>¿Puedo editar gastos?</h4>
            <p>Claro, puedes editar o eliminar cualquier gasto cuando quieras.</p>
          </div>
          <div className="landing-faq-item">
            <h4>¿Se actualiza en tiempo real?</h4>
            <p>Si, lo que añadas se refleja al instante en ambos.</p>
          </div>
        </div>

        <div className="landing-cta-banner">
          <div>
            <h3>Empieza hoy y olvida discusiones de dinero</h3>
            <p>Tu balance en pareja, claro y compartido.</p>
          </div>
          <Link href="/login" className="btn btn-primary btn-lg">
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
