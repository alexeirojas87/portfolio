import { makeWorldScene } from '../WorldScene';
import { copy } from '../copy';
import { S_PL } from '../archWorld';

/** 03 PIPELINE: text over the world. A packet walks the pipeline (automatic beats, see live.ts and archWorld.ts PL). */
export const Pipeline = makeWorldScene(S_PL, copy.scene.pipeline, copy.pipeline);
