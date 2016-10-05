import { Meteor } from 'meteor/meteor';
import { Players } from '../imports/api/players.js';
import { randomHex } from '../imports/helpers'

const speed = 2;

Meteor.startup(() => {
  Meteor.methods({
    move(x, y, idx) {
      Players.update({_id: idx}, {$inc: {y: y * speed, x: x * speed}})
    },
    createPlayer(idx) {
      Players.insert({_id: idx, x:100, y: 100, color: '#' + randomHex(6)})
    }
  });
});
