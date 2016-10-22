require('createjs-easeljs');

export const playerLayer = new createjs.Container();
export const mapLayer = new createjs.Container();
export const stage = new createjs.Container();
export const canvas = document.createElement('canvas');
canvas.width = 480;
canvas.height = 240;
document.body.appendChild(canvas);
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
export const wholeStage = new createjs.Stage(canvas);
wholeStage.addChild(stage);
stage.addChild(mapLayer);
stage.addChild(playerLayer);

function update() {
  wholeStage.update();
}

createjs.Ticker.framerate = 35;
createjs.Ticker.addEventListener("tick", update);
