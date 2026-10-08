import { makeWorldScene } from '../../../shared/WorldScene';
import { copy } from '../copy';
import { S_ONE } from '../archWorld';

/** 04 ONE PLAYER AT A TIME: two bets share a lane and take the lock in turn; a duplicate id is absorbed. */
export const One = makeWorldScene(S_ONE, copy.scene.one, copy.one);
