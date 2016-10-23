import { wholeStage } from '/client/stage';
import { leftpad } from '/client/stats';
import { gameOver } from '/client/gameover';
import { uittoshooter } from '/client/uittoshooter';

uittoshooter.onCreateGame(() => {
  Meteor.call('getRoundInfo', (_, { roundEnds }) => {
    const timer = new createjs.Text('', '10px monospace', '#ffffff');
    timer.x = 200;
    timer.lineHeight = 10;
    wholeStage.addChild(timer);
    Meteor.setInterval(() => {
      const diff = roundEnds - Date.now();
      if (diff >= -1000) {
        timer.text = [1000 * 60, 1000].map(t => leftpad(Math.max(Math.floor(diff / t % 60), 0), 2, '0')).join(':');
      } else {
        gameOver();
      }
    }, 1000);
  });
});
