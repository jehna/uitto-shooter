require('createjs-soundjs');
import { getCurrentUser } from '/client/currentUser.js';
import { distanceToCurrentUser, panFromCurrentUser } from '/client/helpers.js';
import { Common } from 'box2dweb';
import { assets } from '/client/assets';
const { b2Vec2 } = Common.Math;

assets.installPlugin(createjs.Sound);

assets.loadFile({ src:'/sounds/background.ogg', id: 'background' });
assets.loadFile({ src:'/sounds/death-or-lose.ogg', id: 'death-or-lose' });
assets.loadFile({ src:'/sounds/gunshot.ogg', id: 'gunshot' });
assets.loadFile({ src:'/sounds/round-begins.ogg', id: 'round-begins' });
assets.loadFile({ src:'/sounds/team-x-wins.ogg', id: 'team-x-wins' });
assets.loadFile({ src:'/sounds/walking.ogg', id: 'walking' });

const MAX_SOUND_DISTANCE = 100;
export function playSoundAt(px, py, sound) {
  const s = createjs.Sound.play(sound);
  s.volume = 1 - distanceToCurrentUser(px, py) / MAX_SOUND_DISTANCE;
  s.pan = panFromCurrentUser(px, py);
}

/*onSoundLoaded('background', () => {
  const bg = createjs.Sound.play('background');
  bg.loop = -1;
  bg.volume = 0.3;
});*/

function pauseSounds () {
  createjs.Sound.muted = document.visibilityState !== 'visible';
}
document.addEventListener('visibilitychange', pauseSounds);
pauseSounds();
