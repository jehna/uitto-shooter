import { Meteor } from 'meteor/meteor';
import { Players } from '../imports/api/players.js';
import { randomHex } from '../imports/helpers'

const speed = 2;

Meteor.startup(() => {
  Meteor.methods({
    move(mx, my, mr, idx) {
      const player = Players.find({_id: idx}).fetch()[0];
      const {x, y, rotation} = player;
      const r = rotation + mr*speed;
      const [nx, ny] = rotate(x, y, x + (mx * speed), y + (my * speed), -r);
      Players.update({_id: idx}, {$set: {y: ny, x: nx, rotation: r}})
    },
    createPlayer(idx) {
      Players.insert({_id: idx, x:100, y: 100, rotation: 0, color: '#' + randomHex(6)})
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
