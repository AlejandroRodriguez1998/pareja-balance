# Procedencia de los recursos

## Interfaz

Las capturas de `public/screens/` se generan con las páginas React originales del repositorio: inicio público, dashboard, comidas, tareas y Nosotros. Se importan los componentes existentes y la hoja `app/globals.css`. No son pantallas rediseñadas para el anuncio.

El capturador utiliza adaptadores en memoria para la autenticación y Firestore porque el arranque de Next.js devuelve `auth/invalid-api-key` sin la configuración de Firebase. Bloquea las solicitudes remotas. Los ejemplos de gastos, nombres de comidas, tareas, planes y ahorro son ilustrativos. Se ejecutan los manejadores reales de completar tareas, marcar compra y cambiar de tema contra este entorno local. No se han leído ni escrito datos reales.

Los recortes de tarjetas ocultan temporalmente navegación y botón flotante para aislar el elemento. Las capturas completas conservan esos controles. `capture-report.json` registra dimensiones y errores de página.

## Marca

`src/components/OriginalBrandMark.tsx` es una copia del SVG de `components/BrandMark.tsx`, con sus mismos trazados y degradados. La animación del anuncio depende del fotograma de Remotion. Los marcos de dispositivos y fondos están hechos con CSS.

## Fuente

Plus Jakarta Sans, definida por la aplicación en `app/layout.tsx`. El archivo variable se distribuye localmente para que el render no dependa de la red. Procede del [repositorio oficial Google Fonts](https://github.com/google/fonts/tree/main/ofl/plusjakartasans). Licencia SIL Open Font License incluida en `public/fonts/OFL.txt`.

## Música

Archivo aportado y elegido por el usuario: `docs/Gryffin - You Remind Me (Lyric Video) ft. Stanaj - GryffinVEVO.mp3`.

El original se conserva. `scripts/prepare-music.mjs` extrae los primeros 60 segundos, normaliza a −19 LUFS antes de la mezcla e incorpora fundidos. El resultado es `public/music.mp3`. La composición aplica además volumen de mezcla y salida final. Este archivo se documenta como música proporcionada por el usuario; no se atribuye una licencia libre ni se presenta como instrumental.

## Dominio

No se ha encontrado una URL oficial verificable en el repositorio. La llamada a la acción utiliza el nombre de la aplicación.
