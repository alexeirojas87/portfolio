import { defineDeck } from 'beatdeck';
import { lang, tr } from '../../shared/lang';
import { Atmosphere } from '../../shared/Atmosphere';
import { Chrome } from '../../shared/Chrome';
import { copy, project } from './copy';
import { initialLive, prev, timeline, type Live } from './live';
import { SCENES } from './scenes';
import { World } from './World';
import { Particles } from './Particles';
import { Open } from './scenes/01-Open';
import { Problem } from './scenes/02-Problem';
import { Intake } from './scenes/03-Intake';
import { Execution } from './scenes/04-Execution';
import { Idempotent } from './scenes/05-Idempotent';
import { Confirmation } from './scenes/06-Confirmation';
import { Decisions } from './scenes/07-Decisions';
import { Outcome } from './scenes/08-Outcome';

/**
 * Every layer of the stage, back to front. Intake, execution and confirmation are ONE world (World.tsx) seen by a moving camera;
 * their scenes only add text on top. All layers stay mounted; each shows itself for its own position.
 */
function Stage() {
  return (
    <>
      <Atmosphere />
      <World />
      <Particles />
      <Open />
      <Problem />
      <Intake />
      <Execution />
      <Idempotent />
      <Confirmation />
      <Decisions />
      <Outcome />
    </>
  );
}

export default defineDeck<Live>({
  id: 'story-crypto-payments',
  title: `${tr(copy.storyLabel)} · ${tr(project.title)}`,
  lang,
  scenes: SCENES,
  Stage,
  Chrome,
  initialLive,
  timeline,
  prev,
  isBlack: (s) => s.scene === 0 && s.beat <= 1,
  isCut: (s) => s.live.cut,
  fonts: ['700 100px "Archivo Variable"', '500 32px "IBM Plex Sans"', '600 32px "IBM Plex Sans"', '400 24px "JetBrains Mono Variable"'],
});
