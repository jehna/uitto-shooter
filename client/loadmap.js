import map1 from '/imports/maps/map1.json'
import { mapLayer } from '/client/stage.js';
import { updateVisibility } from '/client/helpers'

function LoadMap(map) {
  const tiles = new createjs.SpriteSheet({
    images: ['/basictiles.png'],
    frames: {width: 16, height: 16, regX: 0, regY: 0},
  });
  map.layers.forEach((layer) => {
    layer.data.forEach((frame, i) => {
      const x = i % layer.width;
      const y = Math.floor(i / layer.width);
      const tile = new createjs.Sprite(tiles);
      tile.gotoAndStop(frame - 1);
      tile.x = 16 * x;
      tile.y = 16 * y;
      mapLayer.addChild(tile);

      updateVisibility(tile, 0.7);
    });
  });
}

LoadMap(map1);
