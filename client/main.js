import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Players } from '../imports/api/players'
import { Hits } from '../imports/api/hits';
import Wall from '/imports/GameObjects/Wall'
import Player from '/imports/GameObjects/Player'
import { physics } from '/imports/physics.js'
import { gameObjects } from '/imports/game.js'
import { map1 } from '../imports/maps'
import { playSoundAt } from '/client/sounds'
import { stage, render, canvas, ctx } from '/client/stage.js';
import { myID, getCurrentUser } from '/client/currentUser.js';
import { Common } from 'box2dweb';
import { updateVisibility } from '/client/helpers'
const { b2Vec2 } = Common.Math;
import './main.html';
require('createjs-easeljs');
//require('/imports/debug.js');

Template.body.onCreated(() => {
  setTimeout(() => {

    const Input = {
      keysDown: {},
      keys: {
        up: 38,
        down: 40,
        left: 37,
        right: 39,
        space: 32,
        a: 65,
        s: 83,
        d: 68,
        w: 87,
        tab: 9
      },
      getKeyDown(key) {
        return Input.keysDown[key];
      }
    }

    const currMove = {x: 0, y: 0, r: 0};
    function move(key, x, y, r) {
      let isDown = false;
      window.addEventListener('keydown', (e) => {
        if (e.which !== key || isDown) return;
        isDown = true;
        if(x) currMove.x = x;
        if(y) currMove.y = y;
        if(r) currMove.r = r;
        Meteor.call('move', currMove.x, currMove.y, currMove.r, myID);
      });

      window.addEventListener('keyup', (e) => {
        if (e.which !== key) return;
        isDown = false;
        if(x) currMove.x = 0;
        if(y) currMove.y = 0;
        if(r) currMove.r = 0;
        Meteor.call('move', currMove.x, currMove.y, currMove.r, myID);
      });
    }

    move(Input.keys.w, 1, 0, 0);
    move(Input.keys.s, -1, 0, 0);
    move(Input.keys.a, 0, 1, 0);
    move(Input.keys.d, 0, -1, 0);
    move(Input.keys.left, 0, 0, 1);
    move(Input.keys.right, 0, 0, -1);

    window.addEventListener('keydown', (e) => {
      if (e.which === Input.keys.space) {
        Meteor.call('shoot', myID);
      }
    });

    window.addEventListener('keydown', (e) => {
      Input.keysDown[e.which] = true;
    });
    window.addEventListener('keyup', (e) => {
      Input.keysDown[e.which] = false;
    });

    window.addEventListener('keydown', (e) => {
      if (e.which !== Input.keys.tab) return;
      e.preventDefault();
      showStats();
    });
    window.addEventListener('keyup', (e) => {
      if (e.which !== Input.keys.tab) return;
      e.preventDefault();
      hideStats();
    });

    class Hit {
      constructor(data) {
        this.sprite = new createjs.Shape();
        this.sprite.graphics.beginFill('#FF0000').drawCircle(0, 0, 2);
        stage.addChild(this.sprite);
        setTimeout(() => {
          stage.removeChild(this.sprite);
          render();
        }, 1000);
        playSoundAt(data.shooter.x, data.shooter.y, 'gunshot');

        this.setData(data);
        render();
      }

      setData(data) {
        this.data = data;
        this.sprite.x = data.x;
        this.sprite.y = data.y;
      }
    }

    Players.find({}).observe({
      addedAt: function(data, idx) {
        new Player(data._id);
        gameObjects.Player[data._id].setData(data);
        render();
      },
      changedAt: function(data, _, idx) {
        gameObjects.Player[data._id].setData(data);
        render();
      }
    });

    Hits.find({}).observe({
      added: function(data) {
        new Hit(data);
      }
    });

    function LoadMap(map) {

      const tiles = new createjs.SpriteSheet({
        images: [map.spritesheet],
        frames: {width: 16, height: 16, regX: 0, regY: 0},
      });
      if (!tiles.complete)
      tiles.addEventListener("complete", render);

      map.layouts.forEach((layout) => {
        layout.forEach((row, y) => {
          row.forEach((frame, x) => {
            if (frame < 0) return;
            const tile = new createjs.Sprite(tiles);
            tile.gotoAndStop(frame);
            tile.x = 16 * x;
            tile.y = 16 * y;
            stage.addChild(tile);

            updateVisibility(tile, 0.7);
          });
        });
      });
    }

    LoadMap(map1);


    // Stats
    function leftpad (str, len, ch) {
      str = String(str);
      var i = -1;
      if (!ch && ch !== 0) ch = ' ';
      len = len - str.length;
      while (++i < len) {
        str = ch + str;
      }
      return str;
    }
    function rightpad (s, n, c) {
      if (! s || ! c || s.length >= n) {
        return s;
      }
      var max = (n - s.length)/c.length;
      for (var i = 0; i < max; i++) {
        s += c;
      }
      return s;
    }

    const stats = new createjs.Text('', "8px monospace", "#ffffff");
    stats.x = 100;
    stats.lineHeight = 10;
    stage.addChild(stats);

    function showStats() {
      let statsText = '';
      statsText += leftpad('',34,'=') + '\n';
      statsText += '|' + leftpad('',32,' ') + '|\n';
      statsText += '| ' + rightpad('Player', 16, ' ') + leftpad('Kills', 7, ' ') + leftpad('Deaths', 7, ' ') + ('',28,' ') + '|\n';
      Object.keys(gameObjects.Player).map((key) => gameObjects.Player[key]).forEach((player) => {
        const playerName = player.data.color + (player.data._id === myID ? ' (you)' : '');
        statsText += '| ' + rightpad(playerName, 16, ' ') + leftpad(player.data.kills, 7, ' ') + leftpad(player.data.deaths, 7, ' ') + ('',28,' ') + '|\n';
      });
      statsText += '|' + leftpad('',32,' ') + '|\n';
      statsText += leftpad('',34,'=') + '\n';
      stats.text = statsText;
      render();
    }
    function hideStats() {
      stats.text = '';
      render();
    }

  }, 0);
});

Template.body.helpers({
  players() {
    return Players.find({});
  },
});
