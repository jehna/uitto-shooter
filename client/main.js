import { uittoshooter } from '/client/uittoshooter'
import './main.html';
//require('/imports/debug.js');

Template.body.onCreated(() => {
  Meteor.setTimeout(() => {
    uittoshooter._onCreateGame.forEach(fn => fn());
  }, 1000);
});
