/**
 * Sinh 41 thuật toán F2L (rãnh trước-phải, cross trắng ở đáy) bằng IDA*.
 * Chạy: npx tsx scripts/gen-f2l.ts   -> ghi src/data/f2l.json
 *
 * Ý tưởng: chỉ cần theo dõi 12 mảnh (4 cạnh cross, 4 góc đáy, 4 cạnh tầng giữa).
 * Mỗi "case" = vị trí/hướng của cặp (góc DFR + cạnh FR); 10 mảnh còn lại đã giải.
 * 150 - 1 tổ hợp, gom theo xoay U => đúng 41 lớp. Với mỗi lớp tìm thuật toán NGẮN NHẤT
 * (ưu tiên chỉ dùng R, U; dùng thêm F nếu ngắn hơn).
 */
import { writeFileSync } from 'node:fs';
import { buildPieceGraph, createTrainerCube, parseMove, setupFromAlgorithm } from '../src/engine';

const NAMES = ['U', "U'", 'U2', 'R', "R'", 'R2', 'F', "F'", 'F2'];
const MOVES = NAMES.map(parseMove);
const FACE = [0, 0, 0, 1, 1, 1, 2, 2, 2];
const solved = createTrainerCube();

const homeIdx = solved.cubies
  .map((c, i) => ({ c, i }))
  .filter(({ c }) => c.stickers.length >= 2 && c.position[1] <= 0)
  .map(({ i }) => i); // 12 mảnh
const cornerHome = solved.cubies.findIndex((c) => c.position.join() === '1,-1,1');
const edgeHome = solved.cubies.findIndex((c) => c.position.join() === '1,0,1');
const pc = homeIdx.indexOf(cornerHome);
const pe = homeIdx.indexOf(edgeHome);

const graphs = homeIdx.map((i) => buildPieceGraph(solved.cubies[i], MOVES));
const dist = graphs.map((g) => {
  const d = new Int8Array(g.size).fill(-1);
  d[g.homeId] = 0;
  const q = [g.homeId];
  for (let h = 0; h < q.length; h++)
    for (const nx of g.next) {
      const t = nx[q[h]];
      if (d[t] < 0) { d[t] = d[q[h]] + 1; q.push(t); }
    }
  return d;
});

function search(start: number[], allowed: number[], maxDepth: number): number[] | null {
  const n = start.length;
  const states = Array.from({ length: maxDepth + 1 }, () => new Int16Array(n));
  states[0].set(start);
  const path: number[] = [];
  const h = (s: Int16Array) => { let m = 0; for (let i = 0; i < n; i++) m = Math.max(m, dist[i][s[i]]); return m; };
  const dfs = (depth: number, limit: number, lastFace: number): boolean => {
    const s = states[depth];
    const hv = h(s);
    if (hv === 0) return true;
    if (depth + hv > limit) return false;
    for (const m of allowed) {
      if (FACE[m] === lastFace) continue;
      const t = states[depth + 1];
      for (let i = 0; i < n; i++) t[i] = graphs[i].next[m][s[i]];
      path[depth] = m;
      if (dfs(depth + 1, limit, FACE[m])) return true;
    }
    return false;
  };
  for (let limit = 0; limit <= maxDepth; limit++) {
    if (dfs(0, limit, -1)) {
      let len = 0;
      while (len < limit && !(h(states[len]) === 0)) len++;
      return path.slice(0, len);
    }
  }
  return null;
}

const gC = graphs[pc], gE = graphs[pe];
const U = 0; // chỉ số nước U trong MOVES
const inSlotC = (id: number) => gC.states[id].position.join() === '1,-1,1';
const inSlotE = (id: number) => gE.states[id].position.join() === '1,0,1';
const inTopC = (id: number) => gC.states[id].position[1] === 1;
const inTopE = (id: number) => gE.states[id].position[1] === 1;

// Liệt kê các tổ hợp (góc, cạnh) và gom lớp theo xoay U
type Pair = [number, number];
const classes = new Map<string, Pair[]>();
for (let c = 0; c < gC.size; c++) for (let e = 0; e < gE.size; e++) {
  if (!(inSlotC(c) || inTopC(c)) || !(inSlotE(e) || inTopE(e))) continue;
  if (c === gC.homeId && e === gE.homeId) continue;
  const members: Pair[] = [];
  let cc = c, ee = e;
  for (let k = 0; k < 4; k++) { members.push([cc, ee]); cc = gC.next[U][cc]; ee = gE.next[U][ee]; } // U
  const key = members.map(([a, b]) => `${a}/${b}`).sort()[0];
  if (!classes.has(key)) classes.set(key, [...new Map(members.map((m) => [m.join(), m])).values()]);
}
console.log('số lớp:', classes.size);

const RU = [0, 1, 2, 3, 4, 5];
const RUF = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const startOf = ([c, e]: Pair) => graphs.map((g, i) => (i === pc ? c : i === pe ? e : g.homeId));

const results: { group: number; alg: string }[] = [];
for (const [, members] of classes) {
  let best: number[] | null = null;
  for (let depth = 3; depth <= 11 && !best; depth++) {
    for (const allowed of [RU, RUF]) {
      for (const m of members) {
        const r = search(startOf(m), allowed, depth);
        if (r && r.length <= depth) { best = r; break; }
      }
      if (best) break;
    }
  }
  if (!best) throw new Error('không tìm được thuật toán cho một lớp');
  const alg = best.map((i) => NAMES[i]).join(' ');
  const [c, e] = members[0];
  const group = inSlotC(c) && inSlotE(e) ? 3 : inSlotC(c) ? 1 : inSlotE(e) ? 2 : 0;
  results.push({ group, alg });
  process.stdout.write(`${alg}\n`);
}

const GROUPS = ['Góc & cạnh đều ở tầng trên', 'Góc trong rãnh, cạnh ở tầng trên', 'Cạnh trong rãnh, góc ở tầng trên', 'Cả hai trong rãnh'];
results.sort((a, b) => a.group - b.group || a.alg.split(' ').length - b.alg.split(' ').length || a.alg.localeCompare(b.alg));
const out = results.map((r, i) => ({ id: `f2l-${i + 1}`, name: `F2L ${i + 1}`, group: GROUPS[r.group], algs: [r.alg] }));
writeFileSync('src/data/f2l.json', JSON.stringify(out, null, 1));
console.log('đã ghi', out.length, 'case');
// kiểm tra nhanh trạng thái dựng được
setupFromAlgorithm(out[0].algs[0]);
