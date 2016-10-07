import { Meteor } from 'meteor/meteor';
const Box2D = require('box2dweb');
import { objByUserData } from './game.js';

export const physics = new Box2D.Dynamics.b2World(
  new Box2D.Common.Math.b2Vec2(0, 0),     //gravity
  true                                     //allow sleep
);

// Main physics loop
Meteor.setInterval(() => {
  physics.Step(
    1 / 60,   //frame-rate
    1,       //velocity iterations
    1        //position iterations
  );
  physics.ClearForces();
}, 1000/60);

// Global contact listener
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
});
