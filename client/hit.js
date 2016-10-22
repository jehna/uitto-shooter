import { mapLayer } from '/client/stage.js';
import { Hits } from '../imports/api/hits';
import { gameObjects } from '/imports/game.js';
import { playSoundAt } from '/client/sounds';
require('createjs-easeljs');

const hitSpritesheet = new createjs.SpriteSheet({
  images: ['/poof.png'],
  animations: {
    poof: [0,4,'stop',0.75],
    stop: [5,5]
  },
  frames: {width: 16, height: 16, regX: 8, regY: 8},
});

class Hit {
  constructor(data) {
    this.sprite = new createjs.Sprite(hitSpritesheet);
    this.sprite.loop = 1;
    mapLayer.addChild(this.sprite);
    this.sprite.gotoAndPlay('poof');
    setTimeout(() => {
      mapLayer.removeChild(this.sprite);
    }, 1000);

    let shooter = gameObjects.Player[data.shooter];
    playSoundAt(shooter.data.x, shooter.data.y, 'gunshot');
    shooter.playerIcon.gotoAndPlay(shooter.walkingSound.paused ? 'shootIdle' : 'shootWalk');

    this.setData(data);
  }

  setData(data) {
    this.data = data;
    this.sprite.x = data.x;
    this.sprite.y = data.y;
  }
}

Hits.find({}).observe({
  added: function(data) {
    new Hit(data);
  }
});
