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

  const bullets = {};
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
      const bulletID = randomHex(64);
      const shooter = players[idx];
      const shooterPos = shooter.body.GetPosition();
      const shooterRot = shooter.body.GetTransform().GetAngle() / Math.PI * 180;
      bullets[bulletID] = new Bullet(bulletID, shooter);
    },
    createPlayer(idx) {
      Players.insert({_id: idx, x:100, y: 100, rotation: 0, color: '#' + randomHex(6)})
      players[idx] = new Player(idx);
    }
  });


  Meteor.setInterval(() => {
    Object.keys(bullets).map(key => bullets[key]).forEach((bullet) => {
      bullet.fixedUpdate();
    });
  }, 1000/30);

  class Bullet {
    constructor(id, shooter) {
      this.id = id;

      const r = shooter.body.GetTransform().GetAngle() / Math.PI * 180;
      const [nx, ny] = rotate(0, 0, 0, -1, -r);
      const direction = new Box2D.Common.Math.b2Vec2(ny, nx)

      var bodyDef = new Box2D.Dynamics.b2BodyDef();
      bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

      const bPos = direction.Copy()
      bPos.Normalize();
      bPos.Multiply(50);
      const ppos = shooter.body.GetPosition();
      ppos.Add(bPos)
      bodyDef.position = ppos;

      var shape = new Box2D.Collision.Shapes.b2CircleShape(5);
      const fixture = new Box2D.Dynamics.b2FixtureDef();
      fixture.density = 0.1;
      fixture.friction = 0.7;
      fixture.restitution = 0.05;
      fixture.shape = shape;

      this.body = physics.CreateBody(bodyDef);
      this.body.SetUserData({ type: 'bullet', id: id })
      this.body.CreateFixture(fixture);
      this.body.SetBullet(true);
      this.body.SetFixedRotation(false);
      this.body.ResetMassData()

      this.body.SetAwake(true)
      this.body.SetLinearDamping(-1.0)
      direction.Normalize()
      direction.Multiply(1000)
      this.body.ApplyImpulse(direction, shooter.body.GetPosition())

      Bullets.insert({_id: id, x:ppos.y, y: ppos.x, color: '#' + randomHex(6)})
      this.alive = true;
      Meteor.setTimeout(() => {
        if (this && this.alive) {
          this.destroy();
        }
      }, 10000)
    }

    fixedUpdate() {
      if (this.body.IsAwake()) {
        this.update();
        //this.body.SetAwake(false);
      }
    }

    update() {
      const pos = this.body.GetPosition();
      const r = this.body.GetTransform().GetAngle();
      Bullets.update({_id: this.id}, {$set: {y: pos.x, x: pos.y }})
    }

    beginContact(other) {
      Meteor.setTimeout(() => {
        this.destroy();

        if (other instanceof Player) {
            other.body.SetAngle(Math.PI);
            other.body.SetPosition(new Box2D.Common.Math.b2Vec2(15, 500 * Math.random()));
            other.body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(0, 0));
            other.update();
        }
      }, 0);
    }

    destroy() {
      this.alive = false;
      this.body.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(0, 0));
      this.body.SetAwake(false);
      this.body.SetPosition(new Box2D.Common.Math.b2Vec2(-100, -100));
      this.update();
      Bullets.remove({_id: this.id})
      removeBodies.push(this.body);
      delete bullets[this.id];
    }
  }

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
