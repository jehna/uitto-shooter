import { Meteor } from 'meteor/meteor';
import { Players } from '../imports/api/players.js';
import { randomHex } from '../imports/helpers'
const Box2D = require('box2dweb');

const speed = 100;


Meteor.startup(() => {

  const players = {};

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
    createPlayer(idx) {
      Players.insert({_id: idx, x:100, y: 100, rotation: 0, color: '#' + randomHex(6)})
      players[idx] = new Player(idx);
    }
  });

  // PHYSICS
  const physics = new Box2D.Dynamics.b2World(
    new Box2D.Common.Math.b2Vec2(0, 0),     //gravity
    true                                     //allow sleep
  );

  Meteor.setInterval(() => {
    physics.Step(
      1 / 60,   //frame-rate
      10,       //velocity iterations
      10        //position iterations
    );
    physics.ClearForces();
  }, 1000/60);

  Meteor.setInterval(() => {
    Object.keys(players).map(key => players[key]).forEach((player) => {
      player.fixedUpdate();
    });
  }, 1000/30);


  class Player {
    constructor(id) {
      this.id = id;
      var bodyDef = new Box2D.Dynamics.b2BodyDef();
      bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
      bodyDef.position.x = 300;
      bodyDef.position.y = 300;
      var shape = new Box2D.Collision.Shapes.b2PolygonShape();
      shape.SetAsBox(
        15,
        15
      );
      const fixture = new Box2D.Dynamics.b2FixtureDef();
      fixture.density = 0.0;
      fixture.friction = 1.0;
      fixture.restitution = 0;
      fixture.shape = shape;
      this.body = physics.CreateBody(bodyDef);
      this.body.CreateFixture(fixture);
      this.body.SetLinearDamping(10)
      this.body.SetAngularDamping(1)
    }

    fixedUpdate() {
      if (this.body.IsAwake()) {
        const pos = this.body.GetPosition();
        const r = this.body.GetTransform().GetAngle();
        Players.update({_id: this.id}, {$set: {y: pos.x, x: pos.y, rotation: r/Math.PI*180 }})
        //this.body.SetAwake(false);
      }
    }
  }

  Players.find({}).fetch().forEach((p) => {
    players[p._id] = new Player(p._id);
    players[p._id].body.SetPosition(new Box2D.Common.Math.b2Vec2(p.y, p.x));
    players[p._id].body.SetAngle(Math.PI/360*p.rotation);
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
