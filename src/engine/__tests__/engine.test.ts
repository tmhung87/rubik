import {
  applyMoves, createSolvedCube, isSolved, toFacelets,
  parseAlgorithm, parseMove, invertAlgorithm,
  generateScramble, scrambleForAlgorithm,
  isCrossSolved, isF2LSolved, isOLLSolved,
} from '../index';

const run = (alg: string, s = createSolvedCube()) => applyMoves(s, parseAlgorithm(alg));

describe('khối ban đầu', () => {
  it('có 26 cubie, 54 sticker và đã giải', () => {
    const c = createSolvedCube();
    expect(c.cubies).toHaveLength(26);
    expect(c.cubies.reduce((n, x) => n + x.stickers.length, 0)).toBe(54);
    expect(isSolved(c)).toBe(true);
  });
  it('facelets chuẩn', () => {
    expect(toFacelets(createSolvedCube())).toBe(
      'W'.repeat(9) + 'R'.repeat(9) + 'G'.repeat(9) + 'Y'.repeat(9) + 'O'.repeat(9) + 'B'.repeat(9),
    );
  });
});

describe('parse ký hiệu', () => {
  it('parse các dạng', () => {
    expect(parseAlgorithm("R U R' U2 Rw M' x").map((m) => m.notation)).toEqual(
      ['R', 'U', "R'", 'U2', 'r', "M'", 'x'],
    );
    expect(parseMove("R2'").notation).toBe('R2');
  });
  it('ném lỗi khi sai', () => {
    expect(() => parseMove('Q')).toThrow();
  });
  it('nghịch đảo', () => {
    expect(invertAlgorithm("R U R' U'")).toBe("U R U' R'");
    expect(invertAlgorithm('R2 U2')).toBe('U2 R2');
  });
});

describe('xoay', () => {
  it.each(['U', 'D', 'L', 'R', 'F', 'B', 'M', 'E', 'S', 'x', 'y', 'z', 'r', 'u'])(
    '%s lặp 4 lần = đã giải, X rồi X\' = đã giải',
    (m) => {
      expect(isSolved(run(`${m} ${m} ${m} ${m}`))).toBe(true);
      expect(run(`${m} ${m}'`)).toEqual(createSolvedCube());
      expect(toFacelets(run(`${m}2`))).toBe(toFacelets(run(`${m} ${m}`)));
    },
  );
  it('R làm đổi mặt F: cột phải của F lấy từ D', () => {
    // R chiều kim đồng hồ: cột phải mặt D đi lên mặt F
    const f = toFacelets(run('R'));
    const F = f.slice(18, 27);
    expect([F[2], F[5], F[8]]).toEqual(['Y', 'Y', 'Y']);
  });
  it('U: hàng trên mặt F nhận màu từ mặt R', () => {
    const f = toFacelets(run('U'));
    // sau U (cùng chiều kim đồng hồ) hàng trên F lấy màu của R
    expect(f.slice(18, 21)).toBe('RRR');
  });
  it('sexy move x6 = đã giải', () => {
    expect(isSolved(run("R U R' U' ".repeat(6)))).toBe(true);
  });
  it('x y z không làm khối hết giải', () => {
    expect(isSolved(run("x y z x' y' z' x2"))).toBe(true);
  });
  it('R U R\' U\' khác solved', () => {
    expect(isSolved(run("R U R' U'"))).toBe(false);
  });
  it('M = R\' L x\' (cùng kết quả)', () => {
    expect(toFacelets(run('M'))).toBe(toFacelets(run("R L' x'")));
  });
  it('Rw = R M\'', () => {
    expect(toFacelets(run('Rw'))).toBe(toFacelets(run("R M'")));
  });
});

describe('scramble', () => {
  it('đúng độ dài và không lặp mặt liền nhau', () => {
    const s = generateScramble(25).split(' ');
    expect(s).toHaveLength(25);
    for (let i = 1; i < s.length; i++) expect(s[i][0]).not.toBe(s[i - 1][0]);
  });
  it('scramble rồi nghịch đảo = đã giải', () => {
    const s = generateScramble(30);
    expect(isSolved(run(`${s} ${invertAlgorithm(s)}`))).toBe(true);
  });
  it('scrambleForAlgorithm: áp thuật toán lên case => về solved', () => {
    const alg = "R U R' U R U2 R'"; // Sune
    const caseState = run(scrambleForAlgorithm(alg));
    expect(isSolved(caseState)).toBe(false);
    expect(isSolved(run(alg, caseState))).toBe(true);
  });
});

describe('kiểm tra giai đoạn CFOP', () => {
  it('khối giải: cross, f2l, oll đều true', () => {
    const c = createSolvedCube();
    expect(isCrossSolved(c)).toBe(true);
    expect(isF2LSolved(c)).toBe(true);
    expect(isOLLSolved(c)).toBe(true);
  });
  it('xoay lớp trên chỉ ảnh hưởng PLL, không phá F2L/cross', () => {
    const c = run('U');
    expect(isCrossSolved(c)).toBe(true);
    expect(isF2LSolved(c)).toBe(true);
    expect(isOLLSolved(c)).toBe(true);
    expect(isSolved(c)).toBe(false);
  });
  it('Sune làm hỏng OLL nhưng giữ F2L', () => {
    const c = run(scrambleForAlgorithm("R U R' U R U2 R'"));
    expect(isF2LSolved(c)).toBe(true);
    expect(isOLLSolved(c)).toBe(false);
  });
  it('R phá cross đáy', () => {
    expect(isCrossSolved(run('R'))).toBe(false);
  });
  it('xoay cả khối x2 vẫn nhận cross ở mặt D hiện tại', () => {
    expect(isCrossSolved(run('x2'))).toBe(true);
  });
});
