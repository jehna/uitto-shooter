export const gameObjects = {
  Player: {}
};

export function objByUserData(d) {
  switch(d.type) {
    case 'player':
      return players[d.id];
  }
}
