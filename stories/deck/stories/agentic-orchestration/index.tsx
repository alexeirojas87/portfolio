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
import { Idea } from './scenes/03-Idea';
import { Lifecycle } from './scenes/04-Lifecycle';
import { Cerberus } from './scenes/05-Cerberus';
import { Gateway } from './scenes/06-Gateway';
import { Tools } from './scenes/07-Tools';
import { Decisions } from './scenes/08-Decisions';
import { Summary } from './scenes/09-Summary';

/**
 * Every layer of the stage, back to front. Lifecycle, gateway and tools are ONE world (World.tsx) seen by a moving camera;
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
      <Idea />
      <Lifecycle />
      <Cerberus />
      <Gateway />
      <Tools />
      <Decisions />
      <Summary />
    </>
  );
}

export default defineDeck<Live>({
  id: 'story-agentic-orchestration',
  title: `${tr(copy.storyLabel)} · ${tr(project.title)}`,
  lang,
  scenes: SCENES,
  Stage,
  Chrome,
  initialLive,
  timeline,
  prev,
  // standby and boot are pure black (the first beats of scene 1); a brief hard cut closes the boot
  isBlack: (s) => s.scene === 0 && s.beat <= 1,
  isCut: (s) => s.live.cut,
  fonts: ['700 100px "Archivo Variable"', '500 32px "IBM Plex Sans"', '600 32px "IBM Plex Sans"', '400 24px "JetBrains Mono Variable"'],
});
