import {Composition, Still} from 'remotion';
import {ParejaBalancePromo} from './Composition';
import {Thumbnail} from './Thumbnail';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="ParejaBalancePromo" component={ParejaBalancePromo}
        width={1920} height={1080} fps={30} durationInFrames={1800}
        defaultProps={{musicVolume: 0.85, voiceover: []}}
      />
      <Still id="ParejaBalanceThumbnail" component={Thumbnail} width={1280} height={720} />
    </>
  );
};
