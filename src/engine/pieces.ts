import { moveCubie } from './cube';
import { Cubie, Move } from './types';

/**
 * Đồ thị trạng thái của MỘT mảnh (cạnh hoặc góc): mỗi nút là một (vị trí, hướng),
 * cạnh là các nước xoay. Một cạnh có 24 trạng thái, một góc cũng 24.
 * Vì mỗi mảnh di chuyển độc lập nhau, trạng thái của nhiều mảnh chỉ là bộ các id.
 */
export interface PieceGraph {
  size: number;
  /** next[m][id] = id mới sau khi áp moves[m] */
  next: Int16Array[];
  homeId: number;
  idOf: (c: Cubie) => number;
  /** Cubie tương ứng với từng id (để biết vị trí/hướng của mỗi trạng thái) */
  states: Cubie[];
}

export const pieceKey = (c: Cubie) =>
  c.position.join(',') + '|' + c.stickers.map((s) => s.normal.join(',')).join(';');

export function buildPieceGraph(home: Cubie, moves: Move[]): PieceGraph {
  const ids = new Map<string, number>();
  const cubies: Cubie[] = [];
  const add = (c: Cubie) => {
    const k = pieceKey(c);
    if (!ids.has(k)) {
      ids.set(k, cubies.length);
      cubies.push(c);
    }
    return ids.get(k)!;
  };
  add(home);
  for (let i = 0; i < cubies.length; i++) for (const m of moves) add(moveCubie(cubies[i], m));

  const next = moves.map((m) => {
    const arr = new Int16Array(cubies.length);
    cubies.forEach((c, i) => (arr[i] = ids.get(pieceKey(moveCubie(c, m)))!));
    return arr;
  });
  return { size: cubies.length, next, homeId: 0, idOf: (c) => ids.get(pieceKey(c)) ?? -1, states: cubies };
}
