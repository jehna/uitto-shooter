export function randomHex(num) {
  return Array(num).fill(0).map(() => { return '0123456789abcdef'[Math.floor(Math.random() * 16)] }).join("")
}

export function rotate(cx, cy, x, y, radians) {
    var cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}
