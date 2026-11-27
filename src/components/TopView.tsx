'use client';

import { centerColor, CubeState } from '@/engine';
import { STICKER_HEX } from './cube3d/colors';

/**
 * Hình nhìn từ trên xuống lớp trên cùng (mặt trước ở phía dưới hình), gồm cả
 * các sticker nhìn ra mặt bên. mode="oll": chỉ tô vàng/xám; mode="pll": màu thật.
 */
export function TopView({ state, mode, size = 84 }: { state: CubeState; mode: 'oll' | 'pll'; size?: number }) {
  const up = centerColor(state, 'U');
  const cell = 20, gap = 2, bar = 6, pad = 3;
  const o = pad + bar + gap; // gốc lưới 3x3
  const grid = 3 * cell + 2 * gap;
  const total = o * 2 + grid - 2 * 0;
  const fill = (c: string) => (mode === 'oll' ? (c === up ? STICKER_HEX[up] : '#4a4f5c') : STICKER_HEX[c as keyof typeof STICKER_HEX]);

  const rects: React.ReactNode[] = [];
  for (const c of state.cubies) {
    if (c.position[1] !== 1) continue;
    const gx = o + (c.position[0] + 1) * (cell + gap);
    const gy = o + (c.position[2] + 1) * (cell + gap);
    c.stickers.forEach((st, i) => {
      const [nx, ny, nz] = st.normal;
      let x = gx, y = gy, w = cell, h = cell;
      if (ny === 1) { /* mặt trên */ }
      else if (nz === -1) { y = gy - bar - gap; h = bar; }
      else if (nz === 1) { y = gy + cell + gap; h = bar; }
      else if (nx === -1) { x = gx - bar - gap; w = bar; }
      else if (nx === 1) { x = gx + cell + gap; w = bar; }
      else return;
      rects.push(<rect key={`${c.position.join()}-${i}`} x={x} y={y} width={w} height={h} rx={2} fill={fill(st.color)} />);
    });
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${total} ${total}`} role="img" aria-label="Hình nhìn từ trên">
      {rects}
    </svg>
  );
}
