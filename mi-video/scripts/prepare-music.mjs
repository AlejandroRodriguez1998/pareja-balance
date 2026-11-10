import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'docs/Gryffin - You Remind Me (Lyric Video) ft. Stanaj - GryffinVEVO.mp3');
const output = path.join(root, 'public/music.mp3');
const result = spawnSync('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error', '-i', source, '-t', '60',
  '-af', 'afade=t=in:st=0:d=0.6,afade=t=out:st=57:d=3,loudnorm=I=-19:TP=-2:LRA=8',
  '-c:a', 'libmp3lame', '-b:a', '192k', output,
], {stdio: 'inherit'});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
console.log('Música preparada: 60 s, fundidos y volumen normalizado. Original conservado en docs/.');
