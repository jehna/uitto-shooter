import './main.html';
import { uittoshooter } from '/client/uittoshooter'
import { myID } from '/client/currentUser'
require('/imports/GameObjects/Wall');
//require('/imports/debug.js');

Template.body.onCreated(() => {

});

Template.body.events({
  'submit .play-game'(event) {
    event.preventDefault();

    const target = event.target;
    const nick = target.nick.value;

    target.parentElement.removeChild(target);

    uittoshooter._onCreateGame.forEach(fn => fn());
    Meteor.call('createPlayer', myID, nick);
  }
});
