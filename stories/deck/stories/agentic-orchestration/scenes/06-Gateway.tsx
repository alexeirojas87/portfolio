import { makeWorldScene } from '../../../shared/WorldScene';
import { copy } from '../copy';
import { S_GW } from '../archWorld';

/** 06 GATEWAY: the camera pans right; requests stream in, meters count, the primary fails, the fallback answers. */
export const Gateway = makeWorldScene(S_GW, copy.scene.gateway, copy.gateway);
