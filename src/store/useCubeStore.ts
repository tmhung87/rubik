import { create } from 'zustand';
import { applyMove, createTrainerCube, CubeState, Move, parseAlgorithm } from '../engine';

interface CubeStore {
  /** Trạng thái logic của khối (nguồn sự thật). */
  state: CubeState;
  /** Nước đang được animation. */
  current: Move | null;
  /** Hàng đợi các nước chờ chạy. */
  queue: Move[];
  /** Ký hiệu các nước đã áp xong kể từ lần setCube/reset gần nhất. */
  history: string[];
  /** Thời gian (ms) cho 1 lần xoay 90°. */
  speedMs: number;

  /** Thêm thuật toán ("R U R' U'") hoặc danh sách nước vào hàng đợi. */
  enqueue: (input: string | Move[]) => void;
  /** Gọi khi animation `current` xong: áp nước vào state, lấy nước kế tiếp. */
  commit: () => void;
  /** Xoá hàng đợi nhưng để nước đang chạy hoàn tất (dùng cho nút tạm dừng). */
  clearQueue: () => void;
  /** Đặt thẳng một trạng thái (không animation), xoá hàng đợi. */
  setCube: (state: CubeState) => void;
  reset: () => void;
  setSpeed: (ms: number) => void;
}

export const useCubeStore = create<CubeStore>((set, get) => ({
  state: createTrainerCube(),
  current: null,
  queue: [],
  speedMs: 300,
  history: [],

  enqueue: (input) => {
    const moves = typeof input === 'string' ? parseAlgorithm(input) : input;
    if (moves.length === 0) return;
    const { current, queue } = get();
    if (current) {
      set({ queue: [...queue, ...moves] });
    } else {
      const [first, ...rest] = moves;
      set({ current: first, queue: [...queue, ...rest] });
    }
  },

  commit: () => {
    const { current, queue, state } = get();
    if (!current) return;
    const [next, ...rest] = queue;
    set({
      state: applyMove(state, current),
      current: next ?? null,
      queue: rest,
      history: [...get().history, current.notation],
    });
  },

  clearQueue: () => set({ queue: [] }),
  setCube: (state) => set({ state, current: null, queue: [], history: [] }),
  reset: () => set({ state: createTrainerCube(), current: null, queue: [], history: [] }),
  setSpeed: (ms) => set({ speedMs: ms }),
}));
