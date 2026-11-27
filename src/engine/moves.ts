import { Axis, Move } from './types';

/**
 * Quy đổi "chiều kim đồng hồ khi nhìn vào mặt đó" sang số lần xoay +90°
 * quanh trục theo quy tắc bàn tay phải (cw = -1 hoặc +1 tuỳ mặt).
 */
interface BaseDef {
  axis: Axis;
  layers: number[];
  cw: 1 | -1; // turns của nước "thuận" (không dấu)
}

const BASE: Record<string, BaseDef> = {
  U: { axis: 'y', layers: [1], cw: -1 },
  D: { axis: 'y', layers: [-1], cw: 1 },
  R: { axis: 'x', layers: [1], cw: -1 },
  L: { axis: 'x', layers: [-1], cw: 1 },
  F: { axis: 'z', layers: [1], cw: -1 },
  B: { axis: 'z', layers: [-1], cw: 1 },
  // Lớp giữa: M theo L, E theo D, S theo F
  M: { axis: 'x', layers: [0], cw: 1 },
  E: { axis: 'y', layers: [0], cw: 1 },
  S: { axis: 'z', layers: [0], cw: -1 },
  // Xoay cả khối: x theo R, y theo U, z theo F
  x: { axis: 'x', layers: [-1, 0, 1], cw: -1 },
  y: { axis: 'y', layers: [-1, 0, 1], cw: -1 },
  z: { axis: 'z', layers: [-1, 0, 1], cw: -1 },
  // Xoay 2 lớp (wide): r = R + M', u = U + E', ...
  r: { axis: 'x', layers: [0, 1], cw: -1 },
  l: { axis: 'x', layers: [-1, 0], cw: 1 },
  u: { axis: 'y', layers: [0, 1], cw: -1 },
  d: { axis: 'y', layers: [-1, 0], cw: 1 },
  f: { axis: 'z', layers: [0, 1], cw: -1 },
  b: { axis: 'z', layers: [-1, 0], cw: 1 },
};

// "Rw" tương đương "r"
const TOKEN = /^([URFDLB]w|[URFDLBMESxyzurfdlb])(2'?|')?$/;

/** Parse một nước: "R", "U'", "F2", "Rw", "r'", "M2"... */
export function parseMove(token: string): Move {
  const m = TOKEN.exec(token.trim());
  if (!m) throw new Error(`Nước xoay không hợp lệ: "${token}"`);
  let name = m[1];
  if (name.endsWith('w')) name = name[0].toLowerCase();
  const suffix = m[2] ?? '';
  const def = BASE[name];

  let turns: 1 | -1 | 2;
  if (suffix.startsWith('2')) turns = 2;
  else if (suffix === "'") turns = (def.cw === 1 ? -1 : 1);
  else turns = def.cw;

  return {
    notation: `${name}${suffix.startsWith('2') ? '2' : suffix}`,
    axis: def.axis,
    layers: def.layers,
    turns,
  };
}

/** Parse cả thuật toán: "R U R' U'" -> Move[] (bỏ qua khoảng trắng thừa). */
export function parseAlgorithm(alg: string): Move[] {
  return alg
    .replace(/[()]/g, ' ') // cho phép ký hiệu nhóm "(R U R' U')"
    .split(/\s+/)
    .filter(Boolean)
    .map(parseMove);
}

/** Nghịch đảo một nước: R -> R', R' -> R, R2 -> R2. */
export function invertMove(move: Move): Move {
  const n = move.notation;
  let inv: string;
  if (n.endsWith('2')) inv = n;
  else if (n.endsWith("'")) inv = n.slice(0, -1);
  else inv = `${n}'`;
  return parseMove(inv);
}

/** Nghịch đảo cả thuật toán: đảo thứ tự và đảo từng nước. */
export function invertAlgorithm(alg: string): string {
  return parseAlgorithm(alg)
    .reverse()
    .map((m) => invertMove(m).notation)
    .join(' ');
}

export function formatAlgorithm(moves: Move[]): string {
  return moves.map((m) => m.notation).join(' ');
}
