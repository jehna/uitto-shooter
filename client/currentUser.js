import { Players } from '../imports/api/players';
import { randomHex } from '../imports/helpers';
import { gameObjects } from '/imports/game.js'
import { uittoshooter } from '/client/uittoshooter'

export let myID;

function initializeUser() {
  myID = Meteor.default_connection._lastSessionId;
}
uittoshooter.onCreateGame(initializeUser);

export function getCurrentUser() {
  return gameObjects.Player[myID];
}
