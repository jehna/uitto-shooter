import { uittoshooter } from '/client/uittoshooter'
require('createjs-easeljs');

export const playerLayer = new createjs.Container();
export const mapLayer = new createjs.Container();
export const stage = new createjs.Container();
export const canvas = document.createElement('canvas');
canvas.width = 480;
canvas.height = 240;
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
export const wholeStage = new createjs.Stage(canvas);
wholeStage.addChild(stage);
stage.addChild(mapLayer);
stage.addChild(playerLayer);
createjs.Ticker.framerate = 35;

function update() {
  wholeStage.update();
}

uittoshooter.onCreateGame(() => {
  createjs.Ticker.addEventListener("tick", update);
  document.body.appendChild(canvas);
});
