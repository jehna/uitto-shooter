import { Collision, Common, Dynamics } from 'box2dweb';
const { b2BodyDef, b2Body, b2FixtureDef } = Dynamics;
const { b2Vec2 } = Common.Math;

export function BodyDef(position = new b2Vec2(300, 300), angle = 0, linearDamping = 0, angularDamping = 0, type = b2Body.b2_dynamicBody) {
  const bodyDef = new b2BodyDef();
  bodyDef.type = type;
  bodyDef.position = position;
  bodyDef.angle = angle;
  bodyDef.linearDamping = linearDamping;
  bodyDef.angularDamping = angularDamping;
  return bodyDef;
}

export function RectShape(width, height) {
  const shape = new Collision.Shapes.b2PolygonShape();
  shape.SetAsBox(width, height);
  return shape;
}

export function FixtureFn(density = 0.5, friction = 0.5, restitution = 0.5) {
  return (shape) => {
    const fixture = new b2FixtureDef();
    fixture.density = density;
    fixture.friction = friction;
    fixture.restitution = restitution;
    fixture.shape = shape;
    return fixture;
  }
}
