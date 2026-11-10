import type {CSSProperties} from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, C} from '../theme';

type PhoneProps = {
  screen: string; nextScreen?: string; switchAt?: number; width?: number;
  x?: number; y?: number; angle?: number; delay?: number; float?: boolean;
};

export const Phone = ({screen, nextScreen, switchAt = 120, width = 350, x = 1220, y = 162, angle = -4, delay = 8, float = true}: PhoneProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - delay, fps, config: {damping: 23, stiffness: 80, mass: 1.2}});
  const height = width * 900 / 430;
  return <div style={{position: 'absolute', left: x, top: y, width: width + 18, height: height + 18, padding: 8, borderRadius: 47, background: 'linear-gradient(145deg, #69727b, #191e26 18%, #3c444f 60%, #0a0c11)', border: '1px solid #ffffff30', boxShadow: '0 45px 90px #0009, inset 0 0 0 2px #ffffff10', opacity: interpolate(frame - delay, [0, 20], [0, 1], clamp), translate: `0 ${(1 - enter) * 150 + (float ? Math.sin(frame / 65) * 7 : 0)}px`, scale: float ? interpolate(frame, [35, 300], [1, 1.045], clamp) : 1, transform: `perspective(1600px) rotateY(${(1 - enter) * 15}deg) rotateZ(${angle + Math.sin(frame / 120) * 0.6}deg)`}}>
    <div style={{position: 'relative', width, height, overflow: 'hidden', borderRadius: 38, background: C.bg, border: '1px solid #000'}}>
      <Img src={staticFile(`screens/${screen}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      {nextScreen ? <Img src={staticFile(`screens/${nextScreen}.png`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: interpolate(frame, [switchAt, switchAt + 14], [0, 1], clamp)}} /> : null}
      <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: 2, background: '#ffffff28'}} />
    </div>
    <div style={{position: 'absolute', left: -3, top: 125, height: 55, width: 3, background: '#5a626d', borderRadius: 3}} />
    <div style={{position: 'absolute', right: -3, top: 175, height: 65, width: 3, background: '#5a626d', borderRadius: 3}} />
  </div>;
};

export const Laptop = ({screen = 'dashboard-desktop', x = 770, y = 265, width = 990, delay = 0}: {screen?: string; x?: number; y?: number; width?: number; delay?: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - delay, fps, config: {damping: 25, stiffness: 70}});
  return <div style={{position: 'absolute', left: x, top: y, width, translate: `0 ${(1 - enter) * 130 + Math.sin(frame / 110) * 5}px`, opacity: interpolate(frame - delay, [0, 22], [0, 1], clamp), transform: `perspective(1900px) rotateY(${-8 + enter * 6}deg) rotateX(${(1 - enter) * 8}deg) rotateZ(-1deg)`}}>
    <div style={{border: '2px solid #59616e', padding: 12, paddingTop: 22, borderRadius: '24px 24px 10px 10px', background: '#080b10', boxShadow: '0 45px 120px #0008'}}>
      <div style={{position: 'absolute', top: 8, left: '50%', width: 6, height: 6, background: '#37424e', borderRadius: 10}} />
      <Img src={staticFile(`screens/${screen}.png`)} style={{width: '100%', display: 'block', borderRadius: 3}} />
    </div>
    <div style={{position: 'relative', marginLeft: '-5%', width: '110%', height: 23, background: 'linear-gradient(#88909c, #424c59 45%, #202733)', border: '1px solid #ffffff25', borderRadius: '2px 2px 70% 70%', boxShadow: '0 30px 50px #0009'}}><div style={{margin: '0 auto', width: '16%', height: 7, background: '#252b34', borderRadius: '0 0 12px 12px'}} /></div>
  </div>;
};

export const LiftedCard = ({screen, x, y, width, delay = 35, exitAt = 10000, style}: {screen: string; x: number; y: number; width: number; delay?: number; exitAt?: number; style?: CSSProperties}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame: frame - delay, fps, config: {damping: 22, stiffness: 90}});
  return <div style={{position: 'absolute', left: x, top: y, width, borderRadius: 28, overflow: 'hidden', border: '1px solid #ffffff26', boxShadow: '0 30px 80px #0008, 0 0 60px #137eff12', opacity: interpolate(frame, [delay, delay + 16, exitAt, exitAt + 16], [0, 1, 1, 0], clamp), translate: `0 ${(1 - enter) * 70 + Math.sin(frame / 90) * 4}px`, scale: 0.94 + enter * 0.06, ...style}}><Img src={staticFile(`screens/${screen}.png`)} style={{width: '100%', display: 'block'}} /></div>;
};
