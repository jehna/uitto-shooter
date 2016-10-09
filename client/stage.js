require('createjs-easeljs');

export const stage = new createjs.Container();
export const canvas = document.createElement('canvas');
canvas.width = 480;
canvas.height = 320;
document.body.appendChild(canvas);
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
export const wholeStage = new createjs.Stage(canvas);
wholeStage.addChild(stage);

function update() {
  wholeStage.update();
}

createjs.Ticker.framerate = 30;
createjs.Ticker.addEventListener("tick", update);
