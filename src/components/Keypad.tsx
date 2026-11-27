'use client';

import { useState } from 'react';
import { useCubeStore } from '@/store/useCubeStore';

const ROWS = [
  ['U', 'D', 'L', 'R', 'F', 'B'],
  ['M', 'E', 'S', 'x', 'y', 'z'],
  ['u', 'd', 'l', 'r', 'f', 'b'],
];

/**
 * Bàn phím nước đi. Bấm ' hoặc 2 trước rồi bấm chữ để xoay ngược / xoay đôi
 * (chỉ áp cho nước kế tiếp).
 */
export function Keypad() {
  const enqueue = useCubeStore((s) => s.enqueue);
  const speedMs = useCubeStore((s) => s.speedMs);
  const setSpeed = useCubeStore((s) => s.setSpeed);
  const [mod, setMod] = useState<'' | "'" | '2'>('');

  return (
    <div className="keypad">
      {ROWS.map((row, i) => (
        <div className="row" key={i}>
          {row.map((m) => (
            <button key={m} className="btn key" onClick={() => { enqueue(m + mod); setMod(''); }}>
              {m}
              {mod}
            </button>
          ))}
        </div>
      ))}
      <div className="row">
        <button className={`btn ${mod === "'" ? 'on' : ''}`} onClick={() => setMod(mod === "'" ? '' : "'")}>&prime; ngược</button>
        <button className={`btn ${mod === '2' ? 'on' : ''}`} onClick={() => setMod(mod === '2' ? '' : '2')}>2 đôi</button>
        <button className={`btn ${speedMs > 400 ? 'on' : ''}`} onClick={() => setSpeed(600)}>Chậm</button>
        <button className={`btn ${speedMs <= 400 && speedMs > 150 ? 'on' : ''}`} onClick={() => setSpeed(300)}>Vừa</button>
        <button className={`btn ${speedMs <= 150 ? 'on' : ''}`} onClick={() => setSpeed(120)}>Nhanh</button>
      </div>
    </div>
  );
}
