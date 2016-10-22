import { Meteor } from 'meteor/meteor';
import { gameObjects } from '/imports/game.js'
import { physics } from '/imports/physics.js'
import { randomHex } from '/imports/helpers'

export default class GameObject {
  static create(Model, id, addProps = {}) {
    if (Meteor.isClient) return;
    let model = Object.assign({_id: id, x:-100, y: -100, r: 0, color: '#' + randomHex(6)}, addProps);
    Model.insert(model)
    new this(id);
  }

  static destroy(Model, id) {
    if (Meteor.isClient) return;
    Model.remove({_id: id});
    const gameObj = gameObjects[this.name][id];
    physics.DestroyBody(gameObj.body);
    delete gameObjects[this.name][id];
  }

  constructor(id, bodyDef, shape, fixtureFn, Model) {
    this.type = this.constructor.name;
    this.id = id;
    this.bodyDef = bodyDef;
    this.shape = shape;
    this.fixture = fixtureFn(shape);
    this.body = physics.CreateBody(this.bodyDef);
    this.body.SetUserData({ id: id, type: this.type });
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
    if (!this.Model || Meteor.isClient) return;
    const pos = this.body.GetPosition();
    const r = this.body.GetTransform().GetAngle();
    this.Model.update({_id: this.id}, {$set: {x: pos.x, y: pos.y, r:r, v: this.velocity }});
  }
}

// GC loop
if (Meteor.isServer) {
  const removeBodies = [];
  Meteor.setInterval(() => {
    if (removeBodies.length) {
      do {
        physics.DestroyBody(removeBodies.pop())
      } while (removeBodies.length)
    }
  }, 10000);
}

// FixedUpdate loop
Meteor.setInterval(() => {
  Object.keys(gameObjects).map(key => gameObjects[key]).forEach((objectType) => {
    Object.keys(objectType).map(key => objectType[key]).forEach((object) => {
      object.fixedUpdate();
    });
  });
}, 1000/30);
