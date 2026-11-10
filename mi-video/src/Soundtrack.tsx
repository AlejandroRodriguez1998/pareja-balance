import {Audio} from '@remotion/media';
import {interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from './theme';

export type VoiceClip = {file: string; fromSeconds: number; durationSeconds: number};
export type PromoProps = {musicVolume: number; voiceover: VoiceClip[]};

export const Soundtrack = ({musicVolume, voiceover}: PromoProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const duck = voiceover.reduce((volume, clip) => Math.min(volume, interpolate(frame,
    [(clip.fromSeconds - 0.35) * fps, clip.fromSeconds * fps, (clip.fromSeconds + clip.durationSeconds) * fps, (clip.fromSeconds + clip.durationSeconds + 0.35) * fps],
    [1, 0.2, 0.2, 1], clamp)), 1);
  return <>
    <Audio name="Música proporcionada por el usuario" src={staticFile('music.mp3')} volume={musicVolume * duck * interpolate(frame, [0, 0.8 * fps, 57 * fps, 60 * fps], [0, 1, 1, 0], clamp)} />
    {voiceover.map((clip) => <Audio key={`${clip.file}-${clip.fromSeconds}`} name={`Locución ${clip.file}`} src={staticFile(clip.file)} from={Math.round(clip.fromSeconds * fps)} durationInFrames={Math.round(clip.durationSeconds * fps)} volume={1} />)}
  </>;
};
