import { wholeStage } from '/client/stage.js';
import { Input } from '/client/input'
import { gameObjects, gameModes, currentGameMode } from '/imports/game'
import { uittoshooter } from '/client/uittoshooter'
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

const stats = new createjs.Text('', "10px monospace", "#ffffff");
stats.x = 100;
stats.lineHeight = 10;
wholeStage.addChild(stats);

function generateStatsString(players) {
    let statsText = '';
    statsText += leftpad('',34,'=') + '\n';
    statsText += '|' + leftpad('',32,' ') + '|\n';
    statsText += '| ' + rightpad('Player', 16, ' ') + leftpad('Kills', 7, ' ') + leftpad('Deaths', 7, ' ') + ('',28,' ') + '|\n';
    players.forEach((player) => {
      const playerName = player.data.nick + (player.data._id === myID ? ' (you)' : '');
      statsText += '| ' + rightpad(playerName, 16, ' ') + leftpad(player.data.kills, 7, ' ') + leftpad(player.data.deaths, 7, ' ') + ('',28,' ') + '|\n';
    });
    statsText += '|' + leftpad('',32,' ') + '|\n';
    statsText += leftpad('',34,'=') + '\n';
    return statsText;
}

function showStats() {
  const players = Object.values(gameObjects.Player).sort((a,b) => b.data.kills - a.data.kills);
  if (currentGameMode === gameModes.DEATHMATCH) {
    stats.text = generateStatsString(players);
  } else if (currentGameMode === gameModes.TEAM_DEATHMATCH) {
    const blueTeam = players.filter(player => player.team === 'blue');
    const redTeam = players.filter(player => player.team === 'red');
    stats.text =
`Blue team:
${generateStatsString(blueTeam)}

Red team:
${generateStatsString(redTeam)}`;
  }
}
function hideStats() {
  stats.text = '';
}

uittoshooter.onCreateGame(() => {
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
});
