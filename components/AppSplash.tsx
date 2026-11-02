'use client';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

const MIN_VISIBLE_MS = 1600;
const FADE_OUT_MS = 500;

// Se monta una sola vez en el layout raíz: aparece al abrir o recargar la app,
// pero no en las navegaciones internas.
export default function AppSplash() {
  const [phase, setPhase] = useState<'visible' | 'leaving' | 'hidden'>('visible');

  useEffect(() => {
    const leave = setTimeout(() => setPhase('leaving'), MIN_VISIBLE_MS);
    const hide = setTimeout(() => setPhase('hidden'), MIN_VISIBLE_MS + FADE_OUT_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(hide);
    };
  }, []);

  if (phase === 'hidden') return null;

  return (
    <div className={`app-splash${phase === 'leaving' ? ' app-splash-leaving' : ''}`}>
      <LoadingScreen message="Preparando todo" />
    </div>
  );
}
