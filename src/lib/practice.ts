import {
  applyMoves, createTrainerCube, CubeState, generateScramble, invertAlgorithm, normalizeOrientation,
  parseAlgorithm, setupFromAlgorithm, solveCross, Stage,
} from '@/engine';
import { getCases, mergeAdjacent } from './cases';
import type { CaseStat } from '@/store/usePracticeStore';

export interface PracticeItem {
  /** id case ("oll-27") hoặc "random" với cross */
  id: string;
  name: string;
  group?: string;
  /** Trạng thái đề bài (đã gồm AUF ngẫu nhiên) */
  setup: CubeState;
  /** Lời giải ĐẦY ĐỦ áp được ngay lên `setup` (đã gồm AUF), mỗi biến thể một chuỗi */
  algs: string[];
}

const uSeq = (k: number) => ['', 'U', 'U2', "U'"][k];

/** Chọn case kế tiếp: ưu tiên case chưa thử hoặc hay sai, tránh lặp lại case vừa rồi. */
export function makeItem(
  stage: Stage,
  stats: Record<string, CaseStat>,
  lastId?: string,
  rng: () => number = Math.random,
): PracticeItem {
  if (stage === 'cross') {
    let setup: CubeState;
    let sol: string;
    do {
      const scramble = generateScramble(20, rng);
      setup = normalizeOrientation(applyMoves(createTrainerCube(), parseAlgorithm(scramble)));
      sol = solveCross(setup);
    } while (sol === ''); // bỏ qua scramble mà cross đã xong sẵn
    return { id: 'random', name: 'Cross ngẫu nhiên', setup, algs: [sol] };
  }

  const cases = getCases(stage);
  const weights = cases.map((c) => {
    if (cases.length > 1 && c.id === lastId) return 0;
    const s = stats[`${stage}:${c.id}`];
    if (!s || s.attempts === 0) return 3;
    return 1 + 4 * (1 - s.successes / s.attempts);
  });
  let r = rng() * weights.reduce((a, b) => a + b, 0);
  let idx = 0;
  while (idx < weights.length - 1 && (r -= weights[idx]) >= 0) idx++;
  const c = cases[idx];

  // Case = U^pre, nghịch đảo thuật toán, U^post (từ khối đã giải).
  // Lời giải = U^-post, thuật toán, U^-pre.
  const pre = stage === 'pll' ? Math.floor(rng() * 4) : 0;
  const post = Math.floor(rng() * 4);
  const setup = setupFromAlgorithm(c.algs[0], { preU: pre, postU: post });
  const algs = c.algs.map((a) =>
    mergeAdjacent([invertAlgorithm(uSeq(post)), a, invertAlgorithm(uSeq(pre))].filter(Boolean).join(' ')),
  );
  return { id: c.id, name: c.name, group: c.group, setup, algs };
}
