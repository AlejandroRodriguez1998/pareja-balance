import {AbsoluteFill, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {Opening, Introduction} from './scenes/Opening';
import {Expenses, Meals, Tasks, Together} from './scenes/Features';
import {Lifestyle} from './scenes/Lifestyle';
import {Closing} from './scenes/Closing';
import {Soundtrack} from './Soundtrack';
import type {PromoProps} from './Soundtrack';

export const ParejaBalancePromo = (props: PromoProps) => {
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{background: '#101318'}}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="01 Compartir la vida" durationInFrames={6.6 * fps}><Opening /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 0.6 * fps})} />
      <TransitionSeries.Sequence name="02 Presentación" durationInFrames={5.6 * fps}><Introduction /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 0.6 * fps})} />
      <TransitionSeries.Sequence name="03 Gastos claros" durationInFrames={7.6 * fps}><Expenses /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 0.6 * fps})} />
      <TransitionSeries.Sequence name="04 Comidas y compra" durationInFrames={7.6 * fps}><Meals /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 0.6 * fps})} />
      <TransitionSeries.Sequence name="05 Tareas compartidas" durationInFrames={7.6 * fps}><Tasks /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 0.6 * fps})} />
      <TransitionSeries.Sequence name="06 Planes juntos" durationInFrames={7.6 * fps}><Together /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 0.6 * fps})} />
      <TransitionSeries.Sequence name="07 A vuestro ritmo" durationInFrames={15.6 * fps}><Lifestyle /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 0.6 * fps})} />
      <TransitionSeries.Sequence name="08 Más equilibrio" durationInFrames={6 * fps}><Closing /></TransitionSeries.Sequence>
    </TransitionSeries>
    <Soundtrack {...props} />
  </AbsoluteFill>;
};
