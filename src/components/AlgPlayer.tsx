'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CubeState, invertMove, parseAlgorithm } from '@/engine';
import { useCubeStore } from '@/store/useCubeStore';

/**
 * Trình phát thuật toán: đặt khối về trạng thái `setup`, rồi cho chạy từng nước
 * (lùi / tiến / phát / tạm dừng). Nước đang chạy được tô sáng.
 */
export function AlgPlayer({ algs, setup }: { algs: string[]; setup: CubeState }) {
  const [variant, setVariant] = useState(0);
  const alg = algs[Math.min(variant, algs.length - 1)];
  const moves = useMemo(() => parseAlgorithm(alg), [alg]);

  const [index, setIndex] = useState(0); // số nước đã áp xong
  const indexRef = useRef(0);
  const pending = useRef<number[]>([]); // hướng (+1 tiến / -1 lùi) của các nước đã xếp hàng
  const lastLen = useRef(0);

  const history = useCubeStore((s) => s.history);
  const busy = useCubeStore((s) => !!s.current || s.queue.length > 0);
  const speedMs = useCubeStore((s) => s.speedMs);
  const setSpeed = useCubeStore((s) => s.setSpeed);

  const bump = (d: number) => {
    indexRef.current += d;
    setIndex(indexRef.current);
  };

  // Mỗi nước áp xong => cập nhật vị trí trong thuật toán
  useEffect(() => {
    if (history.length < lastLen.current) {
      lastLen.current = history.length;
      return;
    }
    while (lastLen.current < history.length) {
      lastLen.current++;
      bump(pending.current.shift() ?? 0);
    }
  }, [history]);

  const restart = () => {
    pending.current = [];
    lastLen.current = 0;
    indexRef.current = 0;
    setIndex(0);
    useCubeStore.getState().setCube(setup);
  };
  useEffect(restart, [setup, alg]); // eslint-disable-line react-hooks/exhaustive-deps

  const target = () => indexRef.current + pending.current.reduce((a, b) => a + b, 0);
  const st = () => useCubeStore.getState();

  const forward = () => {
    const t = target();
    if (t >= moves.length) return;
    pending.current.push(1);
    st().enqueue([moves[t]]);
  };
  const backward = () => {
    const t = target();
    if (t <= 0) return;
    pending.current.push(-1);
    st().enqueue([invertMove(moves[t - 1])]);
  };
  const play = () => {
    if (target() >= moves.length) restart();
    const t = target();
    const rest = moves.slice(t);
    rest.forEach(() => pending.current.push(1));
    st().enqueue(rest);
  };
  const pause = () => {
    st().clearQueue();
    pending.current = pending.current.slice(0, st().current ? 1 : 0);
  };

  return (
    <div className="player">
      {algs.length > 1 && (
        <div className="row">
          {algs.map((_, i) => (
            <button key={i} className={`btn small ${i === variant ? 'on' : ''}`} onClick={() => setVariant(i)}>
              Cách {i + 1}
            </button>
          ))}
        </div>
      )}
      <div className="alg">
        {moves.map((m, i) => (
          <span key={i} className={i < index ? 'tok done' : i === index && busy ? 'tok now' : 'tok'}>
            {m.notation}
          </span>
        ))}
      </div>
      <div className="row">
        <button className="btn" onClick={restart} aria-label="Về đầu">⏮</button>
        <button className="btn" onClick={backward} aria-label="Lùi một nước">◀</button>
        <button className="btn on" onClick={busy ? pause : play} aria-label={busy ? 'Tạm dừng' : 'Phát'}>
          {busy ? '⏸' : '▶'}
        </button>
        <button className="btn" onClick={forward} aria-label="Tiến một nước">▶|</button>
      </div>
      <div className="row">
        <button className={`btn small ${speedMs > 400 ? 'on' : ''}`} onClick={() => setSpeed(600)}>Chậm</button>
        <button className={`btn small ${speedMs <= 400 && speedMs > 150 ? 'on' : ''}`} onClick={() => setSpeed(300)}>Vừa</button>
        <button className={`btn small ${speedMs <= 150 ? 'on' : ''}`} onClick={() => setSpeed(120)}>Nhanh</button>
      </div>
    </div>
  );
}
