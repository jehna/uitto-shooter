import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Players } from '../imports/api/players'
import { randomHex } from '../imports/helpers'
import './main.html';

Template.body.onCreated(() => {
  setTimeout(() => {
    const canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const players = {};

    function render() {
      ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
      Object.keys(players).map((k) => players[k]).forEach((player) => {
        ctx.beginPath();
        ctx.fillStyle = player.color;
        ctx.arc(player.x, player.y, 20, 0, 2*Math.PI);
        ctx.fill();
      });
    }

    const myID = localStorage.myID || (localStorage.myID = randomHex(50))
    if (Players.find({_id: myID}).count() === 0) {
      Meteor.call('createPlayer', myID)
    }

    function move(x, y) {
      Meteor.call('move', x, y, myID);
    }

    setInterval(function updatePhysics() {
      var amountX = 0;
      var amountY = 0;

      if (Input.getKeyDown(Input.keys.up)) {
        amountY--;
      } else if (Input.getKeyDown(Input.keys.down)) {
        amountY++;
      }

      if (Input.getKeyDown(Input.keys.left)) {
        amountX--;
      } else if (Input.getKeyDown(Input.keys.right)) {
        amountX++;
      }

      if (amountX || amountY) {
        move(amountX, amountY);
      }
    }, 1000 / 60);

    window.addEventListener('keydown', (e) => {
      if (e.which === Input.keys.space) {
        console.log("pew!");
      }
    });


    const Input = {
      keysDown: {},
      keys: {
        up: 38,
        down: 40,
        left: 37,
        right: 39,
        space: 32
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

    Players.find({}).observe({
      addedAt: function(player, idx) {
        players[idx] = player;
        render();
      },
      changedAt: function(player, _, idx) {
        players[idx] = player;
        render();
      },
      removedAt(_, idx) {
        delete players[idx];
        render();
      }
    });
  }, 0);
});

Template.body.helpers({
  players() {
    return Players.find({});
  },
});
/*
Template.hello.helpers({
counter() {
return Template.instance().counter.get();
},
});

Template.hello.events({
'click button'(event, instance) {
// increment the counter when button is clicked
instance.counter.set(instance.counter.get() + 1);
},
});
*/
