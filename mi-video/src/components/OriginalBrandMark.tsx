'use client';
import { useId } from 'react';

// Logo animado: las dos tarjetas se balancean como una báscula y el corazón late.
// Los ids de los degradados son únicos para poder pintar varios logos a la vez.
export default function BrandMark({ className = '', ring = true }: { className?: string; ring?: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const ref = (name: string) => `url(#${id}-${name})`;

  return (
    <svg className={`app-loading-mark ${className}`} viewBox="0 0 1024 1024" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-blue`} x2="1" y2="1">
          <stop stopColor="#3ADAF4" />
          <stop offset=".4" stopColor="#137EFF" />
          <stop offset="1" stopColor="#073BFA" />
        </linearGradient>
        <linearGradient id={`${id}-green`} x2="1" y2="1">
          <stop stopColor="#55F1A3" />
          <stop offset=".5" stopColor="#08D58A" />
          <stop offset="1" stopColor="#00B984" />
        </linearGradient>
        <linearGradient id={`${id}-heart`} y2="1">
          <stop stopColor="#FF776F" />
          <stop offset=".4" stopColor="#FF3F58" />
          <stop offset="1" stopColor="#C8004A" />
        </linearGradient>
        <linearGradient id={`${id}-ring`} x2="1" y2="1">
          <stop stopColor="#3ADAF4" />
          <stop offset=".5" stopColor="#08D58A" />
          <stop offset="1" stopColor="#FF3F58" />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-25%" y="-25%" width="150%" height="165%">
          <feDropShadow dy="18" stdDeviation="20" floodOpacity=".35" />
        </filter>
      </defs>

      {ring && <>
        <circle className="app-loading-track" cx="512" cy="512" r="480" />
        <circle className="app-loading-ring" cx="512" cy="512" r="480" stroke={ref('ring')} />
      </>}

      <g filter={ref('shadow')}>
        <g className="app-loading-card-left">
          <rect x="216" y="286" width="368" height="458" rx="72" fill={ref('blue')} transform="rotate(-43 400 515)" />
          <rect x="253" y="353" width="126" height="68" rx="19" fill="white" fillOpacity=".88" transform="rotate(-43 316 387)" />
        </g>
        <g className="app-loading-card-right">
          <rect x="440" y="286" width="368" height="458" rx="72" fill={ref('green')} transform="rotate(43 624 515)" />
          <rect x="645" y="353" width="126" height="68" rx="19" fill="white" fillOpacity=".88" transform="rotate(43 708 387)" />
        </g>
      </g>

      <g className="app-loading-heart" filter={ref('shadow')}>
        <path d="M512 713 379 584c-54-52-62-126-18-171 40-41 105-40 151 8 46-48 111-49 151-8 44 45 36 119-18 171L512 713Z" fill={ref('heart')} />
        <rect className="app-loading-equal app-loading-equal-a" x="436" y="491" width="152" height="38" rx="19" fill="white" />
        <rect className="app-loading-equal app-loading-equal-b" x="436" y="551" width="152" height="38" rx="19" fill="white" />
      </g>
    </svg>
  );
}
