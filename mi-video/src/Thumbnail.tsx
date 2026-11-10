import {AbsoluteFill} from 'remotion';
import {Backdrop, Kicker} from './components/Stage';
import {Brand} from './components/Brand';
import {Phone} from './components/Devices';
import {C, fontFamily} from './theme';

export const Thumbnail = () => <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
  <div style={{width: 1920, height: 1080, position: 'absolute', transform: 'scale(0.6666666667)', transformOrigin: 'top left', color: C.white, fontFamily}}>
    <Backdrop />
    <div style={{position: 'absolute', top: 115, left: 150}}><Brand size={83} /></div>
    <div style={{position: 'absolute', top: 320, left: 155}}><Kicker>HECHA PARA DOS</Kicker></div>
    <div style={{position: 'absolute', top: 400, left: 145, fontSize: 125, fontWeight: 800, letterSpacing: '-0.065em', lineHeight: 1.08}}>Más equilibrio.<br /><span style={{color: C.cyan}}>Menos líos.</span></div>
    <div style={{position: 'absolute', left: 155, top: 760, fontSize: 32, color: C.muted}}>Gastos · Comidas · Tareas · Planes</div>
    <Phone screen="dashboard-mobile" width={365} x={1210} y={130} angle={-6} delay={-100} float={false} />
  </div>
</AbsoluteFill>;
