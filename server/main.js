import { Meteor } from 'meteor/meteor';
import { Players } from '../imports/api/players.js';
import { Bullets } from '../imports/api/bullets.js';
import { randomHex } from '../imports/helpers'
const Box2D = require('box2dweb');

const speed = 100;


Meteor.startup(() => {

  const players = {};
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
      Bullets.insert({_id: bulletID, x:shooterPos.x, y: shooterPos.y, color: '#' + randomHex(6)})
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

  function objByUserData(d) {
    switch(d.type) {
      case 'bullet':
        return bullets[d.id];
      case 'player':
        return players[d.id];
    }
  }

  physics.SetContactListener({
    BeginContact(contact) {
      const A = objByUserData(contact.GetFixtureA().GetBody().GetUserData());
      const B = objByUserData(contact.GetFixtureB().GetBody().GetUserData());

      if (A && A.beginContact) {
        A.beginContact(B);
      }
      if (B && B.beginContact) {
        B.beginContact(A);
      }
    },
    EndContact(contact) {
    },
    PostSolve(contact, impulse) {
    },
    PreSolve(contact, oldManifold) {
    }
  })

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
    Object.keys(bullets).map(key => bullets[key]).forEach((bullet) => {
      bullet.fixedUpdate();
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
      this.body.SetUserData({ type: 'player', id: id })
      this.body.CreateFixture(fixture);
      this.body.SetLinearDamping(10)
      this.body.SetAngularDamping(10)
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
      Players.update({_id: this.id}, {$set: {y: pos.x, x: pos.y, rotation: r/Math.PI*180 }})
    }
  }

  class Bullet {
    constructor(id, shooter) {
      this.id = id;

      const r = shooter.body.GetTransform().GetAngle() / Math.PI * 180;
      const [nx, ny] = rotate(0, 0, 0, -1, -r);
      const direction = new Box2D.Common.Math.b2Vec2(ny * 6000, nx * 6000)

      var bodyDef = new Box2D.Dynamics.b2BodyDef();
      bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
      const bpos = shooter.body.GetPosition();
      bpos.x += ny * 35;
      bpos.y += nx * 35;
      bodyDef.position = bpos;
      var shape = new Box2D.Collision.Shapes.b2CircleShape(5);
      const fixture = new Box2D.Dynamics.b2FixtureDef();
      fixture.density = 1.0;
      fixture.friction = 1.0;
      fixture.restitution = 0;
      fixture.shape = shape;

      this.body = physics.CreateBody(bodyDef);
      this.body.SetUserData({ type: 'bullet', id: id })
      this.body.CreateFixture(fixture);
      this.body.SetBullet(true);
      this.body.SetFixedRotation(false);

      this.body.SetAwake(true)
      this.body.SetLinearVelocity(direction)

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

  Players.find({}).fetch().forEach((p) => {
    players[p._id] = new Player(p._id);
    players[p._id].body.SetPosition(new Box2D.Common.Math.b2Vec2(p.y, p.x));
    players[p._id].body.SetAngle(Math.PI/180*p.rotation);
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
