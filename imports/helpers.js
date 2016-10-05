export function randomHex(num) {
  return Array(num).fill(0).map(() => { return '0123456789abcdef'[Math.floor(Math.random() * 16)] }).join("")
}
