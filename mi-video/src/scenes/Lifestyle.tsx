import {Sequence, useVideoConfig} from 'remotion';
import {Stage, Kicker} from '../components/Stage';
import {Phone, Laptop, LiftedCard} from '../components/Devices';
import {Reveal, Tap} from '../components/Motion';
import {C} from '../theme';

const MomentCopy = ({label, title, copy}: {label: string; title: string; copy: string}) => <>
  <Reveal delay={5} style={{position: 'absolute', left: 192, top: 265}}><Kicker>{label}</Kicker></Reveal>
  <Reveal delay={13} style={{position: 'absolute', left: 184, top: 355, fontSize: 96, fontWeight: 750, lineHeight: 1.12, letterSpacing: '-0.06em', whiteSpace: 'pre-line', width: 660}}>{title}</Reveal>
  <Reveal delay={28} style={{position: 'absolute', left: 192, top: 650, fontSize: 33, lineHeight: 1.5, color: C.muted, whiteSpace: 'pre-line', width: 575}}>{copy}</Reveal>
</>;

export const Lifestyle = () => {
  const {fps} = useVideoConfig();
  return <Stage accent={C.blue} chapter="A VUESTRO RITMO">
    <Sequence name="Una lista de compra para los dos" durationInFrames={5 * fps}>
      <MomentCopy label="LA COMPRA, COMPARTIDA" title={'Una lista.\nPara los dos.'} copy={'Consultad lo que falta.\nMarcad lo que ya habéis comprado.'} />
      <Phone screen="shopping-mobile" nextScreen="shopping-done-mobile" switchAt={65} x={1250} y={170} width={350} angle={-3} />
      <Tap at={58} x={1290} y={423} color={C.green} />
    </Sequence>
    <Sequence name="Un resumen de vuestra semana" from={5 * fps} durationInFrames={5 * fps}>
      <MomentCopy label="VUESTRO DÍA, MÁS CLARO" title={'La semana,\nde un vistazo.'} copy={'Lo que toca hoy y lo que viene.\nReunido en vuestra pantalla de inicio.'} />
      <Phone screen="dashboard-mobile" x={1375} y={175} width={300} angle={4} delay={8} />
      <LiftedCard screen="week-card" x={950} y={335} width={620} delay={31} />
    </Sequence>
    <Sequence name="Responsive y temas originales" from={10 * fps} durationInFrames={5.6 * fps}>
      <MomentCopy label="A VUESTRA MANERA" title={'Donde estéis.\nComo queráis.'} copy={'Móvil u ordenador.\nTema claro u oscuro.'} />
      <Laptop screen="dashboard-desktop" x={850} y={270} width={850} delay={4} />
      <Phone screen="dashboard-light-mobile" x={1335} y={430} width={250} angle={5} delay={27} />
    </Sequence>
  </Stage>;
};
