'use client';
import { useEffect } from 'react';

const TEXT_FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea';

// Con un modal abierto, el teclado del móvil tapa la hoja anclada abajo.
// Publica su altura en --keyboard-inset para que el CSS eleve solo la hoja,
// y mantiene la app de fondo fija mientras el modal está abierto.
export default function KeyboardInset() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;

    const body = document.body;
    const isModalOpen = () => body.classList.contains('modal-open');

    const update = () => {
      const inset = isModalOpen() ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0;
      root.style.setProperty('--keyboard-inset', `${Math.round(inset)}px`);
    };

    // Fondo bloqueado: overflow hidden no basta en iOS, así que se fija el body
    // en la posición actual y se restaura al cerrar el modal.
    let lockedScrollY: number | null = null;
    const syncLock = () => {
      if (isModalOpen() && lockedScrollY === null) {
        lockedScrollY = window.scrollY;
        Object.assign(body.style, { position: 'fixed', top: `-${lockedScrollY}px`, left: '0', right: '0', width: '100%' });
      } else if (!isModalOpen() && lockedScrollY !== null) {
        const y = lockedScrollY;
        lockedScrollY = null;
        Object.assign(body.style, { position: '', top: '', left: '', right: '', width: '' });
        window.scrollTo(0, y);
        update();
      }
    };
    const bodyObserver = new MutationObserver(syncLock);
    bodyObserver.observe(body, { attributes: true, attributeFilter: ['class'] });

    // Si iOS llega a desplazar la vista mientras sube el teclado, se devuelve a su
    // sitio en cada fotograma de la animación, en vez de una sola vez al final.
    let pinFrame = 0;
    const pinViewport = () => {
      cancelAnimationFrame(pinFrame);
      const until = performance.now() + 700;
      const step = () => {
        if (!isModalOpen()) return;
        if (viewport.offsetTop > 0 || window.scrollY > 0) window.scrollTo(0, 0);
        update();
        if (performance.now() < until) pinFrame = requestAnimationFrame(step);
      };
      step();
    };
    const onViewportChange = () => {
      update();
      if (isModalOpen()) pinViewport();
    };

    // iOS desplaza toda la vista al enfocar un campo que quedaría bajo el teclado.
    // Se enfoca el campo mientras está fuera de la pantalla por arriba, así Safari
    // no ve nada que desplazar, y se devuelve a su sitio en el mismo instante.
    let touchStart: { x: number; y: number } | null = null;
    const rememberTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
    };

    const focusWithoutPan = (event: TouchEvent) => {
      // Solo toques: si el dedo se ha desplazado, era un scroll y no se enfoca nada.
      const touch = event.changedTouches[0];
      if (!touch || !touchStart || Math.hypot(touch.clientX - touchStart.x, touch.clientY - touchStart.y) > 10) return;
      const field = (event.target as HTMLElement | null)?.closest<HTMLInputElement | HTMLTextAreaElement>(TEXT_FIELD);
      if (!field || field.disabled || field.readOnly || document.activeElement === field || !field.closest('.custom-modal-bg')) return;
      event.preventDefault();
      field.style.transform = 'translateY(-100000px)';
      field.focus({ preventScroll: true });
      requestAnimationFrame(() => { field.style.transform = ''; });
    };

    // Si el campo enfocado queda tapado, desplaza solo el contenido del modal.
    const revealFocused = (event: FocusEvent) => {
      const target = event.target as HTMLElement | null;
      const sheet = target?.closest<HTMLElement>('.custom-modal-bg');
      if (!target?.matches(TEXT_FIELD) || !sheet) return;
      pinViewport();
      setTimeout(() => {
        const field = target.getBoundingClientRect();
        const visible = sheet.getBoundingClientRect();
        if (field.top >= visible.top && field.bottom <= visible.bottom) return;
        sheet.scrollBy({ top: field.top - visible.top - 24, behavior: 'smooth' });
      }, 350);
    };

    update();
    syncLock();
    viewport.addEventListener('resize', onViewportChange);
    viewport.addEventListener('scroll', onViewportChange);
    document.addEventListener('touchstart', rememberTouch, { passive: true });
    document.addEventListener('touchend', focusWithoutPan, { passive: false });
    document.addEventListener('focusin', revealFocused);
    return () => {
      viewport.removeEventListener('resize', onViewportChange);
      viewport.removeEventListener('scroll', onViewportChange);
      bodyObserver.disconnect();
      cancelAnimationFrame(pinFrame);
      document.removeEventListener('touchstart', rememberTouch);
      document.removeEventListener('touchend', focusWithoutPan);
      document.removeEventListener('focusin', revealFocused);
      root.style.removeProperty('--keyboard-inset');
    };
  }, []);

  return null;
}
