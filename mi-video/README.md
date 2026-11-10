# Pareja Balance · Vídeo promocional

Anuncio de **60 segundos, 1920 × 1080, 30 FPS**, en español de España. Remotion, React y TypeScript. Pantallas originales de la aplicación, datos ilustrativos locales, tipografía Plus Jakarta Sans y logotipo existente.

## Ejecutar

Requiere Node.js 22.13 o posterior compatible con `package.json`.

```bash
cd mi-video
npm ci
npm run dev
```

Composición: `ParejaBalancePromo`. Miniatura: `ParejaBalanceThumbnail`. Si Studio ya está abierto, el comando muestra su dirección. En esta sesión: [vista previa](http://localhost:3000/ParejaBalancePromo).

## Exportar

```bash
npm run lint
npm run render
npm run thumbnail
```

- `out/pareja-balance-1080p.mp4`: H.264, YUV420p, CRF 18, audio AAC 192 kb/s.
- `out/pareja-balance-youtube.png`: 1280 × 720.

Los recursos necesarios están incluidos en `public/`. La aplicación y Firebase no necesitan estar arrancados para previsualizar o exportar el vídeo. El render utiliza el navegador descargado por Remotion.

## Estructura

- `src/Composition.tsx`: montaje y transiciones, con escenas nombradas en Studio.
- `src/scenes/`: introducción, funciones, experiencia y cierre.
- `src/components/`: dispositivos, marca, tarjetas, fondos y entradas reutilizables.
- `src/Soundtrack.tsx`: música y pistas opcionales de voz, con reducción suave de música.
- `public/screens/`: capturas completas y recortes de la interfaz original.
- `capture/`: adaptadores locales para capturar sin una cuenta real.
- `scripts/`: captura, preparación de audio y comprobación de Studio.
- `docs/PLAN.md`: escaleta definitiva y evidencia de cada función.
- `docs/NARRACION.md` y `docs/narracion.json`: guion y tiempos de locución.
- `docs/RECURSOS.md`: procedencia de capturas, marca, fuente y música.
- `docs/VALIDACION.md`: comprobaciones y límites del resultado.

## Actualizar capturas

Requiere instalar las dependencias de la aplicación en la carpeta superior (`npm ci`) y Python Playwright (`python3 -m pip install playwright`; `python3 -m playwright install chromium`).

```bash
# Terminal 1
npm run capture:serve
# Terminal 2
npm run capture
```

El servidor en `127.0.0.1:4173` monta las páginas React y el CSS originales. Los adaptadores de datos están aislados de Firebase; el navegador bloquea conexiones remotas. Las pruebas de interacciones usan únicamente datos en memoria. Los cambios de diseño se recogen al volver a iniciar el capturador y generar las capturas.

## Música y locución

La música procede del archivo que el usuario ha añadido a `docs/`. Para recrear su extracto y los fundidos, con FFmpeg instalado:

```bash
npm run music:prepare
```

El MP4 incluye música y textos de pantalla. No hay voz narrada generada. Para añadirla, colocar los ocho archivos indicados en `docs/narracion.json` dentro de `public/voiceover/` y ejecutar:

```bash
npm run voiceover:prepare
npm run render:voiceover
```

El preparador verifica que los clips caben en sus ventanas y genera las props. El montaje y las animaciones no cambian.

## Verificación

Con Studio en el puerto 3000 y Python Playwright disponible:

```bash
npm run verify:studio
```

Comprueba la carga, la navegación por 21 fotogramas y los límites de los textos visibles. Guarda `out/studio-check.json` y una captura. La revisión visual del MP4 complementa esta comprobación; no es una prueba de la conexión de la aplicación a Firebase.

## Referencias

Se han utilizado las skills oficiales instaladas localmente en `.agents/skills/remotion-*`, junto con la documentación de [renderizado](https://www.remotion.dev/docs/cli/render) y [transiciones](https://www.remotion.dev/docs/transitions/transitionseries). Sus fuentes y hashes figuran en `skills-lock.json`; los archivos instalados de las skills son herramientas locales y no se versionan.

La fuente incluye su licencia en `public/fonts/OFL.txt`. La procedencia de la música se detalla en `docs/RECURSOS.md`. El proyecto conserva la licencia `UNLICENSED`; los términos de Remotion están disponibles en su [repositorio oficial](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
