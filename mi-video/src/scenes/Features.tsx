import type {ReactNode} from 'react';
import {Stage, Kicker, FeatureFooter} from '../components/Stage';
import {Phone, Laptop, LiftedCard} from '../components/Devices';
import {Reveal, Tap} from '../components/Motion';
import {C} from '../theme';

const FeatureCopy = ({index, label, title, description, color}: {index: number; label: string; title: ReactNode; description: ReactNode; color: string}) => <>
  <Reveal delay={12} style={{position: 'absolute', left: index === 2 ? 962 : 192, top: 262}}><Kicker color={color}>{`0${index + 1} / ${label}`}</Kicker></Reveal>
  <Reveal delay={26} style={{position: 'absolute', left: index === 2 ? 954 : 184, top: 340, fontSize: 106, lineHeight: 1.07, fontWeight: 750, letterSpacing: '-0.065em', maxWidth: 760}}>{title}</Reveal>
  <Reveal delay={48} style={{position: 'absolute', left: index === 2 ? 962 : 192, top: 635, width: 590, fontSize: 34, lineHeight: 1.5, color: C.muted}}>{description}</Reveal>
  <FeatureFooter index={index} color={color} />
</>;

export const Expenses = () => <Stage accent={C.cyan} chapter="GASTOS Y BALANCE">
  <FeatureCopy index={0} label="GASTOS COMPARTIDOS" color={C.cyan} title={<>Las cuentas,<br /><span style={{color: C.cyan}}>claras.</span></>} description={<>Registrad los gastos y consultad<br />vuestro saldo de un vistazo.</>} />
  <Phone screen="dashboard-mobile" nextScreen="expense-form" switchAt={96} x={1250} y={165} width={345} />
  <LiftedCard screen="balance-card" x={920} y={460} width={660} delay={25} exitAt={84} />
  <Tap at={89} x={1579} y={820} />
  <Reveal delay={116} style={{position: 'absolute', left: 870, top: 590, fontSize: 25, color: C.cyan, width: 270, lineHeight: 1.5}}>Añadid un gasto.<br />Seguid con vuestro día.</Reveal>
</Stage>;

export const Meals = () => <Stage accent={C.blue} chapter="EL PLAN DE COMIDAS">
  <FeatureCopy index={1} label="COMIDAS DE LA SEMANA" color={C.cyan} title={<>La semana,<br /><span style={{color: C.cyan}}>resuelta.</span></>} description={<>Decidid qué coméis hoy.<br />Y dejad pensado lo de mañana.</>} />
  <div style={{position: 'absolute', left: 1040, top: 270, width: 600, height: 540, border: '1px solid #3adaf424', borderRadius: 70, rotate: '9deg'}} />
  <LiftedCard screen="today-card" x={955} y={270} width={650} delay={10} exitAt={113} style={{rotate: '-3deg'}} />
  <LiftedCard screen="tomorrow-card" x={1070} y={590} width={650} delay={45} exitAt={113} style={{rotate: '3deg'}} />
  <LiftedCard screen="meals-week-card" x={1100} y={175} width={500} delay={128} style={{rotate: '-2deg'}} />
</Stage>;

export const Tasks = () => <Stage accent={C.green} chapter="TAREAS COMPARTIDAS">
  <FeatureCopy index={2} label="TAREAS COMPARTIDAS" color={C.green} title={<>Cada uno sabe<br /><span style={{color: C.green}}>qué le toca.</span></>} description={<>Repartid lo pendiente.<br />Y marcad lo que ya está hecho.</>} />
  <LiftedCard screen="assignment-1" x={235} y={270} width={610} delay={10} exitAt={115} style={{rotate: '-3deg'}} />
  <LiftedCard screen="assignment-2" x={300} y={485} width={610} delay={42} exitAt={115} style={{rotate: '1deg'}} />
  <LiftedCard screen="assignment-3" x={235} y={700} width={610} delay={72} exitAt={115} style={{rotate: '-2deg'}} />
  <Tap at={108} x={267} y={337} color={C.green} />
  <LiftedCard screen="completed-card" x={235} y={430} width={620} delay={134} />
</Stage>;

export const Together = () => <Stage accent={C.coral} chapter="VUESTRO ESPACIO">
  <FeatureCopy index={3} label="PLANES Y OBJETIVOS" color="#ff8a8e" title={<>Haced sitio<br /><span style={{color: '#ff8a8e'}}>a lo vuestro.</span></>} description={<>Guardad vuestro próximo plan.<br />Avanzad en vuestros objetivos.</>} />
  <Laptop screen="us-desktop" x={865} y={265} width={830} delay={6} />
  <LiftedCard screen="plan-card" x={1050} y={620} width={610} delay={39} exitAt={119} style={{rotate: '2deg'}} />
  <LiftedCard screen="savings-card" x={1090} y={220} width={500} delay={135} style={{rotate: '-2deg'}} />
</Stage>;
