import { makeWorldScene } from '../../../shared/WorldScene';
import { copy } from '../copy';
import { S_PATH } from '../archWorld';

/** 03 THE LIVE BET PATH: text over the world. The bet travels web → API → topic → validation → live API → live database. */
export const Path = makeWorldScene(S_PATH, copy.scene.path, copy.path);
