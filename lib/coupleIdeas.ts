export const COUPLE_QUESTIONS = [
  '¿Qué pequeño detalle mío te ha hecho sonreír últimamente?',
  '¿Qué plan te gustaría que hiciéramos este mes?',
  '¿Cuál es tu recuerdo favorito de nuestros comienzos?',
  '¿Qué puedo hacer para que tu semana sea más fácil?',
  '¿Qué lugar te gustaría descubrir conmigo?',
  '¿Qué costumbre nuestra te gustaría mantener siempre?',
  '¿Qué comida te gustaría que cocináramos juntos?',
  '¿Qué momento de esta semana repetirías?',
  '¿Cómo sería un domingo perfecto para los dos?',
  '¿Qué canción te recuerda a nosotros?',
  '¿Qué te apetece aprender conmigo?',
  '¿Qué agradeces hoy de nuestra vida juntos?',
  '¿Qué sueño te ilusiona que cumplamos juntos?',
  '¿Cómo te gusta que te acompañe cuando tienes un mal día?',
  '¿Qué aventura improvisada recuerdas con más cariño?',
  '¿Qué te gustaría celebrar aunque no haya una fecha especial?',
  '¿Qué rincón de casa disfrutas más conmigo?',
  '¿Qué película volverías a ver a mi lado?',
  '¿Qué es lo que más te gusta de nuestro día a día?',
  '¿Qué podríamos hacer más despacio esta semana?',
  '¿Qué tradición te gustaría que inventáramos?',
] as const;

export const PLAN_IDEAS = [
  { title: 'Paseo al atardecer', detail: 'Elegid una ruta diferente y dejad el móvil guardado.', category: 'Fuera', time: '45 min', budget: 'Gratis' },
  { title: 'Cena con una receta nueva', detail: 'Cada uno se encarga de una parte. La compra también cuenta como plan.', category: 'En casa', time: '1 h', budget: 'Económico' },
  { title: 'Noche de películas de nuestra infancia', detail: 'Elegid una película cada uno y preparad algo para picar.', category: 'En casa', time: '2 h', budget: 'Gratis' },
  { title: 'Desayuno sin prisas', detail: 'Preparad vuestro desayuno favorito y desayunad sin pantallas.', category: 'En casa', time: '45 min', budget: 'Económico' },
  { title: 'Turistas en nuestra ciudad', detail: 'Visitad un barrio o un parque donde nunca hayáis estado juntos.', category: 'Fuera', time: '2 h', budget: 'Gratis' },
  { title: 'Pícnic para dos', detail: 'Unas cosas de casa, una manta y vuestro rincón al aire libre.', category: 'Fuera', time: '1 h', budget: 'Económico' },
  { title: 'Tarde de juegos', detail: 'Recuperad un juego de mesa o una baraja y elegid algo de música.', category: 'En casa', time: '1 h', budget: 'Gratis' },
  { title: 'Escapada de un día', detail: 'Elegid un pueblo cercano y dejad tiempo para improvisar.', category: 'Fuera', time: 'Un día', budget: 'Con presupuesto' },
] as const;

// A shared day boundary keeps the same question on both phones.
export function questionForDate(date: Date) {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  const index = Math.floor(Date.parse(`${day}T00:00:00Z`) / 86400000);
  return { day, question: COUPLE_QUESTIONS[index % COUPLE_QUESTIONS.length] };
}
