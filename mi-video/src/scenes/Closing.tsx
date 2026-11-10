import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop} from '../components/Stage';
import {Brand} from '../components/Brand';
import {Reveal} from '../components/Motion';
import {C, clamp, fontFamily} from '../theme';

export const Closing = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill data-video-stage="" style={{fontFamily, color: C.white, alignItems: 'center'}}>
    <Backdrop accent={C.green} />
    <div style={{position: 'absolute', top: 135, width: '100%', display: 'flex', justifyContent: 'center'}}><Brand size={260} wordmark={false} animated /></div>
    <Reveal delay={25} style={{position: 'absolute', top: 400, width: '100%', textAlign: 'center', fontSize: 92, fontWeight: 750, letterSpacing: '-0.065em'}}>Pareja Balance.</Reveal>
    <Reveal delay={43} style={{position: 'absolute', top: 550, width: '100%', textAlign: 'center', fontSize: 64, lineHeight: 1.22, fontWeight: 550, letterSpacing: '-0.045em'}}>Más equilibrio,<br /><span style={{color: C.cyan}}>menos complicaciones.</span></Reveal>
    <Reveal delay={80} style={{position: 'absolute', top: 786, left: 660, width: 600, height: 78, borderRadius: 22, background: 'linear-gradient(120deg, #137eff, #087ac4 65%, #08ad90)', boxShadow: '0 12px 55px #137eff25, inset 0 1px 0 #ffffff40', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 25, fontSize: 29, fontWeight: 650}}>Descubrid Pareja Balance <span style={{fontSize: 36}}>↗</span></Reveal>
    <div style={{position: 'absolute', bottom: 114, color: C.muted, fontSize: 20, opacity: interpolate(frame, [100, 125], [0, 1], clamp)}}>Vuestra vida en común, en equilibrio.</div>
  </AbsoluteFill>;
};
