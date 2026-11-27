import { isCrossSolved, isF2LSolved, isOLLSolved } from './cfop';
import { applyMoves, centerColor, createSolvedCube, isSolved } from './cube';
import { invertAlgorithm, parseAlgorithm } from './moves';
import { Color, CubeState, Face } from './types';

/**
 * Hướng cầm khối khi luyện CFOP: trắng ở DƯỚI (cross), vàng ở trên, xanh lá phía trước.
 * (Tức là khối chuẩn xoay x2 y2.)
 */
export const TRAINER_COLORS: Record<Face, Color> = {
  U: 'yellow',
  D: 'white',
  F: 'green',
  B: 'blue',
  R: 'orange',
  L: 'red',
};

export type Stage = 'cross' | 'f2l' | 'oll' | 'pll';
export const STAGES: Stage[] = ['cross', 'f2l', 'oll', 'pll'];

export const createTrainerCube = (): CubeState => createSolvedCube(TRAINER_COLORS);

const FACES: Face[] = ['U', 'D', 'L', 'R', 'F', 'B'];

const centersMatch = (s: CubeState) => FACES.every((f) => centerColor(s, f) === TRAINER_COLORS[f]);

/**
 * Chuỗi xoay cả khối (x/y/z) cần áp để màu tâm về đúng hướng chuẩn của trainer
 * ('' nếu đã đúng). Nhờ vậy các hàm kiểm tra không phụ thuộc việc người dùng
 * có xoay cả khối hay không.
 */
export function orientationFix(state: CubeState): string {
  if (centersMatch(state)) return '';
  const turn = (k: number, m: string) => ['', m, `${m}2`, `${m}'`][((k % 4) + 4) % 4];
  for (let a = 0; a < 4; a++)
    for (let b = 0; b < 4; b++)
      for (let c = 0; c < 4; c++) {
        const seq = [turn(a, 'y'), turn(b, 'x'), turn(c, 'z')].filter(Boolean).join(' ');
        if (centersMatch(applyMoves(state, parseAlgorithm(seq)))) return seq;
      }
  return ''; // tâm lệch kiểu không chuẩn hoá được (không xảy ra với khối hợp lệ)
}

export function normalizeOrientation(state: CubeState): CubeState {
  const fix = orientationFix(state);
  return fix ? applyMoves(state, parseAlgorithm(fix)) : state;
}

/** Đã hoàn thành giai đoạn `stage` chưa (cross dưới đáy, F2L, OLL mặt U, PLL = cả khối). */
export function isStageDone(stage: Stage, state: CubeState): boolean {
  const s = normalizeOrientation(state);
  switch (stage) {
    case 'cross':
      return isCrossSolved(s, 'D');
    case 'f2l':
      return isCrossSolved(s, 'D') && isF2LSolved(s, 'D');
    case 'oll':
      return isF2LSolved(s, 'D') && isOLLSolved(s, 'U');
    case 'pll':
      return isSolved(s);
  }
}

const uTurns = (k: number) => ['', 'U', 'U2', "U'"][((k % 4) + 4) % 4];

export interface SetupOptions {
  /** Số lần xoay U trước khi tạo case (đổi vị trí lớp trên của khối đã giải) */
  preU?: number;
  /** Số lần xoay U sau khi tạo case (AUF mà người giải phải tự tìm) */
  postU?: number;
}

/**
 * Dựng trạng thái của một case: từ khối đã giải, áp nghịch đảo của thuật toán
 * (kèm U ngẫu nhiên tuỳ chọn). Giải lại bằng đúng thuật toán đó (cộng AUF) là xong.
 */
export function setupFromAlgorithm(alg: string, opts: SetupOptions = {}): CubeState {
  const seq = [uTurns(opts.preU ?? 0), invertAlgorithm(alg), uTurns(opts.postU ?? 0)]
    .filter(Boolean)
    .join(' ');
  return normalizeOrientation(applyMoves(createTrainerCube(), parseAlgorithm(seq)));
}
