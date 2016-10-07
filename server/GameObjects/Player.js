import { Players } from '../../imports/api/players.js';
import GameObject from './GameObject.js'
import { Common } from 'box2dweb';
const { b2Vec2 } = Common.Math;
import { BodyDef, RectShape, FixtureFn } from '../box2dBuilders';
import { rotate } from '../../imports/helpers.js'

export default class Player extends GameObject {

  static create(id) {
    super.create(Players, id);
  }

  constructor(id, position = new b2Vec2(300, 300), angle = 0) {
    super(
      id,
      BodyDef(position, angle, 10, 0),
      RectShape(15, 15),
      FixtureFn(0, 1, 0),
      Players
    );

    this.speed = 100;
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
}

// Initialize all existing players
Players.find({})
  .fetch()
  .forEach((p) => new Player(p._id, new b2Vec2(p.x, p.y), p.r));
