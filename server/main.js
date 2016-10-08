import { Meteor } from 'meteor/meteor';
import { Players } from '../imports/api/players.js';
import { Hits } from '../imports/api/hits.js';
import { randomHex } from '../imports/helpers'
import { physics } from './physics.js'
import { gameObjects } from './game.js'
import Player from './GameObjects/Player.js';
const Box2D = require('box2dweb');

Meteor.startup(() => {

  Meteor.methods({
    move(mx, my, mr, idx) {
      const to = new Box2D.Common.Math.b2Vec2(my, mx)
      gameObjects.Player[idx].setVelocityAndAngle(to, mr);
    },
    shoot(idx) {
      const shooter = gameObjects.Player[idx];
      shooter.shoot();
    },
    createPlayer(idx) {
      Player.create(idx);
    }
  });


});
