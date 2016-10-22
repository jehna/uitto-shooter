import { assets } from '/client/assets'
import { uittoshooter } from '/client/uittoshooter'
import { mapLayer } from '/client/stage.js';
import { Hits } from '../imports/api/hits';
import { gameObjects } from '/imports/game.js';
import { playSoundAt } from '/client/sounds';
require('createjs-easeljs');

class Hit {
  
  static hitSpritesheet() {
    return new createjs.SpriteSheet({
      images: [assets.getResult('hitSpritesheet')],
      animations: {
        poof: [0,4,'stop',0.75],
        stop: [5,5]
      },
      frames: {width: 16, height: 16, regX: 8, regY: 8},
    });
  }

  constructor(data) {
    this.sprite = new createjs.Sprite(Hit.hitSpritesheet());
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

uittoshooter.onCreateGame(() => {
  Hits.find({}).observe({
    added: function(data) {
      new Hit(data);
    }
  });
});

assets.loadFile({ id: 'hitSpritesheet', src: '/poof.png' });
