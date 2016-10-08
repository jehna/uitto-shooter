import { Meteor } from 'meteor/meteor';
import { Players } from '../../imports/api/players.js';
import { Hits } from '../../imports/api/hits.js';
import GameObject from './GameObject.js'
import { Common } from 'box2dweb';
const { b2Vec2 } = Common.Math;
import { BodyDef, RectShape, FixtureFn } from '../box2dBuilders';
import { rotate } from '../../imports/helpers.js'
import { physics } from '../physics.js'

export default class Player extends GameObject {

  static create(id) {
    super.create(Players, id);
  }

  constructor(id, position = new b2Vec2(30, 30), angle = 0) {
    super(
      id,
      BodyDef(position, angle, 10, 0),
      RectShape(5, 5),
      FixtureFn(0, 1, 0),
      Players
    );

    this.speed = 80;
  }

  fixedUpdate() {
    super.fixedUpdate();
    if (this.body.IsAwake() && this.velocity) {
      const [nx, ny] = rotate(0, 0, this.velocity.x, this.velocity.y, this.body.GetAngle());
      const to = new b2Vec2(nx, ny)
      to.Normalize();
      to.Multiply(this.speed);
      this.body.SetLinearVelocity(to);
    }
  }

  setVelocityAndAngle(velocity, angle) {
    this.body.SetAwake(true);
    this.velocity = velocity;
    this.body.SetAngularVelocity(angle);
  }

  shoot() {
    const [nx, ny] = rotate(0, 0, -1, 0, this.body.GetAngle());
    const from = new b2Vec2(nx, ny)
    from.Normalize();
    from.Multiply(8);
    const to = from.Copy();
    to.Multiply(20);
    to.Add(this.body.GetPosition());
    from.Add(this.body.GetPosition());
    const hits = [];
    const cb = (fixture, point, normal, fraction) => hits.push({fixture, point, normal, fraction});
    physics.RayCast(cb, from, to);
    const hit = hits.sort((a,b) => b.fraction - a.fraction).pop();
    const hitModel = Hits.insert({x: hit.point.x, y: hit.point.y}, (_, id) => {
      // TODO: An ybetter way to send event to client?
      Meteor.setTimeout(() => {
        Hits.remove({_id: id});
      }, 1000);
    });
  }
}

// Initialize all existing players
Players.find({})
  .fetch()
  .forEach((p) => new Player(p._id, new b2Vec2(p.x, p.y), p.r));
