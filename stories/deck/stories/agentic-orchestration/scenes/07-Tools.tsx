import { makeWorldScene } from '../../../shared/WorldScene';
import { copy } from '../copy';
import { S_TC } from '../archWorld';

/** 07 TOOLS: the camera zooms out to the whole map, then in on the MCP orbit; tools light up as they are called. */
export const Tools = makeWorldScene(S_TC, copy.scene.tools, copy.tools);
