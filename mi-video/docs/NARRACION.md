# Guion de locución · Pareja Balance

El MP4 entregado contiene la música elegida y los textos de pantalla. **No incluye locución**: no hay un motor de voz configurado. Las ocho ventanas siguientes están preparadas para incorporarla sin cambiar las animaciones.

Voz de español de España, cercana, clara y con energía contenida. Aproximadamente 150–165 palabras por minuto; dejar respirar las frases. Las preguntas junto al logo son texto visual, no tres intervenciones de voz adicionales.

| Entrada | Duración máxima | Texto |
|---|---|---|
| 00:01.800 | 4 s | Compartir la vida es fácil. Organizarla juntos, ahora también. |
| 00:06.500 | 4 s | Pareja Balance. Gastos, comidas, tareas y planes, en un mismo lugar. |
| 00:11.700 | 5,6 s | Registrad los gastos y consultad vuestro saldo de un vistazo. Las cuentas, claras. |
| 00:18.700 | 5,6 s | Lo de hoy, resuelto. Y lo de mañana, pensado. Planificad vuestras comidas. |
| 00:25.700 | 5,6 s | Repartid las tareas y marcad lo que ya está hecho. Entre los dos. |
| 00:32.700 | 5,6 s | Guardad vuestro próximo plan y avanzad juntos hacia vuestros objetivos. |
| 00:39.600 | 13,7 s | Una lista de la compra para los dos. Vuestra semana, de un vistazo. Y todo a mano, desde el móvil o el ordenador. Con tema claro u oscuro. |
| 00:54.600 | 4,8 s | Pareja Balance. Más equilibrio, menos complicaciones. Descubrid la aplicación. |

## Incorporar una grabación

1. Grabar cada fragmento y guardarlo en `public/voiceover/` con los nombres de `narracion.json`.
2. Ejecutar `npm run voiceover:prepare`. Comprueba cada duración con FFprobe y genera `docs/voiceover.props.json`. Rechaza archivos que excedan la ventana para evitar cortes de palabras.
3. Ejecutar `npm run render:voiceover`.

`Soundtrack.tsx` coloca las voces en sus tiempos absolutos y reduce la música suavemente al 20 % durante cada intervención. Los archivos actuales de música tienen voces cantadas: revisar la mezcla al incorporar una narración.

La composición conserva los 60 segundos y 1800 fotogramas. Las voces no cambian las duraciones de las escenas.
