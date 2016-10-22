require('createjs-preloadjs');
import { uittoshooter } from '/client/uittoshooter'

export const assets = new createjs.LoadQueue();
assets.on('complete', handleComplete);
function handleComplete(e) {
  uittoshooter._onCreateGame.forEach(fn => fn());
}
