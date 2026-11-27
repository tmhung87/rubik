import { centerColor, isSolved } from './cube';
import { CubeState, Cubie, Face, FACE_NORMAL, Vec3 } from './types';

/** Cubie "đúng chỗ" = mọi sticker trùng màu tâm của mặt nó đang hướng tới. */
function cubieInPlace(state: CubeState, cubie: Cubie): boolean {
  return cubie.stickers.every((s) => {
    const face = (Object.keys(FACE_NORMAL) as Face[]).find((f) => {
      const n = FACE_NORMAL[f];
      return n[0] === s.normal[0] && n[1] === s.normal[1] && n[2] === s.normal[2];
    })!;
    return s.color === centerColor(state, face);
  });
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Cross trên mặt `face` (mặc định D) đã xong: 4 cạnh của mặt đó đúng chỗ. */
export function isCrossSolved(state: CubeState, face: Face = 'D'): boolean {
  const n = FACE_NORMAL[face];
  const edges = state.cubies.filter(
    (c) => dot(c.position, n) === 1 && c.stickers.length === 2,
  );
  return edges.length === 4 && edges.every((c) => cubieInPlace(state, c));
}

/** F2L xong: toàn bộ lớp `face` và lớp giữa đúng chỗ (chỉ còn lớp trên). */
export function isF2LSolved(state: CubeState, face: Face = 'D'): boolean {
  const n = FACE_NORMAL[face];
  return state.cubies
    .filter((c) => dot(c.position, n) >= 0) // lớp đáy + lớp giữa
    .every((c) => cubieInPlace(state, c));
}

/** OLL xong: mặt đối diện `face` (mặc định U) cùng một màu. */
export function isOLLSolved(state: CubeState, face: Face = 'U'): boolean {
  const n = FACE_NORMAL[face];
  const top = state.cubies.filter((c) => dot(c.position, n) === 1);
  return top.every((c) =>
    c.stickers.filter((s) => dot(s.normal, n) === 1).every((s) => s.color === centerColor(state, face)),
  );
}

/** PLL xong = cả khối đã giải. */
export const isPLLSolved = isSolved;
