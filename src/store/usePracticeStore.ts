import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface CaseStat {
  attempts: number;
  successes: number;
  bestMs?: number;
  lastMs?: number;
}

interface PracticeStore {
  /** Khoá: "oll:oll-27", "cross:random"... */
  stats: Record<string, CaseStat>;
  record: (stage: string, id: string, ok: boolean, ms?: number) => void;
  resetAll: () => void;
}

/** Lưu tiến độ luyện tập ngay trên máy (localStorage) => dùng offline. */
export const usePracticeStore = create<PracticeStore>()(
  persist(
    (set, get) => ({
      stats: {},
      record: (stage, id, ok, ms) => {
        const key = `${stage}:${id}`;
        const prev = get().stats[key] ?? { attempts: 0, successes: 0 };
        const next: CaseStat = { ...prev, attempts: prev.attempts + 1 };
        if (ok) {
          next.successes = prev.successes + 1;
          if (ms !== undefined) {
            next.lastMs = ms;
            next.bestMs = prev.bestMs === undefined ? ms : Math.min(prev.bestMs, ms);
          }
        }
        set({ stats: { ...get().stats, [key]: next } });
      },
      resetAll: () => set({ stats: {} }),
    }),
    {
      name: 'rubik-cfop-stats',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // nạp thủ công trong App để tránh lệch SSR
    },
  ),
);

export type Mastery = 'new' | 'learning' | 'good';

export function masteryOf(s?: CaseStat): Mastery {
  if (!s || s.attempts === 0) return 'new';
  return s.successes >= 3 && s.successes / s.attempts >= 0.75 ? 'good' : 'learning';
}
