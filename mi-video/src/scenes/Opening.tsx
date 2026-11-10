import {interpolate, useCurrentFrame, spring, useVideoConfig, Sequence} from 'remotion';
import {Brand} from '../components/Brand';
import {Stage, Kicker} from '../components/Stage';
import {Reveal} from '../components/Motion';
import {Laptop, Phone} from '../components/Devices';
import {C, clamp} from '../theme';

const Team = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame, fps, config: {damping: 24, stiffness: 115}});
  return <div style={{position: 'absolute', inset: 0, opacity: interpolate(frame, [0, 6, 39, 53], [0.1, 1, 1, 0], clamp), translate: `0 ${interpolate(frame, [39, 54], [0, -30], clamp)}px`}}>
    <div style={{position: 'absolute', left: 0, top: 355, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 42, fontSize: 150, fontWeight: 750, letterSpacing: '-0.065em'}}>
      <span style={{color: C.cyan, translate: `${(1 - progress) * -45}px 0`}}>Tú</span>
      <span style={{fontSize: 90, fontWeight: 400, color: '#ffffff70', letterSpacing: 0}}>+</span>
      <span style={{color: C.green, translate: `${(1 - progress) * 45}px 0`}}>tu pareja</span>
    </div>
    <div style={{position: 'absolute', left: 480, top: 560, width: 960, height: 3, background: `linear-gradient(90deg, ${C.cyan}, ${C.green})`, scale: `${progress} 1`}} />
    <Reveal delay={8} style={{position: 'absolute', left: 0, top: 615, width: '100%', textAlign: 'center', fontSize: 60, fontWeight: 550, letterSpacing: '-0.045em'}}>Un mismo equipo.</Reveal>
  </div>;
};

const Question = ({text, x, y, delay, color}: {text: string; x: number; y: number; delay: number; color: string}) => <Reveal delay={delay} distance={22} style={{position: 'absolute', left: x, top: y, padding: '17px 24px', border: `1px solid ${color}50`, borderRadius: 19, color, fontSize: 25, fontWeight: 600, background: '#151b24', boxShadow: '0 14px 35px #0004'}}>{text}</Reveal>;

const Statement = () => <>
  <Reveal delay={0} style={{position: 'absolute', left: 192, top: 220}}><Kicker>HECHA PARA DOS</Kicker></Reveal>
  <Reveal delay={4} style={{position: 'absolute', left: 184, top: 290, fontSize: 104, fontWeight: 750, lineHeight: 1.08, letterSpacing: '-0.065em'}}>Compartir la vida<br />es fácil.</Reveal>
  <Reveal delay={27} style={{position: 'absolute', left: 190, top: 580, fontSize: 76, fontWeight: 650, lineHeight: 1.13, letterSpacing: '-0.05em', color: C.cyan}}>Organizarla juntos,<br />ahora también.</Reveal>
  <div style={{position: 'absolute', left: 1230, top: 350}}><Brand size={350} wordmark={false} animated /></div>
  <Question text="¿Quién ha pagado?" x={1180} y={250} delay={6} color={C.cyan} />
  <Question text="¿Qué comemos hoy?" x={1130} y={720} delay={26} color={C.green} />
  <Question text="¿A quién le toca?" x={1350} y={820} delay={46} color="#ff8a8e" />
</>;

export const Opening = () => {
  const {fps} = useVideoConfig();
  return <Stage chapter="VUESTRA VIDA EN COMÚN">
    <Sequence name="Tú y tu pareja" durationInFrames={1.8 * fps}><Team /></Sequence>
    <Sequence name="Tres preguntas alrededor de la marca" from={1.3 * fps} durationInFrames={5.3 * fps}><Statement /></Sequence>
  </Stage>;
};

export const Introduction = () => <Stage chapter="TODO EN UN SITIO" accent={C.green}>
  <Reveal delay={12} style={{position: 'absolute', left: 192, top: 270}}><Kicker>ES PAREJA BALANCE</Kicker></Reveal>
  <Reveal delay={24} style={{position: 'absolute', left: 184, top: 345, fontSize: 104, fontWeight: 750, lineHeight: 1.08, letterSpacing: '-0.06em'}}>Vuestra vida.<br />En común.</Reveal>
  <Reveal delay={47} style={{position: 'absolute', left: 192, top: 625, width: 530, fontSize: 33, lineHeight: 1.5, color: C.muted}}>Gastos, comidas, tareas y planes.<br />Un lugar para organizaros juntos.</Reveal>
  <Laptop screen="landing-desktop" width={880} x={842} y={245} delay={8} />
  <Phone screen="dashboard-mobile" width={270} x={1345} y={420} angle={4} delay={24} />
  <Reveal delay={51} style={{position: 'absolute', left: 192, bottom: 130, display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, color: C.green}}><span style={{width: 8, height: 8, background: C.green, borderRadius: '50%'}} />Compartido entre los dos</Reveal>
</Stage>;
