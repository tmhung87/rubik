import {
  Axis,
  Color,
  CubeState,
  Cubie,
  DEFAULT_COLORS,
  Face,
  FACE_NORMAL,
  Move,
  Vec3,
} from './types';

const FACES = Object.keys(FACE_NORMAL) as Face[];

/** Xoay vector +90° quanh trục (quy tắc bàn tay phải). */
export function rotateQuarter(v: Vec3, axis: Axis): Vec3 {
  const [x, y, z] = v;
  switch (axis) {
    case 'x':
      return [x, -z, y];
    case 'y':
      return [z, y, -x];
    case 'z':
      return [-y, x, z];
  }
}

/** Xoay vector `turns` lần 90° (turns có thể âm). */
export function rotateVec(v: Vec3, axis: Axis, turns: number): Vec3 {
  const n = ((turns % 4) + 4) % 4;
  let out = v;
  for (let i = 0; i < n; i++) out = rotateQuarter(out, axis);
  return out;
}

const sameVec = (a: Vec3, b: Vec3) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

/** Khối đã giải, màu chuẩn. */
export function createSolvedCube(colors: Record<Face, Color> = DEFAULT_COLORS): CubeState {
  const cubies: Cubie[] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue;
        const position: Vec3 = [x, y, z];
        const stickers = FACES.filter((f) => {
          const n = FACE_NORMAL[f];
          // sticker thuộc mặt f nếu cubie nằm trên lớp ngoài của mặt đó
          return n[0] * x + n[1] * y + n[2] * z === 1;
        }).map((f) => ({ normal: [...FACE_NORMAL[f]] as Vec3, color: colors[f] }));
        cubies.push({ position, stickers });
      }
    }
  }
  return { cubies };
}

/** Áp một nước xoay lên một cubie (trả về cubie mới, hoặc chính nó nếu không bị ảnh hưởng). */
export function moveCubie(c: Cubie, move: Move): Cubie {
  if (!move.layers.includes(c.position[axisIndex(move.axis)])) return c;
  return {
    position: rotateVec(c.position, move.axis, move.turns),
    stickers: c.stickers.map((s) => ({
      normal: rotateVec(s.normal, move.axis, move.turns),
      color: s.color,
    })),
  };
}

/** Áp một nước xoay, trả về state mới (không sửa state cũ). */
export function applyMove(state: CubeState, move: Move): CubeState {
  return { cubies: state.cubies.map((c) => moveCubie(c, move)) };
}

export function applyMoves(state: CubeState, moves: Move[]): CubeState {
  return moves.reduce(applyMove, state);
}

export function axisIndex(axis: Axis): 0 | 1 | 2 {
  return axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
}

/** Màu của sticker nhìn ra hướng `face` tại một vị trí, hoặc undefined. */
export function stickerColorAt(state: CubeState, position: Vec3, normal: Vec3): Color | undefined {
  const cubie = state.cubies.find((c) => sameVec(c.position, position));
  return cubie?.stickers.find((s) => sameVec(s.normal, normal))?.color;
}

/** Màu tâm hiện tại của một mặt (tâm đổi chỗ khi xoay M/E/S/x/y/z). */
export function centerColor(state: CubeState, face: Face): Color {
  const n = FACE_NORMAL[face];
  return stickerColorAt(state, n, n)!;
}

/** Mỗi mặt chỉ có một màu => khối đã giải (không phụ thuộc hướng cầm khối). */
export function isSolved(state: CubeState): boolean {
  const colorOfFace = new Map<string, Color>();
  for (const c of state.cubies) {
    for (const s of c.stickers) {
      const key = s.normal.join(',');
      const prev = colorOfFace.get(key);
      if (prev && prev !== s.color) return false;
      colorOfFace.set(key, s.color);
    }
  }
  return true;
}

/** Chuỗi 54 ký tự (thứ tự U R F D L B, mỗi mặt 9 ô) – tiện debug. */
export function toFacelets(state: CubeState): string {
  const letter: Record<Color, string> = {
    white: 'W', yellow: 'Y', green: 'G', blue: 'B', red: 'R', orange: 'O',
  };
  const order: [Face, (r: number, c: number) => Vec3][] = [
    ['U', (r, c) => [c - 1, 1, r - 1]],
    ['R', (r, c) => [1, 1 - r, 1 - c]],
    ['F', (r, c) => [c - 1, 1 - r, 1]],
    ['D', (r, c) => [c - 1, -1, 1 - r]],
    ['L', (r, c) => [-1, 1 - r, c - 1]],
    ['B', (r, c) => [1 - c, 1 - r, -1]],
  ];
  let out = '';
  for (const [face, pos] of order) {
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        out += letter[stickerColorAt(state, pos(r, c), FACE_NORMAL[face])!];
  }
  return out;
}
