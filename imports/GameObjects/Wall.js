import GameObject from './GameObject.js';
import { Common, Dynamics } from 'box2dweb';
const { b2Vec2 } = Common.Math;
const { b2BodyDef, b2Body, b2FixtureDef } = Dynamics;
import { BodyDef, RectShape, FixtureFn } from '/imports/box2dBuilders';
import { randomHex } from '/imports/helpers.js';
import map1 from '/imports/maps/map1.json';

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

// Initialize all existing walls
map1.layers.forEach((layer) => {
  layer.data.forEach((frame, i) => {
    const x = i % layer.width;
    const y = Math.floor(i / layer.width);
    if (frame === 0 || !map1.tilesets[0].tileproperties[frame-1] || !map1.tilesets[0].tileproperties[frame-1].wall) return;
    new Wall(randomHex(50), new b2Vec2(x * 16 + 8, y * 16 + 8));
  });
});
