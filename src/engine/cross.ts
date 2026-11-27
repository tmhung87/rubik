import { createTrainerCube, normalizeOrientation, orientationFix } from './trainer';
import { buildPieceGraph, PieceGraph } from './pieces';
import { Move, CubeState } from './types';
import { parseMove } from './moves';

const ALL_MOVES: Move[] = ['U', 'D', 'L', 'R', 'F', 'B'].flatMap((f) =>
  [f, `${f}'`, `${f}2`].map(parseMove),
);

interface CrossTable {
  homeIdx: number[]; // chỉ số cubie của 4 cạnh cross trong state.cubies
  graphs: PieceGraph[];
  dist: Uint8Array;
}

let table: CrossTable | null = null;

/** Duyệt BFS từ trạng thái giải: ~330k trạng thái, tính 1 lần (vài trăm ms). */
function getTable(): CrossTable {
  if (table) return table;
  const solved = createTrainerCube();
  const homeIdx = solved.cubies
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.position[1] === -1 && c.stickers.length === 2) // cạnh tầng đáy (mặt D)
    .map(({ i }) => i);
  const graphs = homeIdx.map((i) => buildPieceGraph(solved.cubies[i], ALL_MOVES));
  const N = graphs[0].size; // 24
  const enc = (a: number[]) => ((a[0] * N + a[1]) * N + a[2]) * N + a[3];

  const dist = new Uint8Array(N ** 4).fill(255);
  const start = graphs.map((g) => g.homeId);
  dist[enc(start)] = 0;
  let frontier: number[][] = [start];
  while (frontier.length) {
    const nextFrontier: number[][] = [];
    for (const s of frontier) {
      const d = dist[enc(s)];
      for (let m = 0; m < ALL_MOVES.length; m++) {
        const t = s.map((id, k) => graphs[k].next[m][id]);
        const e = enc(t);
        if (dist[e] === 255) {
          dist[e] = d + 1;
          nextFrontier.push(t);
        }
      }
    }
    frontier = nextFrontier;
  }
  table = { homeIdx, graphs, dist };
  return table;
}

/**
 * Lời giải cross (mặt D, trắng) NGẮN NHẤT bằng các nước mặt (tối đa 8 nước).
 * Trả về chuỗi thuật toán áp được ngay lên `state`; '' nếu cross đã xong.
 * Nếu người dùng đã xoay cả khối, chuỗi bắt đầu bằng các nước x/y/z đưa khối về hướng chuẩn.
 */
export function solveCross(state: CubeState): string {
  const { homeIdx, graphs, dist } = getTable();
  const s = normalizeOrientation(state);
  const N = graphs[0].size;
  let ids = homeIdx.map((ci, k) => graphs[k].idOf(s.cubies[ci]));
  const enc = (a: number[]) => ((a[0] * N + a[1]) * N + a[2]) * N + a[3];

  const out: string[] = [];
  while (dist[enc(ids)] > 0) {
    const d = dist[enc(ids)];
    let found = false;
    for (let m = 0; m < ALL_MOVES.length; m++) {
      const t = ids.map((id, k) => graphs[k].next[m][id]);
      if (dist[enc(t)] === d - 1) {
        out.push(ALL_MOVES[m].notation);
        ids = t;
        found = true;
        break;
      }
    }
    if (!found) throw new Error('solveCross: bảng khoảng cách không nhất quán');
  }
  return [orientationFix(state), ...out].filter(Boolean).join(' ');
}
