import { Players } from '../../imports/api/players.js';
import { physics } from '../physics.js'
import { players } from '../game.js'
const Box2D = require('box2dweb');

export default class Player {
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

Players.find({}).fetch().forEach((p) => {
  players[p._id] = new Player(p._id);
  players[p._id].body.SetPosition(new Box2D.Common.Math.b2Vec2(p.y, p.x));
  players[p._id].body.SetAngle(Math.PI/180*p.rotation);
});
