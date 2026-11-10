import type {ReactNode} from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {C, clamp, fontFamily} from '../theme';
import {Brand} from './Brand';

export const Backdrop = ({accent = C.blue}: {accent?: string}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at ${68 + Math.sin(frame / 180) * 8}% 40%, ${accent}21, transparent 55%), radial-gradient(ellipse at 8% 110%, #ff3f580c, transparent 48%)`}} />
    <div style={{position: 'absolute', width: 980, height: 980, left: 980, top: 100, border: '1px solid #ffffff07', borderRadius: '50%', scale: interpolate(frame, [0, 450], [0.94, 1.08], clamp)}} />
    <div style={{position: 'absolute', width: 720, height: 720, left: 1110, top: 230, border: `1px solid ${accent}12`, borderRadius: '50%'}} />
    <div style={{position: 'absolute', width: 1, left: 157, top: 150, height: 770, background: 'linear-gradient(transparent, #ffffff09, transparent)'}} />
  </AbsoluteFill>;
};

export const Stage = ({children, accent = C.blue, chapter}: {children: ReactNode; accent?: string; chapter?: string}) => <AbsoluteFill data-video-stage="" style={{fontFamily, color: C.white, overflow: 'hidden'}}>
  <Backdrop accent={accent} />
  <div style={{position: 'absolute', top: 83, left: 184}}><Brand size={54} /></div>
  {chapter ? <div style={{position: 'absolute', top: 107, right: 192, color: C.muted, letterSpacing: '0.19em', fontSize: 16, fontWeight: 600}}>{chapter}</div> : null}
  {children}
</AbsoluteFill>;

export const Kicker = ({children, color = C.cyan}: {children: ReactNode; color?: string}) => <div style={{fontSize: 20, fontWeight: 700, letterSpacing: '0.18em', color, display: 'flex', alignItems: 'center', gap: 14}}><span style={{height: 6, width: 26, borderRadius: 4, background: color}} />{children}</div>;

export const FeatureFooter = ({index, color}: {index: number; color: string}) => <div style={{position: 'absolute', left: index === 2 ? 962 : 192, bottom: 112, display: 'flex', gap: 12, alignItems: 'center'}}>
  {[0, 1, 2, 3].map((i) => <div key={i} style={{height: 4, width: i === index ? 76 : 32, background: i === index ? color : '#ffffff28', borderRadius: 4}} />)}
  <span style={{fontSize: 16, marginLeft: 12, color: '#aeb6c2'}}>HECHA PARA DOS</span>
</div>;
