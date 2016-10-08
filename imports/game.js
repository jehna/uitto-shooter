export const gameObjects = {};

export function objByUserData(d) {
  switch(d.type) {
    case 'player':
      return players[d.id];
  }
}
