import { Meteor } from 'meteor/meteor';
import { getCurrentUser } from '/client/currentUser.js';
import { physics } from '/imports/physics.js'
import { Common } from 'box2dweb';
import { myID } from '/client/currentUser.js';
const { b2Vec2 } = Common.Math;

export function updateVisibility(sprite, alpha) {
  Meteor.setInterval(() => {
    if (!getCurrentUser()) return;

    const from = new b2Vec2(sprite.x + 8, sprite.y + 8);
    const to = new b2Vec2(getCurrentUser().data.x, getCurrentUser().data.y);
    const dist = to.Copy();
    dist.Subtract(from);
    if (dist.Length() > 70) {
      sprite.alpha = alpha;
      return;
    }

    const hits = [];
    const cb = (fixture, point, normal, fraction) => hits.push({fixture, point, normal, fraction});
    physics.RayCast(cb, from, to);
    const hit = hits.sort((a,b) => b.fraction - a.fraction).pop();
    if((hit && hit.fixture.GetBody().GetUserData().id !== myID)) {
      sprite.alpha = alpha;
    } else {
      sprite.alpha = 1;
    }
  }, 1000 / 10);
}
