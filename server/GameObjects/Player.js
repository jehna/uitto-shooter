import { Players } from '../../imports/api/players.js';
import GameObject from './GameObject.js'
import { Common } from 'box2dweb';
const { b2Vec2 } = Common.Math;
import { BodyDef, RectShape, FixtureFn } from '../box2dBuilders';

export default class Player extends GameObject {
  static create(id) {
    super.create(Players, id);
  }

  constructor(id, position = new b2Vec2(300, 300), angle = 0) {
    super(
      id,
      BodyDef(position, angle, 10, 10),
      RectShape(15, 15),
      FixtureFn(0, 1, 0),
      Players
    );
  }
}

// Initialize all existing players
Players.find({})
  .fetch()
  .forEach((p) => new Player(p._id, new b2Vec2(p.y, p.x), p.r));
