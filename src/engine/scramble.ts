import { invertAlgorithm } from './moves';

const FACES = ['U', 'D', 'L', 'R', 'F', 'B'] as const;
const AXIS_OF: Record<string, number> = { U: 0, D: 0, L: 1, R: 1, F: 2, B: 2 };
const SUFFIX = ['', "'", '2'];

/**
 * Sinh scramble ngẫu nhiên.
 * Quy tắc: không lặp cùng mặt liền nhau, và không để 3 nước liên tiếp cùng trục
 * (tránh "R L R" bị dư thừa).
 * `rng` có thể truyền vào (vd seed) để test được.
 */
export function generateScramble(length = 20, rng: () => number = Math.random): string {
  const moves: string[] = [];
  let last = -1;
  let prevAxis = -1;
  let prevPrevAxis = -1;
  while (moves.length < length) {
    const fi = Math.floor(rng() * FACES.length);
    const face = FACES[fi];
    const axis = AXIS_OF[face];
    if (fi === last) continue;
    if (axis === prevAxis && axis === prevPrevAxis) continue;
    moves.push(face + SUFFIX[Math.floor(rng() * 3)]);
    prevPrevAxis = prevAxis;
    prevAxis = axis;
    last = fi;
  }
  return moves.join(' ');
}

/**
 * Scramble đưa khối đã giải về đúng case của một thuật toán:
 * áp nghịch đảo của thuật toán lên khối đã giải. Giải lại bằng chính
 * thuật toán đó là về solved. Dùng được trực tiếp cho OLL/PLL;
 * Cross/F2L cần thêm bước thiết lập (làm ở bước sau).
 */
export function scrambleForAlgorithm(algorithm: string): string {
  return invertAlgorithm(algorithm);
}
