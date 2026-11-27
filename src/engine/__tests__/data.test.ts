import oll from '../../data/oll.json';
import pll from '../../data/pll.json';
import f2l from '../../data/f2l.json';
import {
  applyMoves, createTrainerCube, parseAlgorithm, isF2LSolved, isCrossSolved, isOLLSolved,
  isSolved, generateScramble, normalizeOrientation, pieceKey, solveCross, setupFromAlgorithm, toFacelets, centerColor, Cubie, CubeState,
} from '../index';

interface CaseData { id: string; name: string; algs: string[] }


/** Mẫu hướng của 8 mảnh lớp trên: sticker mang màu mặt U đang nhìn về hướng nào. */
function ollKey(s: CubeState): string {
  const up = centerColor(s, 'U');
  const top = s.cubies.filter((c: Cubie) => c.position[1] === 1 && c.stickers.length > 1);
  return top
    .map((c) => `${c.position.join(',')}:${c.stickers.find((st) => st.color === up)!.normal.join(',')}`)
    .sort()
    .join('|');
}
/** Khoá lớp tương đương khi cho phép AUF (xoay U) sau khi tạo case. */
function minOverU(alg: string, keyFn: (s: CubeState) => string): string {
  const keys: string[] = [];
  for (let k = 0; k < 4; k++) keys.push(keyFn(setupFromAlgorithm(alg, { postU: k })));
  return keys.sort()[0];
}
function minOverUBoth(alg: string): string {
  const keys: string[] = [];
  for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++)
    keys.push(toFacelets(setupFromAlgorithm(alg, { preU: j, postU: k })));
  return keys.sort()[0];
}

describe('OLL (57 case)', () => {
  const cases = oll as CaseData[];
  it('có 57 case', () => expect(cases).toHaveLength(57));
  it.each(cases.map((c) => [c.name, c] as const))('%s: giữ F2L, đưa mặt U về một màu', (_n, c) => {
    for (const alg of c.algs) {
      const s = setupFromAlgorithm(alg);
      expect(isCrossSolved(s) && isF2LSolved(s)).toBe(true); // case giữ nguyên F2L
      expect(isOLLSolved(s)).toBe(false);
      // áp alg lên chính case => mặt U đồng màu và F2L còn nguyên
      const solved = normalizeOrientation(applyMoves(s, parseAlgorithm(alg)));
      expect(isOLLSolved(solved)).toBe(true);
      expect(isF2LSolved(solved)).toBe(true);
    }
  });
  it('57 case đều khác nhau (đủ bộ, tính cả AUF)', () => {
    const keys = new Set(cases.map((c) => minOverU(c.algs[0], ollKey)));
    expect(keys.size).toBe(57);
  });
});

describe('PLL (21 case)', () => {
  const cases = pll as CaseData[];
  it('có 21 case', () => expect(cases).toHaveLength(21));
  it.each(cases.map((c) => [c.name, c] as const))('%s: giữ F2L + OLL, giải được case', (_n, c) => {
    for (const alg of c.algs) {
      const s = setupFromAlgorithm(alg);
      expect(isF2LSolved(s) && isOLLSolved(s)).toBe(true);
      expect(isSolved(s)).toBe(false);
      expect(isSolved(normalizeOrientation(applyMoves(s, parseAlgorithm(alg))))).toBe(true);
    }
  });
  it('21 case đều khác nhau (tính cả AUF trước/sau)', () => {
    const keys = new Set(cases.map((c) => minOverUBoth(c.algs[0])));
    expect(keys.size).toBe(21);
  });
});


describe('F2L (41 case)', () => {
  const cases = f2l as CaseData[];
  const solved = createTrainerCube();
  const pairIdx = [
    solved.cubies.findIndex((c) => c.position.join() === '1,-1,1'),
    solved.cubies.findIndex((c) => c.position.join() === '1,0,1'),
  ];
  const others = solved.cubies
    .map((c, i) => i)
    .filter((i) => solved.cubies[i].stickers.length >= 2 && solved.cubies[i].position[1] <= 0 && !pairIdx.includes(i));

  it('có 41 case', () => expect(cases).toHaveLength(41));
  it.each(cases.map((c) => [c.name, c] as const))('%s: giữ cross + 3 rãnh khác, ghép được cặp FR', (_n, c) => {
    for (const alg of c.algs) {
      const s = setupFromAlgorithm(alg);
      expect(isCrossSolved(s)).toBe(true);
      for (const i of others) expect(pieceKey(s.cubies[i])).toBe(pieceKey(solved.cubies[i]));
      expect(pairIdx.every((i) => pieceKey(s.cubies[i]) === pieceKey(solved.cubies[i]))).toBe(false);
      const after = normalizeOrientation(applyMoves(s, parseAlgorithm(alg)));
      expect(isCrossSolved(after) && isF2LSolved(after)).toBe(true);
    }
  });
  it('41 case đều khác nhau (tính cả AUF)', () => {
    const keys = new Set(
      cases.map((c) => {
        const ks: string[] = [];
        for (let k = 0; k < 4; k++) {
          const s = setupFromAlgorithm(c.algs[0], { postU: k });
          ks.push(pairIdx.map((i) => pieceKey(s.cubies[i])).join('#'));
        }
        return ks.sort()[0];
      }),
    );
    expect(keys.size).toBe(41);
  });
});

describe('solveCross', () => {
  it('đã xong => chuỗi rỗng', () => expect(solveCross(createTrainerCube())).toBe(''));
  it('giải tối ưu, <= 8 nước, ra cross đúng', () => {
    for (let t = 0; t < 40; t++) {
      const s = normalizeOrientation(applyMoves(createTrainerCube(), parseAlgorithm(generateScramble(25))));
      const sol = solveCross(s);
      expect(sol.split(' ').filter(Boolean).length).toBeLessThanOrEqual(8);
      expect(isCrossSolved(applyMoves(s, parseAlgorithm(sol)))).toBe(true);
    }
  });
  it('1 nước => lời giải 1 nước', () => {
    expect(solveCross(applyMoves(createTrainerCube(), parseAlgorithm('R')))).toBe("R'");
  });
  it('vẫn đúng khi người dùng xoay cả khối', () => {
    const s = applyMoves(createTrainerCube(), parseAlgorithm('R U F x y'));
    const sol = solveCross(s);
    expect(isCrossSolved(normalizeOrientation(applyMoves(s, parseAlgorithm(sol))))).toBe(true);
    expect(sol).toMatch(/^[xyz]/); // bắt đầu bằng nước đưa khối về hướng chuẩn
  });
});
