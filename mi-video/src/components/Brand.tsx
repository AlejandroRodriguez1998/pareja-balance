import {useCurrentFrame, useVideoConfig, spring} from 'remotion';
import OriginalBrandMark from './OriginalBrandMark';
import {C, fontFamily} from '../theme';

// Exact SVG geometry and gradients copied from the application's BrandMark.tsx.
export const Brand = ({size = 64, wordmark = true, animated = false}: {size?: number; wordmark?: boolean; animated?: boolean}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <div style={{display: 'flex', alignItems: 'center', gap: size * 0.2, fontFamily, color: C.white}}>
    <div style={{width: size, height: size, flexShrink: 0, scale: animated ? spring({frame, fps, config: {damping: 18, stiffness: 72}}) : 1, rotate: animated ? `${Math.sin(frame / 65) * 2}deg` : '0deg'}}>
      <OriginalBrandMark ring={false} className="video-brand" />
    </div>
    {wordmark ? <span style={{fontSize: size * 0.43, fontWeight: 750, letterSpacing: '-0.045em', whiteSpace: 'nowrap'}}>Pareja Balance</span> : null}
  </div>;
};
