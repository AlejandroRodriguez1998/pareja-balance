import {readFile, writeFile, access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const script = JSON.parse(await readFile(path.join(root, 'docs/narracion.json'), 'utf8'));
const voiceover = [];
const errors = [];
for (const clip of script) {
  const file = path.join(root, 'public', clip.file);
  try {await access(file);} catch {errors.push(`Falta public/${clip.file}`); continue;}
  const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', file], {encoding: 'utf8'});
  if (probe.status !== 0) {errors.push(`No se puede leer ${clip.file}`); continue;}
  const durationSeconds = Number(JSON.parse(probe.stdout).format.duration);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0 || durationSeconds > clip.durationSeconds) {
    errors.push(`${clip.file}: ${durationSeconds}s; ventana máxima ${clip.durationSeconds}s.`); continue;
  }
  voiceover.push({file: clip.file, fromSeconds: clip.fromSeconds, durationSeconds});
}
if (errors.length) {
  console.error('Coloca las ocho locuciones según docs/narracion.json.\n' + errors.join('\n'));
  process.exit(1);
}
await writeFile(path.join(root, 'docs/voiceover.props.json'), JSON.stringify({musicVolume: 0.85, voiceover}, null, 2) + '\n');
console.log('Props preparadas. Renderiza con npm run render:voiceover. Las animaciones conservan sus tiempos.');
