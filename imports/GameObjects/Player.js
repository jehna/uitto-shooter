import { Meteor } from 'meteor/meteor';
import { Players } from '/imports/api/players.js';
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
  import { stage, canvas } from '/client/stage.js';
  import { myID, getCurrentUser } from '/client/currentUser.js';
  import { updateVisibility, distanceToCurrentUser, panFromCurrentUser } from '/client/helpers'
}

export default class Player extends GameObject {

  static create(id) {
    if (Meteor.isClient) return;
    super.create(Players, id, {kills: 0, deaths: 0});
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
      const spritesheet = new createjs.SpriteSheet({
        images: ['/player.png'],
        frames: {width: 14, height: 14, regX: 7, regY: 7},
      });

      onSoundLoaded('walking', () => {
        this.walkingSound = createjs.Sound.play('walking');
        this.walkingSound.loop = -1;
        this.walkingSound.volume = 0.2;
        this.walkingSound.paused = true;
      });

      this.sprite = new createjs.Container();
      this.playerIcon = new createjs.Sprite(spritesheet);
      this.playerIcon.gotoAndStop(1);
      this.sprite.addChild(this.playerIcon);
      stage.addChild(this.sprite);
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
    this.playerIcon.rotation = data.r * -180 / Math.PI;

    const velocity = this.data.v && (this.data.v.x || this.data.v.y);
    if (this.walkingSound && velocity && this.walkingSound.paused) {
      this.walkingSound.paused = false;
    } else if (this.walkingSound && !velocity && !this.walkingSound.paused) {
      this.walkingSound.paused = true;
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
      const hitModel = Hits.insert({x: hit.point.x, y: hit.point.y, shooter: { x: currPos.x, y: currPos.y }}, (_, id) => {
        // TODO: An ybetter way to send event to client?
        Meteor.setTimeout(() => {
          Hits.remove({_id: id});
        }, 1000);
      });

      // Did we hit another player?
      const hitUserData = hit.fixture.GetBody().GetUserData();
      if (hitUserData.type === 'Player') {
        const hitPlayer = gameObjects.Player[hitUserData.id];
        hitPlayer.hit();
        Players.update({_id: this.id}, {$inc: {kills: 1 }});
      }
    }
  }

  hit() {
    if (Meteor.isClient) return;
    Players.update({_id: this.id}, {$inc: {deaths: 1 }});
    this.body.SetPosition(new b2Vec2(24, 24));
    this.body.SetAngle(Math.PI);
    this.updateModel();
  }
}

// Initialize all existing players
Players.find({})
  .fetch()
  .forEach((p) => new Player(p._id, new b2Vec2(p.x, p.y), p.r));
