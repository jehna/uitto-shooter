import { Meteor } from 'meteor/meteor';
import { Players } from '/imports/api/players.js';
import { Hits } from '/imports/api/hits.js';
import { randomHex } from '/imports/helpers'
import { physics } from '/imports/physics.js'
import { gameObjects } from '/imports/game.js'
import GameObject from '/imports/GameObjects/GameObject.js';
import Player from '/imports/GameObjects/Player.js';
import Wall from '/imports/GameObjects/Wall.js';
const Box2D = require('box2dweb');

Meteor.startup(() => {

  Meteor.methods({
    move(mx, my, mr, idx) {
      if (!gameObjects.Player[idx] || gameObjects.Player[idx].dead) return;
      const to = new Box2D.Common.Math.b2Vec2(my, mx)
      gameObjects.Player[idx].setVelocityAndAngle(to, mr);
    },
    shoot(idx) {
      if (!gameObjects.Player[idx] || gameObjects.Player[idx].dead) return;
      const shooter = gameObjects.Player[idx];
      shooter.shoot();
    },
    createPlayer(idx, nick, team) {
      Player.create(idx, nick, team);
    }
  });

  Meteor.onConnection((connection) => {
    connection.onClose(() => {
      Player.destroy(connection.id);
    });
  });
});
