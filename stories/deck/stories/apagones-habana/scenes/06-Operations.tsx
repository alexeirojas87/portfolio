import { makeWorldScene } from '../WorldScene';
import { copy } from '../copy';
import { S_OP } from '../archWorld';

/** 06 OPERATIONS: text over the world. Watchdog (3 beats), then the camera drops to the digest and the verification (2 beats). */
export const Operations = makeWorldScene(S_OP, copy.scene.ops, copy.ops);
