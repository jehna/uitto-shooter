import { gameObjects, gameModes, currentGameMode } from '/imports/game';
import { uittoshooter } from '/client/uittoshooter';
import { generateStats } from '/client/stats';
import { canvas } from '/client/stage';

let gameIsOver = false;
export function gameOver() {
  if (gameIsOver) return;
  gameIsOver = true;

  document.body.removeChild(canvas);
  document.body.classList = '';

  document.getElementById("winning").innerText = `${whoWon()}\n\n\n\n${generateStats()}`
  document.getElementById("gameover").style.display = "block"
}


function whoWon() {
  const players = Object.values(gameObjects.Player).sort((a,b) => b.data.kills - a.data.kills);
  if (currentGameMode === gameModes.DEATHMATCH) {
    return `${players[0]} won the game!`;
  } else if (currentGameMode === gameModes.TEAM_DEATHMATCH) {
    const blueTeamKills = players.filter(player => player.team === 'blue').reduce((c, p) => c + p.data.kills, 0);
    const redTeamKills = players.filter(player => player.team === 'red').reduce((c, p) => c + p.data.kills, 0);

    if (blueTeamKills === redTeamKills) {
      return `Draw game`
    } else {
      return `${blueTeamKills > redTeamKills ? 'Blue' : 'Red'} team won!`
    }
  }
}
