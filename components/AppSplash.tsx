'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import LoadingScreen from '@/components/LoadingScreen';

const MIN_VISIBLE_MS = 1600;
const FADE_OUT_MS = 500;
// Misma clave que lee el script de tema en app/layout.tsx.
const SESSION_HINT_KEY = 'pareja-balance-session';

// Se monta una sola vez en el layout raíz: aparece al abrir o recargar la app,
// pero no en las navegaciones internas. Solo se muestra con la sesión iniciada:
// el script del layout lee SESSION_HINT_KEY antes de pintar y la oculta por CSS
// si no hay sesión; aquí se mantiene esa marca al día con Firebase.
export default function AppSplash() {
  const [phase, setPhase] = useState<'visible' | 'leaving' | 'hidden'>('visible');

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const startedAt = Date.now();
    let decided = false;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (user) localStorage.setItem(SESSION_HINT_KEY, '1');
        else localStorage.removeItem(SESSION_HINT_KEY);
      } catch {}
      document.documentElement.dataset.session = user ? 'yes' : 'no';

      // La marca se sigue actualizando, pero la splash solo se decide con la primera respuesta.
      if (decided) return;
      decided = true;
      if (!user) {
        setPhase('hidden');
        return;
      }
      const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt));
      timers.push(setTimeout(() => setPhase('leaving'), remaining));
      timers.push(setTimeout(() => setPhase('hidden'), remaining + FADE_OUT_MS));
    });
    return () => {
      unsubscribe();
      timers.forEach(clearTimeout);
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div className={`app-splash${phase === 'leaving' ? ' app-splash-leaving' : ''}`}>
      <LoadingScreen message="Preparando todo" />
    </div>
  );
}
