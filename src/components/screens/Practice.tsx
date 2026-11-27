'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { isStageDone, Stage } from '@/engine';
import { STAGE_INFO } from '@/lib/cases';
import { makeItem, PracticeItem } from '@/lib/practice';
import { useCubeStore } from '@/store/useCubeStore';
import { usePracticeStore } from '@/store/usePracticeStore';
import { AlgPlayer } from '../AlgPlayer';
import { CubeCanvas } from '../cube3d/CubeCanvas';
import { Keypad } from '../Keypad';

type Phase = 'solving' | 'solved' | 'revealed';
const fmt = (ms: number) => (ms / 1000).toFixed(1) + 's';

export function Practice({ stage }: { stage: Stage }) {
  const info = STAGE_INFO[stage];
  const [item, setItem] = useState<PracticeItem | null>(null);
  const [phase, setPhase] = useState<Phase>('solving');
  const [ms, setMs] = useState(0);
  const [score, setScore] = useState({ tried: 0, ok: 0 });
  const startRef = useRef(0);
  const itemRef = useRef<PracticeItem | null>(null);

  const state = useCubeStore((s) => s.state);
  const busy = useCubeStore((s) => !!s.current || s.queue.length > 0);
  const moves = useCubeStore((s) => s.history);
  const record = usePracticeStore((s) => s.record);

  const next = useCallback(() => {
    const it = makeItem(stage, usePracticeStore.getState().stats, itemRef.current?.id);
    itemRef.current = it;
    setItem(it);
    setPhase('solving');
    setMs(0);
    startRef.current = performance.now();
    useCubeStore.getState().setCube(it.setup);
  }, [stage]);

  useEffect(() => {
    next();
  }, [next]);

  // Đồng hồ
  useEffect(() => {
    if (phase !== 'solving') return;
    const t = setInterval(() => setMs(performance.now() - startRef.current), 100);
    return () => clearInterval(t);
  }, [phase, item]);

  // Tự nhận biết đã xong giai đoạn (sau khi animation dừng hẳn)
  useEffect(() => {
    if (phase !== 'solving' || !item || busy) return;
    if (isStageDone(stage, state)) {
      const t = performance.now() - startRef.current;
      setMs(t);
      setPhase('solved');
      setScore((s) => ({ tried: s.tried + 1, ok: s.ok + 1 }));
      record(stage, item.id, true, t);
    }
  }, [state, busy, phase, item, stage, record]);

  const reveal = () => {
    if (!item) return;
    if (phase === 'solving') {
      record(stage, item.id, false);
      setScore((s) => ({ ...s, tried: s.tried + 1 }));
    }
    setPhase('revealed');
  };

  return (
    <div className="screen3d">
      <div className="canvas"><CubeCanvas stage={stage} key={stage} /></div>
      <div className="panel">
        <div className="row between">
          <strong>{info.title}</strong>
          <span className="timer">{fmt(ms)}</span>
          <span className="muted">Đúng {score.ok}/{score.tried}</span>
        </div>

        {phase === 'solving' && item && (
          <>
            <p className="muted small">
              {stage === 'cross'
                ? 'Giải cross trắng ở đáy.'
                : stage === 'f2l'
                  ? 'Ghép cặp vào rãnh trước-phải (cross trắng ở đáy).'
                  : stage === 'oll'
                    ? 'Làm mặt trên cùng màu vàng.'
                    : 'Hoàn thành khối (có thể cần xoay U).'}
              {moves.length > 0 && <> Đã đi: <code>{moves.join(' ')}</code></>}
            </p>
            <div className="row">
              <button className="btn" onClick={() => useCubeStore.getState().setCube(item.setup)}>Làm lại</button>
              <button className="btn" onClick={reveal}>Hiện đáp án</button>
            </div>
            <Keypad />
          </>
        )}

        {phase === 'solved' && item && (
          <>
            <h3 className="ok">Đúng! {fmt(ms)}</h3>
            <p className="muted small">
              {item.name}
              {item.group ? ` · ${item.group}` : ''} · <code>{item.algs[0]}</code>
            </p>
            <button className="btn on wide" onClick={next}>Tiếp theo</button>
          </>
        )}

        {phase === 'revealed' && item && (
          <>
            <p className="muted small">
              {item.name}
              {item.group ? ` · ${item.group}` : ''}
              {stage === 'cross' && ` · ${item.algs[0].split(' ').length} nước (ngắn nhất)`}
            </p>
            <AlgPlayer algs={item.algs} setup={item.setup} />
            <button className="btn on wide" onClick={next}>Tiếp theo</button>
          </>
        )}
      </div>
    </div>
  );
}
