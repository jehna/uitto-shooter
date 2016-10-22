import { Log } from '/imports/api/log.js'
import { wholeStage, mapLayer } from '/client/stage.js';
import { gameObjects } from '/imports/game.js'
import { myID } from '/client/currentUser.js';
import { spritesheet } from '/imports/GameObjects/Player.js';

require('createjs-easeljs');

const logText = new createjs.Text('', '6px Arial', '#FFFFFF');
logText.lineHeight = 4;
wholeStage.addChild(logText);

const logTexts = [];
function addLogText(text) {
  logTexts.unshift(text);
  logTexts.length = Math.min(logTexts.length, 6);
  logText.text = logTexts.join('\n');
}

Meteor.setTimeout(() => {
  Log.find({}).observe({
    added: function(data) {
      switch(data.type) {
        case 'kill':
          const by = gameObjects.Player[data.by];
          const who = gameObjects.Player[data.who];
          const byName = by.data.color + (by.id === myID ? ' (you)' : '');
          const whoName = who.data.color + (who.id === myID ? ' (you)' : '');
          addLogText(`${byName} ︻デ═一 ${whoName}`);

          const deadBody = new createjs.Sprite(spritesheet);
          deadBody.gotoAndStop('dead');
          deadBody.x = data.position.x;
          deadBody.y = data.position.y;
          deadBody.rotation = data.position.r * -180 / Math.PI + 90;
          Meteor.setTimeout(() => {
            mapLayer.addChild(deadBody);
          }, 1000);
          break;
        default:
          break;
      }
      addLogText()
    }
  });
}, 1000);