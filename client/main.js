import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Players } from '../imports/api/players'
import { Hits } from '../imports/api/hits';
import { randomHex } from '../imports/helpers'
import { map1 } from '../imports/maps'
import './main.html';
require('createjs-easeljs');

Template.body.onCreated(() => {
  setTimeout(() => {
    const stage = new createjs.Stage('canvas');
    const canvas = document.getElementById('canvas');
    canvas.width = 450;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const players = {};

    function render() {
      stage.update();
    }

    const myID = localStorage.myID || (localStorage.myID = randomHex(50))
    if (Players.find({_id: myID}).count() === 0) {
      Meteor.call('createPlayer', myID)
    }

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
        w: 87
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

    move(Input.keys.w, 0, -1, 0);
    move(Input.keys.s, 0, 1, 0);
    move(Input.keys.a, 1, 0, 0);
    move(Input.keys.d, -1, 0, 0);
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

    class Player {
      constructor(data) {
        this.sprite = new createjs.Shape();
        this.sprite.graphics.beginFill(data.color).drawRect(-5, -5, 10, 10);
        stage.addChild(this.sprite);

        this.setData(data);
      }

      setData(data) {
        this.data = data;
        this.sprite.x = data.x;
        this.sprite.y = data.y;
        this.sprite.rotation = data.r * -180 / Math.PI;
      }
    }

    class Hit {
      constructor(data) {
        this.sprite = new createjs.Shape();
        this.sprite.graphics.beginFill('#FF0000').drawCircle(0, 0, 2);
        stage.addChild(this.sprite);
        setTimeout(() => {
          stage.removeChild(this.sprite);
          render();
        }, 1000)

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
        players[data._id] = new Player(data);
        render();
      },
      changedAt: function(data, _, idx) {
        players[data._id].setData(data);
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
          });
        });
      });
    }

    LoadMap(map1);

  }, 0);
});

Template.body.helpers({
  players() {
    return Players.find({});
  },
});
