import GameObject from './GameObject.js'
import { Common, Dynamics } from 'box2dweb';
const { b2Vec2 } = Common.Math;
const { b2BodyDef, b2Body, b2FixtureDef } = Dynamics;
import { BodyDef, RectShape, FixtureFn } from '../box2dBuilders';
import { randomHex } from '../../imports/helpers.js'
import { map1 } from '../../imports/maps'

export default class Wall extends GameObject {
  constructor(id, position) {
    super(
      id,
      BodyDef(position, 0, 0, 0, b2Body.b2_staticBody),
      RectShape(8, 8),
      FixtureFn(1, 0, 0)
    );
  }
}

const physicalTiles = {
  5: Wall,
  6: Wall,
  7: Wall,
  91: Wall,
  99: Wall
}

// Initialize all existing walls
map1.layouts.forEach((layout) => {
  layout.forEach((row, y) => {
    row.forEach((frame, x) => {
      if (!physicalTiles[frame]) return;
      new physicalTiles[frame](randomHex(50), new b2Vec2(x * 16 + 8, y * 16 + 8));
    });
  });
});
