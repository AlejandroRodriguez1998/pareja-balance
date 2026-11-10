import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const C = {
  bg: '#101318', white: '#f4f7fb', muted: '#aeb6c2', blue: '#137eff',
  cyan: '#3adaf4', green: '#08d58a', coral: '#ff3f58', line: '#ffffff16',
};
export const fontFamily = 'Plus Jakarta Sans, sans-serif';
void loadFont({family: 'Plus Jakarta Sans', url: staticFile('fonts/PlusJakartaSans.ttf'), weight: '200 800'});
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
