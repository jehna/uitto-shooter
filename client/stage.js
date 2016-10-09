require('createjs-easeljs');

export const stage = new createjs.Container();
export const canvas = document.createElement('canvas');
canvas.width = 450;
canvas.height = 200;
document.body.appendChild(canvas);
export const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
export const wholeStage = new createjs.Stage(canvas);
wholeStage.addChild(stage);
export function render() {
  wholeStage.update();
}