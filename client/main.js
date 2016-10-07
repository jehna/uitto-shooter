import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Players } from '../imports/api/players'
import { Bullets } from '../imports/api/bullets';
import { randomHex } from '../imports/helpers'
import './main.html';
require('createjs-easeljs');

Template.body.onCreated(() => {
  setTimeout(() => {
    const stage = new createjs.Stage('canvas');
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const players = {};
    const bullets = {};

    function render() {
      stage.update();
    }

    const myID = localStorage.myID || (localStorage.myID = randomHex(50))
    if (Players.find({_id: myID}).count() === 0) {
      Meteor.call('createPlayer', myID)
    }

    function move(x, y, r) {
      Meteor.call('move', x, y, r, myID);
    }

    setInterval(function updatePhysics() {
      var amountX = 0;
      var amountY = 0;
      var amountRot = 0;

      if (Input.getKeyDown(Input.keys.w)) {
        amountY--;
      } else if (Input.getKeyDown(Input.keys.s)) {
        amountY++;
      }

      if (Input.getKeyDown(Input.keys.a)) {
        amountX--;
      } else if (Input.getKeyDown(Input.keys.d)) {
        amountX++;
      }

      if (Input.getKeyDown(Input.keys.left)) {
        amountRot--;
      } else if (Input.getKeyDown(Input.keys.right)) {
        amountRot++;
      }

      if (amountX || amountY || amountRot) {
        move(amountX, amountY, amountRot);
      }
    }, 1000 / 60);

    window.addEventListener('keydown', (e) => {
      if (e.which === Input.keys.space) {
        Meteor.call('shoot', myID);
      }
    });


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

    window.addEventListener('keydown', (e) => {
      Input.keysDown[e.which] = true;
    });
    window.addEventListener('keyup', (e) => {
      Input.keysDown[e.which] = false;
    });

    class Player {
      constructor(data) {
        this.sprite = new createjs.Shape();
        this.sprite.graphics.beginFill(data.color).drawRect(-15, -15, 30, 30);
        stage.addChild(this.sprite);

        this.setData(data);
      }

      setData(data) {
        this.data = data;
        this.sprite.x = data.x;
        this.sprite.y = data.y;
        this.sprite.rotation = data.rotation;
      }
    }

    class Bullet {
      constructor(data) {
        this.sprite = new createjs.Shape();
        this.sprite.graphics.beginFill(data.color).drawCircle(0, 0, 5);
        stage.addChild(this.sprite);

        this.setData(data);
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

    Bullets.find({}).observe({
      added: function(data) {
        bullets[data._id] = new Bullet(data);
        render();
      },
      changed: function(data, _) {
        bullets[data._id].setData(data);
        render();
      },
      removed: function(data) {
        stage.removeChild(bullets[data._id].sprite);
      }
    });
  }, 0);
});

Template.body.helpers({
  players() {
    return Players.find({});
  },
});
