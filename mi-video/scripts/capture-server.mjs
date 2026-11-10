import {createServer} from 'vite';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const video = fileURLToPath(new URL('../', import.meta.url));
const app = path.resolve(video, '..');
const css = await readFile(path.join(app, 'app/globals.css'), 'utf8');
await writeFile(path.join(video, 'capture/app.css'), css.replace('@import "tailwindcss";', '').replace(/@theme inline\s*\{[^}]+\}/, '') + `
@font-face {font-family: 'Plus Jakarta Sans'; src: url('/fonts/PlusJakartaSans.ttf') format('truetype'); font-weight: 200 800; font-display: block;}
html {--font-app: 'Plus Jakarta Sans';}
* {animation: none !important; transition: none !important; caret-color: transparent !important;}
`);
const server = await createServer({
  configFile: false,
  root: path.join(video, 'capture'),
  publicDir: path.join(video, 'public'),
  css: {postcss: {plugins: []}},
  esbuild: {jsx: 'automatic'},
  plugins: [{
    name: 'isolate-relative-firebase', enforce: 'pre',
    resolveId(source, importer) {
      if (source === './firebase' && importer?.startsWith(path.join(app, 'lib'))) {
        return path.join(video, 'capture/fixtures.ts');
      }
    },
  }],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {find: '@/lib/firebase', replacement: path.join(video, 'capture/fixtures.ts')},
      {find: '@/lib/pairs', replacement: path.join(video, 'capture/fixtures.ts')},
      {find: 'firebase/auth', replacement: path.join(video, 'capture/fixtures.ts')},
      {find: 'firebase/firestore', replacement: path.join(video, 'capture/fixtures.ts')},
      {find: 'next/navigation', replacement: path.join(video, 'capture/navigation.tsx')},
      {find: 'next/link', replacement: path.join(video, 'capture/navigation.tsx')},
      {find: '@', replacement: app},
    ],
  },
  server: {host: '127.0.0.1', port: 4173, strictPort: true, fs: {allow: [app]}},
});
await server.listen();
console.log('Capturador local: http://127.0.0.1:4173');
