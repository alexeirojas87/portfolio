import { defineDeck } from 'beatdeck';
import { lang, tr } from '../../shared/lang';
import { Chrome } from '../../shared/Chrome';
import { copy, project } from './copy';
import { SCENES } from './scenes';
import { Open } from './scenes/01-Open';
import { Problem } from './scenes/02-Problem';
import { Idea } from './scenes/03-Idea';
import { Lifecycle } from './scenes/04-Lifecycle';
import { Gateway } from './scenes/05-Gateway';
import { Tools } from './scenes/06-Tools';
import { Decisions } from './scenes/07-Decisions';
import { Summary } from './scenes/08-Summary';

/** Every layer of the stage, back to front. All stay mounted; each shows itself for its own scene. */
function Stage() {
  return (
    <>
      <Open />
      <Problem />
      <Idea />
      <Lifecycle />
      <Gateway />
      <Tools />
      <Decisions />
      <Summary />
    </>
  );
}

export default defineDeck({
  id: 'story-agentic-orchestration',
  title: `${tr(copy.storyLabel)} · ${tr(project.title)}`,
  lang,
  scenes: SCENES,
  Stage,
  Chrome,
  fonts: ['700 100px "Archivo Variable"', '500 32px "IBM Plex Sans"', '600 32px "IBM Plex Sans"', '400 24px "JetBrains Mono Variable"'],
});
