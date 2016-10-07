import { Meteor } from 'meteor/meteor';
import { Players } from '../imports/api/players.js';
import { Bullets } from '../imports/api/bullets.js';
import { randomHex } from '../imports/helpers'
import { physics } from './physics.js'
import { players } from './game.js'
import Player from './GameObjects/Player.js';
const Box2D = require('box2dweb');

const speed = 100;


Meteor.startup(() => {

  const removeBodies = [];

  Meteor.methods({
    move(mx, my, mr, idx) {
      /*const player = Players.find({_id: idx}).fetch()[0];
      const {x, y, rotation} = player;
      const r = rotation + mr*speed;
      const [nx, ny] = rotate(x, y, x + (mx * speed), y + (my * speed), -r);
      Players.update({_id: idx}, {$set: {y: ny, x: nx, rotation: r}})*/
      players[idx].body.SetAwake(true);
      const r = players[idx].body.GetTransform().GetAngle() / Math.PI * 180;
      const [nx, ny] = rotate(0, 0, mx, my, -r);
      const to = new Box2D.Common.Math.b2Vec2(ny * speed, nx * speed)
      players[idx].body.SetLinearVelocity(to)
      players[idx].body.SetAngularVelocity(mr)
    },
    shoot(idx) {
      const shooter = players[idx];
      console.log("pew");
    },
    createPlayer(idx) {
      Players.insert({_id: idx, x:100, y: 100, rotation: 0, color: '#' + randomHex(6)})
      players[idx] = new Player(idx);
    }
  });

  Meteor.setInterval(() => {
    if (removeBodies.length) {
      do {
        physics.DestroyBody(removeBodies.pop())
      } while (removeBodies.length)
    }
  }, 10000);
});

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}
