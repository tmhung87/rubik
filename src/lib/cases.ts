import oll from '@/data/oll.json';
import pll from '@/data/pll.json';
import f2l from '@/data/f2l.json';
import stagesJson from '@/data/stages.json';
import { centerColor, CubeState, Stage, STAGES } from '@/engine';

export interface CaseData {
  id: string;
  name: string;
  group?: string;
  algs: string[];
}

export interface StageInfo {
  title: string;
  letter: string;
  goal: string;
  tips: string[];
}

export const STAGE_INFO = stagesJson as Record<Stage, StageInfo>;
export { STAGES };
export type { Stage };

const PLL_GROUPS: Record<string, string> = {
  Corners: 'Chỉ hoán vị góc',
  Edges: 'Chỉ hoán vị cạnh',
  Adjacent: 'Đổi 2 góc kề nhau',
  Diagonal: 'Đổi 2 góc chéo nhau',
  G: 'Nhóm G',
};

const ALL: Record<Exclude<Stage, 'cross'>, CaseData[]> = {
  f2l: f2l as CaseData[],
  oll: oll as CaseData[],
  pll: (pll as CaseData[]).map((c) => ({ ...c, group: PLL_GROUPS[c.group ?? ''] ?? c.group })),
};

export const getCases = (stage: Stage): CaseData[] => (stage === 'cross' ? [] : ALL[stage]);
export const getCase = (stage: Stage, id: string) => getCases(stage).find((c) => c.id === id);
export const isStage = (s: string | undefined): s is Stage => !!s && (STAGES as string[]).includes(s);

/** Hình dạng các cạnh lớp trên của một case OLL (suy ra từ trạng thái, không gõ tay). */
export function ollShape(s: CubeState): string {
  const up = centerColor(s, 'U');
  const oriented = s.cubies.filter(
    (c) =>
      c.position[1] === 1 &&
      c.stickers.length === 2 &&
      c.stickers.some((st) => st.normal[1] === 1 && st.color === up),
  );
  if (oriented.length === 0) return 'Chấm (0 cạnh đúng)';
  if (oriented.length === 4) return 'Chữ thập (4 cạnh đúng)';
  const [a, b] = oriented.map((c) => c.position);
  const opposite = a[0] + b[0] === 0 && a[2] + b[2] === 0;
  return opposite ? 'Đường thẳng (2 cạnh đối)' : 'Chữ L (2 cạnh kề)';
}

/** Gộp các nước liền nhau cùng ký hiệu: "U U" -> "U2", "U U'" -> bỏ. */
export function mergeAdjacent(alg: string): string {
  const out: { base: string; q: number }[] = [];
  for (const tok of alg.split(/\s+/).filter(Boolean)) {
    const m = /^(.*?)(2|')?$/.exec(tok)!;
    const base = m[1];
    const q = m[2] === '2' ? 2 : m[2] === "'" ? 3 : 1;
    const last = out[out.length - 1];
    if (last && last.base === base) last.q = (last.q + q) % 4;
    else out.push({ base, q });
    if (out.length && out[out.length - 1].q === 0) out.pop();
  }
  return out.map(({ base, q }) => base + ['', '', '2', "'"][q]).join(' ');
}
