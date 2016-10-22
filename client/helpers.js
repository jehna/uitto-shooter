import { Meteor } from 'meteor/meteor';
import { getCurrentUser } from '/client/currentUser.js';
import { physics } from '/imports/physics.js'
import { Common } from 'box2dweb';
import { myID } from '/client/currentUser.js';
import { rotate } from '/imports/helpers.js'
const { b2Vec2 } = Common.Math;

export function updateVisibility(sprite, alpha, spriteID) {
  Meteor.setInterval(() => {

    if (!getCurrentUser()) return;
    const from = new b2Vec2(sprite.x + 8, sprite.y + 8);
    const to = new b2Vec2(getCurrentUser().data.x, getCurrentUser().data.y);

    if (distanceToCurrentUser(from.x, from.y) > 150) {
      sprite.alpha = alpha;
      return;
    }

    const hits = [];
    const cb = (fixture, point, normal, fraction) => hits.push({fixture, point, normal, fraction});
    physics.RayCast(cb, from, to);

    const ownHits = (hit) => hit.fixture.GetBody().GetUserData().id !== spriteID;

    const hit = hits.filter(ownHits).sort((a,b) => b.fraction - a.fraction).pop();
    if((hit && hit.fixture.GetBody().GetUserData().id !== myID)) {
      sprite.alpha = alpha;
    } else {
      sprite.alpha = 1;
    }
  }, 1000 / 10);
}

export function distanceToCurrentUser(toX, toY) {
  if (!getCurrentUser()) return 0;
  const {x, y} = getCurrentUser().data;
  const dist = new b2Vec2(x, y);
  dist.Subtract(new b2Vec2(toX, toY));
  return dist.Length();
}

export function panFromCurrentUser(x, y) {
  const cu = getCurrentUser();
  if (!cu) return 0;
  const cuData = cu.data;
  const myPos = new b2Vec2(x, y);
  const cuPos = new b2Vec2(cuData.x, cuData.y);
  myPos.Subtract(cuPos);
  const [fx, fy] = rotate(0, 0, myPos.x, myPos.y, -cuData.r);
  return -Math.min(0.7, Math.max(-0.7, fx / 100));
}
