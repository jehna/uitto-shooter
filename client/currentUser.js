import { Players } from '../imports/api/players';
import { randomHex } from '../imports/helpers';
import { gameObjects } from '/imports/game.js'

export const myID = localStorage.myID || (localStorage.myID = randomHex(50))

function initializeUser() {
  if (Players._connection.status().connected) {
    if (Players.find({_id: myID}).count() === 0) {
      Meteor.call('createPlayer', myID)
    }
  } else {
    Meteor.setTimeout(initializeUser, 1000);
  }
}
initializeUser();

export function getCurrentUser() {
  return gameObjects.Player[myID];
}
