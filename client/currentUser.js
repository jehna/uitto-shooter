import { Players } from '../imports/api/players';
import { randomHex } from '../imports/helpers';
import { gameObjects } from '/imports/game.js'
import { uittoshooter } from '/client/uittoshooter'

export let myID;

function initializeUser() {
  myID = Meteor.default_connection._lastSessionId;
  
  if (Players._connection.status().connected) {
    if (Players.find({_id: myID}).count() === 0) {
      Meteor.call('createPlayer', myID)
    }
  } else {
    Meteor.setTimeout(initializeUser, 1000);
  }
}
uittoshooter.onCreateGame(initializeUser);

export function getCurrentUser() {
  return gameObjects.Player[myID];
}
