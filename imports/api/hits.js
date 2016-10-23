import { Mongo } from 'meteor/mongo';

export const Hits = new Mongo.Collection('hits');

if (Meteor.isServer) Hits.remove({});
