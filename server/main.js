import { Meteor } from 'meteor/meteor';
import { Players } from '../imports/api/players.js';
import { Bullets } from '../imports/api/bullets.js';
import { randomHex } from '../imports/helpers'
import { physics } from './physics.js'
import { gameObjects } from './game.js'
import Player from './GameObjects/Player.js';
const Box2D = require('box2dweb');

const speed = 100;


Meteor.startup(() => {

  Meteor.methods({
    move(mx, my, mr, idx) {
      gameObjects.Player[idx].body.SetAwake(true);
      const r = gameObjects.Player[idx].body.GetTransform().GetAngle() * 180 / Math.PI;
      const [nx, ny] = rotate(0, 0, mx, my, -r);
      const to = new Box2D.Common.Math.b2Vec2(ny * speed, nx * speed)
      gameObjects.Player[idx].body.SetLinearVelocity(to)
      gameObjects.Player[idx].body.SetAngularVelocity(mr)
    },
    shoot(idx) {
      const shooter = gameObjects.Player[idx];
      console.log("pew");
    },
    createPlayer(idx) {
      Player.create(idx);
    }
  });


});

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}
