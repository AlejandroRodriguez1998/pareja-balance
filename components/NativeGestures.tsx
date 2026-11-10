'use client';
import { useEffect } from 'react';

// Safari en iOS ignora user-scalable=no y deja hacer zoom con dos dedos.
// Se bloquean sus gestos de pellizco para que la PWA se comporte como una app nativa.
export default function NativeGestures() {
  useEffect(() => {
    const prevent = (event: Event) => event.preventDefault();
    const preventPinch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    document.addEventListener('gesturestart', prevent);
    document.addEventListener('gesturechange', prevent);
    document.addEventListener('touchmove', preventPinch, { passive: false });
    return () => {
      document.removeEventListener('gesturestart', prevent);
      document.removeEventListener('gesturechange', prevent);
      document.removeEventListener('touchmove', preventPinch);
    };
  }, []);

  return null;
}
