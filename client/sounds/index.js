require('createjs-soundjs');
import { getCurrentUser } from '/client/currentUser.js';
import { distanceToCurrentUser, panFromCurrentUser } from '/client/helpers.js';
import { Common } from 'box2dweb';
const { b2Vec2 } = Common.Math;

createjs.Sound.registerSound('/sounds/background.ogg', 'background')
createjs.Sound.registerSound('/sounds/death-or-lose.ogg', 'death-or-lose')
createjs.Sound.registerSound('/sounds/gunshot.ogg', 'gunshot')
createjs.Sound.registerSound('/sounds/round-begins.ogg', 'round-begins')
createjs.Sound.registerSound('/sounds/team-x-wins.ogg', 'team-x-wins')
createjs.Sound.registerSound('/sounds/walking.ogg', 'walking')

const MAX_SOUND_DISTANCE = 100;
export function playSoundAt(px, py, sound) {
  const s = createjs.Sound.play(sound);
  s.volume = 1 - distanceToCurrentUser(px, py) / MAX_SOUND_DISTANCE;
  s.pan = panFromCurrentUser(px, py);
}

export function onSoundLoaded(sound, cb) {
  const checkSoundLoaded = () => {
    createjs.Sound.off("fileload", checkSoundLoaded);
    if (createjs.Sound.loadComplete(sound)) {
      cb();
    } else {
      createjs.Sound.on("fileload", checkSoundLoaded);
    }
  }
  checkSoundLoaded();
}

onSoundLoaded('background', () => {
  const bg = createjs.Sound.play('background');
  bg.loop = -1;
  bg.volume = 0.3;
});
