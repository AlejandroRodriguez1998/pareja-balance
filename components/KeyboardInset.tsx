'use client';
import { useEffect } from 'react';

// En iOS el teclado se superpone a la página sin encogerla, así que tapa los modales
// anclados abajo. Publica su altura en --keyboard-inset para que el CSS los eleve
// y desplaza el campo enfocado a la vista cuando el teclado termina de abrirse.
export default function KeyboardInset() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;

    const update = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      root.style.setProperty('--keyboard-inset', `${Math.round(inset)}px`);
    };

    const revealFocused = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.matches('input, textarea, select') || !target.closest('.modal')) return;
      // Espera a que el teclado acabe de abrirse antes de recolocar el campo.
      setTimeout(() => target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 320);
    };

    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    document.addEventListener('focusin', revealFocused);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
      document.removeEventListener('focusin', revealFocused);
      root.style.removeProperty('--keyboard-inset');
    };
  }, []);

  return null;
}
