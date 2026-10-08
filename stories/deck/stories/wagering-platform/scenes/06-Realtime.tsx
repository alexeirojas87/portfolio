import { makeWorldScene } from '../../../shared/WorldScene';
import { copy } from '../copy';
import { S_RT } from '../archWorld';

/** 06 REAL-TIME STATE AND TELEMETRY: states reach the notification stream, the hub pushes them to the player, telemetry, one trace. */
export const Realtime = makeWorldScene(S_RT, copy.scene.rt, copy.rt);
