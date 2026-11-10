# Pareja Balance · Tratamiento del anuncio

60 segundos · 1920 × 1080 · 30 fps · español de España.

## Dirección

Un bloque compacto «Tú + tu pareja» abre la pieza. Las tres preguntas cotidianas aparecen en posiciones separadas alrededor del logo, sin entrar en él. El lema enlaza con una demostración breve de cada función. Tipografía Plus Jakarta Sans, azul #137eff, cian #3adaf4, verde #08d58a y coral #ff3f58 sobre #101318. El logotipo procede de `components/BrandMark.tsx`; las pantallas, de las páginas React originales y `app/globals.css`.

Los dispositivos tienen movimiento continuo y contenido real. Recortes de las propias capturas elevan el elemento importante. Cada interacción aparece una sola vez. Las escenas enlazan con fundidos de 18 fotogramas. Los textos principales conservan márgenes amplios; se revisan sus límites en Studio y en imágenes renderizadas.

## Escaleta

| Tiempo | Escena | Atención y movimiento |
|---|---|---|
| 00–06 | Un mismo equipo | «Tú + tu pareja» compacto; tres preguntas alrededor del logo; frase de apertura exacta. |
| 06–11 | Un lugar para los dos | Web pública real en portátil, dashboard real en móvil. Entradas escalonadas. |
| 11–18 | Gastos claros | Ampliación del saldo y formulario real de añadir gasto. |
| 18–25 | La semana resuelta | Comida de hoy, de mañana y plan semanal real. |
| 25–32 | Tareas compartidas | Filas reales con responsables y fechas, seguidas de una tarea completada. |
| 32–39 | Más planes juntos | Nosotros en ordenador; próximo plan y objetivo de ahorro. |
| 39–44 | Compra | Lista compartida y un producto marcado como comprado. Única aparición de esta interacción. |
| 44–49 | Semana de un vistazo | Resumen semanal real ampliado. |
| 49–54 | A vuestra manera | Escritorio oscuro y móvil claro. Temas reales de la aplicación. |
| 54–60 | Más equilibrio | Logotipo, lema exacto y «Descubrid Pareja Balance». |

Cada transición se solapa 18 fotogramas; las duraciones de secuencia lo compensan. La duración final es de 1800 fotogramas.

## Evidencia funcional

- Gastos/saldo y resumen: `app/dashboard/page.tsx`, `components/AddExpenseModal.tsx`.
- Comidas y compra categorizada: `app/meals/page.tsx`, `components/ShoppingList.tsx`.
- Tareas asignadas y completadas: `app/tasks/page.tsx`, `components/TaskModal.tsx`.
- Planes, objetivos y ahorro: `app/us/page.tsx`, `components/CoupleSavings.tsx`.
- Responsive y temas: `app/globals.css`, `components/SettingsModal.tsx`.
- Fuente y marca: `app/layout.tsx`, `components/BrandMark.tsx`.

## Capturas y datos

No hay sesión de demostración ni credenciales proporcionadas. El capturador monta las páginas originales mediante Vite con adaptadores locales de navegación y datos de demostración. No modifica la app ni llama a Firebase. Las interacciones de completar tareas y compra ejecutan los manejadores reales contra el adaptador en memoria. Los datos son ilustrativos, no cuentas reales. El precio de la luz no se promociona con precios simulados.

## Audio

Guion por escenas con ventanas de entrada y salida. La composición admite archivos de voz opcionales sin cambiar la animación. No se necesita ni se solicita ninguna clave de voz. A petición posterior del usuario, se utiliza la pista que ha añadido a `docs`: «Gryffin - You Remind Me (Lyric Video) ft. Stanaj - GryffinVEVO.mp3». Es material proporcionado por el usuario; no se acredita como instrumental ni como música libre de derechos. Se conserva el original y se crea un extracto con entrada y salida suaves para el montaje.

No se muestra dominio: el repositorio no acredita una URL oficial de la aplicación.
