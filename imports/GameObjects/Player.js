import { Meteor } from 'meteor/meteor';
import { Players } from '/imports/api/players.js';
import { Log } from '/imports/api/log.js';
import { Hits } from '/imports/api/hits.js';
import GameObject from './GameObject.js'
import { Common } from 'box2dweb';
const { b2Vec2 } = Common.Math;
import { BodyDef, RectShape, CircleShape, FixtureFn } from '/imports/box2dBuilders';
import { rotate } from '/imports/helpers.js'
import { physics } from '/imports/physics.js'
import { gameObjects } from '/imports/game.js'
if (Meteor.isClient) {
  import { onSoundLoaded } from '/client/sounds';
  import { playerLayer, canvas, stage } from '/client/stage.js';
  import { myID, getCurrentUser } from '/client/currentUser.js';
  import { updateVisibility, distanceToCurrentUser, panFromCurrentUser } from '/client/helpers'

  export const spritesheet = new createjs.SpriteSheet({
    images: ['/player.png'],
    animations: {
      idle: 0,
      walk: {
        frames: [1,2,0,3,4,0],
        next: 'walk',
        speed: 0.3
      },
      shootIdle: [3,4,'idle',0.5],
      shootWalk: [3,4,'walk',0.5],
      death: [5,6,'dead',0.2],
      dead: [6],
    },
    frames: {width: 16, height: 16, regX: 8, regY: 8, margin: 0},
  });
}

export default class Player extends GameObject {

  static create(id) {
    if (Meteor.isClient) return;
    super.create(Players, id, {kills: 0, deaths: 0, dead: false});
  }

  constructor(id, position = new b2Vec2(30, 30), angle = 0) {
    super(
      id,
      BodyDef(position, angle, 10, 0),
      CircleShape(7),
      FixtureFn(0, 1, 0),
      Players
    );
    this.speed = 80;
    this.rotateSpeed = 3;

    if (Meteor.isClient) {

      onSoundLoaded('walking', () => {
        this.walkingSound = createjs.Sound.play('walking');
        this.walkingSound.loop = -1;
        this.walkingSound.volume = 0.2;
        this.walkingSound.play();
        this.walkingSound.paused = true;
      });

      this.sprite = new createjs.Container();
      this.playerIcon = new createjs.Sprite(spritesheet, 'idle');
      this.sprite.addChild(this.playerIcon);
      playerLayer.addChild(this.sprite);
      if (id !== myID) {
        updateVisibility(this.sprite, 0.0, id);
      }

      this.playerLabel = new createjs.Text('', "8px Arial", "#ffffff");
      this.playerLabel.textAlign = 'center';
      this.playerLabel.y = 8;
      this.playerLabel.alpha = id === myID ? 0 : 0.7;
      this.sprite.addChild(this.playerLabel)
    }
  }

  setData(data) {
    this.data = data;
    this.sprite.x = data.x;
    this.sprite.y = data.y;
    this.body.SetPosition(new b2Vec2(data.x, data.y));
    this.playerIcon.rotation = data.r * -180 / Math.PI + 90;

    const velocity = this.data.v && (this.data.v.x || this.data.v.y);
    if (this.walkingSound && velocity && this.walkingSound.paused) {
      this.walkingSound.paused = false;
      this.playerIcon.gotoAndPlay('walk');
    } else if (this.walkingSound && !velocity && !this.walkingSound.paused) {
      this.walkingSound.paused = true;
      this.playerIcon.gotoAndPlay('idle');
    }

    if (this.data._id === myID) {
      stage.x = -data.x + canvas.width / 2;
      stage.y = -data.y + canvas.height / 2;
    } else {
      if (this.walkingSound) {
        this.walkingSound.volume = 0.5 - distanceToCurrentUser(this.data.x, this.data.y) / 100 * 0.5;
        this.walkingSound.pan = panFromCurrentUser(this.data.x, this.data.y);
      }
    }

    if (this.data.dead !== this.dead) {
      this.dead = this.data.dead;
      if (this.dead) {
        this.playerIcon.gotoAndPlay('death');
      } else {
        this.playerIcon.gotoAndPlay('idle');
      }
    }
  }

  setName(name) {
    this.name = name;
    this.playerLabel.text = name;
  }

  fixedUpdate() {
    super.fixedUpdate();
    if (Meteor.isServer && this.body.IsAwake() && this.velocity) {
      const [nx, ny] = rotate(0, 0, this.velocity.x, this.velocity.y, this.body.GetAngle());
      const to = new b2Vec2(nx, ny)
      to.Normalize();
      to.Multiply(this.speed);
      this.body.SetLinearVelocity(to);
    }
  }

  setVelocityAndAngle(velocity, angle) {
    this.body.SetAwake(true);
    this.velocity = velocity;
    this.body.SetAngularVelocity(angle * this.rotateSpeed);
  }

  shoot() {
    if (Meteor.isClient) return;
    const [nx, ny] = rotate(0, 0, 0, 1, this.body.GetAngle());
    const from = new b2Vec2(nx, ny)
    from.Normalize();
    from.Multiply(1);
    const to = from.Copy();
    to.Multiply(300);
    const currPos = this.body.GetPosition();
    to.Add(currPos);
    from.Add(currPos);
    const hits = [];
    const cb = (fixture, point, normal, fraction) => hits.push({fixture, point, normal, fraction});
    physics.RayCast(cb, from, to);
    const hit = hits.sort((a,b) => b.fraction - a.fraction).pop();
    if (hit) {
      const hitModel = Hits.insert({x: hit.point.x, y: hit.point.y, shooter: this.id}, (_, id) => {
        // TODO: An ybetter way to send event to client?
        Meteor.setTimeout(() => {
          Hits.remove({_id: id});
        }, 1000);
      });

      // Did we hit another player?
      const hitUserData = hit.fixture.GetBody().GetUserData();
      if (hitUserData.type === 'Player') {
        const hitPlayer = gameObjects.Player[hitUserData.id];
        Players.update({_id: this.id}, {$inc: {kills: 1 }});
        const hitPlayerPosition = hitPlayer.body.GetPosition().Copy();
        Log.insert({type: 'kill', by: this.id, who: hitPlayer.id, position: { x: hitPlayerPosition.x, y: hitPlayerPosition.y, r: hitPlayer.body.GetAngle() }});
        hitPlayer.hit();
      }
    }
  }

  hit() {
    if (Meteor.isClient) return;
    Players.update({_id: this.id}, {$inc: {deaths: 1 }, $set: { dead: true }});
    this.updateModel();
    Meteor.setTimeout(() => {
      this.body.SetPosition(new b2Vec2(24, 24));
      this.body.SetAngle(Math.PI);
      this.updateModel();
      Players.update({_id: this.id}, {$set: { dead: false }});
    }, 1000);
  }
}

// Initialize all existing players
Players.find({})
  .fetch()
  .forEach((p) => new Player(p._id, new b2Vec2(p.x, p.y), p.r));
