import { gameObjects } from '../game.js'
import { physics } from '../physics.js'
import { randomHex } from '../../imports/helpers'

export default class GameObject {
  static create(Model, id) {
    Model.insert({_id: id, x:-100, y: -100, r: 0, color: '#' + randomHex(6)})
    new this(id);
  }

  constructor(id, bodyDef, shape, fixtureFn, Model) {
    this.type = this.constructor.name;
    this.id = id;
    this.bodyDef = bodyDef;
    this.shape = shape;
    this.fixture = fixtureFn(shape);
    this.body = physics.CreateBody(this.bodyDef);
    this.body.SetUserData({ id: id });
    this.body.CreateFixture(this.fixture);
    gameObjects[this.type] = gameObjects[this.type] || {}
    gameObjects[this.type][id] = this;
    this.Model = Model;
    this.updateModel();
  }

  fixedUpdate() {
    if (this.body.IsAwake()) {
      this.updateModel();
    }
  }

  updateModel() {
    const pos = this.body.GetPosition();
    const r = this.body.GetTransform().GetAngle();
    this.Model.update({_id: this.id}, {$set: {y: pos.x, x: pos.y, r:r }});
  }
}

// GC loop
const removeBodies = [];
Meteor.setInterval(() => {
  if (removeBodies.length) {
    do {
      physics.DestroyBody(removeBodies.pop())
    } while (removeBodies.length)
  }
}, 10000);

// FixedUpdate loop
Meteor.setInterval(() => {
  Object.keys(gameObjects).map(key => gameObjects[key]).forEach((objectType) => {
    Object.keys(objectType).map(key => objectType[key]).forEach((object) => {
      object.fixedUpdate();
    });
  });
}, 1000/30);
