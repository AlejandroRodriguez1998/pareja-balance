# Validación del entregable

Validado el 10 de noviembre de 2026.

## Resultado

- `out/pareja-balance-1080p.mp4`: H.264, 1920 × 1080, 30 FPS, YUV420p, **1800 fotogramas / 60 segundos de vídeo**.
- Audio AAC, 48 kHz, estéreo. La duración del contenedor es 60,011 s por el relleno de AAC.
- Tamaño del MP4: 11.924.551 bytes, aproximadamente 11,9 MB.
- `out/pareja-balance-youtube.png`: PNG de 1280 × 720.
- Música: extracto de la pista aportada por el usuario, con fundidos y ajuste de volumen.
- Locución: guion sincronizado y soporte de incorporación; no hay voz narrada en este export.

## Comprobaciones realizadas

| Comprobación | Resultado y evidencia |
|---|---|
| TypeScript y ESLint del vídeo | `npm run lint`, sin errores. |
| Aislamiento de Next.js | `npx tsc --noEmit --incremental false` en la raíz, sin errores tras excluir el proyecto de vídeo. |
| Capturas y controles reales | `scripts/capture.py`: páginas originales, marcar tarea, marcar compra, cambiar claro/oscuro; cero errores de página. Informe en `public/screens/capture-report.json`. |
| Studio | Composición cargada en `http://localhost:3000/ParejaBalancePromo`. Navegación por 21 fotogramas, sin errores de JavaScript ni textos con recorte o fuera del encuadre. Informe en `out/studio-check.json`. |
| Render completo | 1800/1800 fotogramas renderizados y codificados. Registro en `out/render.log`. |
| Metadatos de exportación | FFprobe: resolución, FPS, códecs, duración y número de fotogramas correctos. `out/media-check.json`. |
| Decodificación del MP4 | FFmpeg decodificó el archivo completo, vídeo y audio, sin errores. |
| Revisión visual final | 17 imágenes extraídas del propio MP4; apertura compacta, preguntas separadas del logo, variantes de las escenas, CTA y último fotograma. Hoja de contacto en `out/contacto-final.jpg`. |
| Identidad y contenido | SVG, fuente y CSS del proyecto. Cada función está vinculada a su implementación en `PLAN.md`. |

Las animaciones usan el fotograma de Remotion y springs deterministas. No hay temporizadores ni animaciones CSS en la composición. Las transiciones de 18 fotogramas se compensan en las duraciones de secuencia.

## Límites de la comprobación

La aplicación Next.js no puede autenticar con la configuración local disponible: devuelve `auth/invalid-api-key`. Las capturas usan sus páginas reales con datos ilustrativos en memoria y conexiones remotas bloqueadas. No se ha probado Firebase ni se han alterado datos de usuarios. El resultado visual y los manejadores ejecutados son reales; no se certifica una conexión de producción.

El proyecto Remotion es independiente. Se excluye `mi-video` del `tsconfig.json` de Next.js para que los adaptadores del capturador y las dependencias de vídeo se comprueben con su propia configuración.

La revisión de textos verifica su visibilidad y límites, y se complementa con inspección visual; no sustituye una revisión editorial humana de cada fotograma.
