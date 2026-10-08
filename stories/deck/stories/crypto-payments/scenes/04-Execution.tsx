import { makeWorldScene } from '../../../shared/WorldScene';
import { copy } from '../copy';
import { S_EX } from '../archWorld';

/** 04 EXECUTION: text over the world (executor, wallet, coin adapters, node, store, dead-letter queue). */
export const Execution = makeWorldScene(S_EX, copy.scene.execution, copy.execution);
