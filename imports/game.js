export const gameObjects = {
  Player: {}
};

export function objByUserData(d) {
  switch(d.type) {
  case 'player':
    return players[d.id];
  }
}

export const gameModes = {
  DEATHMATCH: (new (function DeathmatchMode(){})),
  TEAM_DEATHMATCH: (new (function TeamDeathmatchMode(){}))
};

export const currentGameMode = gameModes.TEAM_DEATHMATCH;
