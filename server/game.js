export const players = {};

export function objByUserData(d) {
  switch(d.type) {
    case 'player':
      return players[d.id];
  }
}
