import type {CSSProperties, ReactNode} from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from '../theme';

export const Reveal = ({children, delay = 0, style, distance = 42}: {
  children: ReactNode; delay?: number; style?: CSSProperties; distance?: number;
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame: frame - delay, fps, config: {damping: 23, stiffness: 100, mass: 1.1}});
  return <div data-video-copy="" style={{...style, opacity: interpolate(frame - delay, [0, 18], [0, 1], clamp), translate: `0 ${(1 - progress) * distance}px`}}>{children}</div>;
};

export const Tap = ({at, x, y, color = '#3adaf4'}: {at: number; x: number; y: number; color?: string}) => {
  const frame = useCurrentFrame();
  return <div style={{position: 'absolute', left: x - 35, top: y - 35, width: 70, height: 70, borderRadius: '50%', border: `3px solid ${color}`, background: `${color}25`, opacity: interpolate(frame, [at - 8, at, at + 22], [0, 0.9, 0], clamp), scale: interpolate(frame, [at - 8, at + 22], [0.3, 1.6], clamp), pointerEvents: 'none'}} />;
};
