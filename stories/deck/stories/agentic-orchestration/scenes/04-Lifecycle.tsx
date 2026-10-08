import { makeWorldScene } from '../../../shared/WorldScene';
import { copy } from '../copy';
import { S_LC } from '../archWorld';

/** 04 LIFECYCLE: text over the world. A packet walks the state machine (automatic beats, see live.ts and world.ts LC). */
export const Lifecycle = makeWorldScene(S_LC, copy.scene.lifecycle, copy.lifecycle);
