'use client';
import { useEffect } from 'react';

// Con un modal abierto, el teclado del móvil tapa la hoja anclada abajo.
// Publica su altura en --keyboard-inset para que el CSS eleve solo la hoja,
// sin mover ni encoger el resto de la app.
export default function KeyboardInset() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;

    const update = () => {
      const modalOpen = document.body.classList.contains('modal-open');
      // iOS desplaza toda la vista hacia arriba al enfocar un campo; con un modal
      // abierto se devuelve a su sitio para que la app de fondo no "suba".
      if (modalOpen && viewport.offsetTop > 0) window.scrollTo(0, 0);
      const inset = modalOpen ? Math.max(0, window.innerHeight - viewport.height) : 0;
      root.style.setProperty('--keyboard-inset', `${Math.round(inset)}px`);
    };

    // Si el campo enfocado queda tapado, desplaza solo el contenido del modal.
    const revealFocused = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      const sheet = target?.closest<HTMLElement>('.custom-modal-bg');
      if (!target?.matches('input, textarea, select') || !sheet) return;
      setTimeout(() => {
        const field = target.getBoundingClientRect();
        const visible = sheet.getBoundingClientRect();
        if (field.top >= visible.top && field.bottom <= visible.bottom) return;
        sheet.scrollBy({ top: field.top - visible.top - 24, behavior: 'smooth' });
      }, 320);
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
