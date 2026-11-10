'use client';
import { useId } from 'react';

// Sombrero de copa rosa con la cruz blanca en el frente (estilo Chopper).
export default function ChopperHat({ className = '' }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-crown`} x1="0" x2="1">
          <stop stopColor="#ff9cc4" />
          <stop offset=".45" stopColor="#f76aa5" />
          <stop offset="1" stopColor="#d9437f" />
        </linearGradient>
        <linearGradient id={`${id}-brim`} x1="0" x2="1">
          <stop stopColor="#f27aac" />
          <stop offset="1" stopColor="#c7366f" />
        </linearGradient>
      </defs>

      {/* Ala */}
      <ellipse cx="32" cy="47" rx="25" ry="7.5" fill={`url(#${id}-brim)`} />
      {/* Copa */}
      <path d="M17.5 46C16.4 35 16.6 24 18.6 14.5Q32 9.5 45.4 14.5C47.4 24 47.6 35 46.5 46Q32 50.5 17.5 46Z" fill={`url(#${id}-crown)`} />
      {/* Tapa superior */}
      <ellipse cx="32" cy="14.5" rx="13.4" ry="4" fill="#ffb3d2" />
      {/* Cruz blanca */}
      <g transform="translate(32 31) rotate(45)">
        <rect x="-10" y="-3" width="20" height="6" rx="3" fill="#fff" />
        <rect x="-3" y="-10" width="6" height="20" rx="3" fill="#fff" />
      </g>
      {/* Brillo */}
      <path d="M21 18.5C20 26 20 34 20.6 41" stroke="#fff" strokeOpacity=".35" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    </svg>
  );
}
