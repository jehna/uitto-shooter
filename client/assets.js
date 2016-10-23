require('createjs-preloadjs');
import { uittoshooter } from '/client/uittoshooter';

export const assets = new createjs.LoadQueue();
assets.on('complete', handleComplete);
function handleComplete(e) {
  if (assets.loaded) {
    //uittoshooter._onCreateGame.forEach(fn => fn());
  }
}
