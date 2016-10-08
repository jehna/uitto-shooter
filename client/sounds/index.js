require('createjs-soundjs');
import { getCurrentUser } from '/client/currentUser.js';
import { Common } from 'box2dweb';
const { b2Vec2 } = Common.Math;

createjs.Sound.registerSound('/sounds/gunshot.ogg', 'gunshot')
createjs.Sound.registerSound('/sounds/background.ogg', 'background')
createjs.Sound.registerSound('/sounds/death-or-lose.ogg', 'death-or-lose')
createjs.Sound.registerSound('/sounds/gunshot.ogg', 'gunshot')
createjs.Sound.registerSound('/sounds/round-begins.ogg', 'round-begins')
createjs.Sound.registerSound('/sounds/team-x-wins.ogg', 'team-x-wins')
createjs.Sound.registerSound('/sounds/walking.ogg', 'walking')

const MAX_SOUND_DISTANCE = 100;
export function playSoundAt(px, py, sound) {
  const s = createjs.Sound.play(sound);

  const {x, y} = getCurrentUser().data;
  const dist = new b2Vec2(x, y);
  dist.Subtract(new b2Vec2(px, py));
  s.volume = 1 - dist.Length() / MAX_SOUND_DISTANCE;
}
