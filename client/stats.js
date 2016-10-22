import { wholeStage } from '/client/stage.js';
import { Input } from '/client/input'
import { gameObjects } from '/imports/game'
import { myID } from '/client/currentUser';

function leftpad (str, len, ch) {
  str = String(str);
  var i = -1;
  if (!ch && ch !== 0) ch = ' ';
  len = len - str.length;
  while (++i < len) {
    str = ch + str;
  }
  return str;
}
function rightpad (s, n, c) {
  if (! s || ! c || s.length >= n) {
    return s;
  }
  var max = (n - s.length)/c.length;
  for (var i = 0; i < max; i++) {
    s += c;
  }
  return s;
}

const stats = new createjs.Text('', "8px monospace", "#ffffff");
stats.x = 100;
stats.lineHeight = 10;
wholeStage.addChild(stats);

function showStats() {
  let statsText = '';
  statsText += leftpad('',34,'=') + '\n';
  statsText += '|' + leftpad('',32,' ') + '|\n';
  statsText += '| ' + rightpad('Player', 16, ' ') + leftpad('Kills', 7, ' ') + leftpad('Deaths', 7, ' ') + ('',28,' ') + '|\n';
  Object.keys(gameObjects.Player).map((key) => gameObjects.Player[key]).forEach((player) => {
    const playerName = player.data.color + (player.data._id === myID ? ' (you)' : '');
    statsText += '| ' + rightpad(playerName, 16, ' ') + leftpad(player.data.kills, 7, ' ') + leftpad(player.data.deaths, 7, ' ') + ('',28,' ') + '|\n';
  });
  statsText += '|' + leftpad('',32,' ') + '|\n';
  statsText += leftpad('',34,'=') + '\n';
  stats.text = statsText;
}
function hideStats() {
  stats.text = '';
}

window.addEventListener('keydown', (e) => {
  if (e.which !== Input.keys.tab) return;
  e.preventDefault();
  showStats();
});
window.addEventListener('keyup', (e) => {
  if (e.which !== Input.keys.tab) return;
  e.preventDefault();
  hideStats();
});
