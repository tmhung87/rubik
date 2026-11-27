import { applyMoves, isStageDone, parseAlgorithm, STAGES } from '@/engine';
import { makeItem } from '../practice';
import { mergeAdjacent } from '../cases';

describe('makeItem', () => {
  it.each(STAGES)('%s: lời giải (kèm AUF) giải được đề, đề chưa xong sẵn', (stage) => {
    for (let i = 0; i < 40; i++) {
      const item = makeItem(stage, {});
      expect(isStageDone(stage, item.setup)).toBe(false);
      for (const alg of item.algs) {
        expect(isStageDone(stage, applyMoves(item.setup, parseAlgorithm(alg)))).toBe(true);
      }
    }
  });
  it('không lặp lại case vừa rồi', () => {
    for (let i = 0; i < 30; i++) expect(makeItem('pll', {}, 'pll-h').id).not.toBe('pll-h');
  });
  it('ưu tiên case hay sai', () => {
    const { getCases } = require('../cases');
    const stats: Record<string, { attempts: number; successes: number }> = {};
    for (const c of getCases('pll')) stats[`pll:${c.id}`] = { attempts: 5, successes: c.id === 'pll-h' ? 0 : 5 };
    let h = 0;
    for (let i = 0; i < 400; i++) if (makeItem('pll', stats).id === 'pll-h') h++;
    expect(h).toBeGreaterThan(40); // kỳ vọng ~20% (đều thì chỉ ~5%)
  });
});

describe('mergeAdjacent', () => {
  it('gộp nước liền nhau', () => {
    expect(mergeAdjacent("U U R")).toBe('U2 R');
    expect(mergeAdjacent("U U' R")).toBe('R');
    expect(mergeAdjacent("U2 U2 R U'")).toBe("R U'");
    expect(mergeAdjacent("U' U' R")).toBe('U2 R');
    expect(mergeAdjacent("R U R'")).toBe("R U R'");
  });
});
