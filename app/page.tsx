'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowRight, Cart3, Check2Square, CheckCircleFill, EggFried, HeartFill, LightningChargeFill, Wallet2 } from 'react-bootstrap-icons';
import LoadingScreen from '@/components/LoadingScreen';
import BrandMark from '@/components/BrandMark';

const features = [
  { icon: Wallet2, tone: 'blue', title: 'Balance claro', text: 'Quién ha pagado qué y cuánto os debéis, siempre al día.' },
  { icon: EggFried, tone: 'amber', title: 'Comidas de la semana', text: 'Planificad qué coméis y olvidaos del "¿qué hacemos hoy?".' },
  { icon: Check2Square, tone: 'green', title: 'Tareas compartidas', text: 'Repartid lo pendiente y tachadlo juntos.' },
  { icon: Cart3, tone: 'blue', title: 'Lista de la compra', text: 'Una lista para los dos, ordenada por categorías.' },
  { icon: HeartFill, tone: 'coral', title: 'Planes y deseos', text: 'Vuestro próximo plan, lo que queréis hacer y lo que ahorráis.' },
  { icon: LightningChargeFill, tone: 'green', title: 'Precio de la luz', text: 'Sabed cuándo está barata para poner la lavadora.' },
] as const;

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
    // Sin sesión no se muestra: se queda el fondo mientras Firebase responde.
    return <div className="session-only"><LoadingScreen message="Bienvenido de nuevo" /></div>;
  }

  return (
    <div className="landing">
      <header className="landing-bar">
        <span className="landing-brand"><BrandMark ring={false} className="landing-brand-mark" />Pareja Balance</span>
        <Link href="/login" className="landing-bar-link">Entrar</Link>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-pill"><HeartFill aria-hidden="true" /> Hecha para dos</span>
            <h1>Vuestra vida en común, <span>en equilibrio.</span></h1>
            <p>Gastos compartidos, comidas, tareas, planes y hasta el precio de la luz. Todo en un sitio y sincronizado entre los dos al instante.</p>
            <Link href="/login" className="landing-cta">Entrar <ArrowRight aria-hidden="true" /></Link>
          </div>

          <div className="landing-stage" aria-hidden="true">
            <div className="landing-stage-glow" />
            <BrandMark className="landing-stage-mark" />
            <div className="landing-float landing-float-balance">
              <small>Saldo a tu favor</small>
              <strong>+42,50 €</strong>
            </div>
            <div className="landing-float landing-float-meal">
              <span className="landing-float-icon is-amber"><EggFried /></span>
              <div><small>Hoy</small><strong>Lentejas</strong></div>
            </div>
            <div className="landing-float landing-float-task">
              <CheckCircleFill className="landing-float-check" />
              <strong>Bajar la basura</strong>
            </div>
            <div className="landing-float landing-float-light">
              <LightningChargeFill className="landing-float-bolt" />
              <strong>Luz barata hasta las 17:00</strong>
            </div>
          </div>
        </section>

        <section className="landing-features" aria-labelledby="landing-features-title">
          <h2 id="landing-features-title">Todo lo que compartís</h2>
          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, tone, title, text }) => (
              <article key={title} className="landing-feature">
                <span className={`landing-feature-icon is-${tone}`}><Icon aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-final">
          <BrandMark ring={false} className="landing-final-mark" />
          <h2>¿Empezamos?</h2>
          <Link href="/login" className="landing-cta">Entrar <ArrowRight aria-hidden="true" /></Link>
        </section>
      </main>
    </div>
  );
}
