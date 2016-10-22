import { myID } from '/client/currentUser.js';
import { uittoshooter } from '/client/uittoshooter'

export const Input = {
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


uittoshooter.onCreateGame(() => {
  window.addEventListener('keydown', (e) => {
    Input.keysDown[e.which] = true;
  });
  window.addEventListener('keyup', (e) => {
    Input.keysDown[e.which] = false;
  });

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
  })

});
