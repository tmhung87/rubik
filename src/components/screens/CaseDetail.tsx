'use client';

import { useMemo } from 'react';
import { setupFromAlgorithm, Stage } from '@/engine';
import { getCase, ollShape } from '@/lib/cases';
import { go } from '@/lib/useHashRoute';
import { AlgPlayer } from '../AlgPlayer';
import { CubeCanvas } from '../cube3d/CubeCanvas';
import { TopView } from '../TopView';

export function CaseDetail({ stage, id }: { stage: Stage; id: string }) {
  const c = getCase(stage, id);
  const setup = useMemo(() => (c ? setupFromAlgorithm(c.algs[0]) : null), [c]);
  if (!c || !setup) return <p className="pad">Không tìm thấy case này.</p>;
  const group = stage === 'oll' ? ollShape(setup) : c.group;

  return (
    <div className="screen3d">
      <div className="canvas"><CubeCanvas stage={stage} key={id} /></div>
      <div className="panel">
        <div className="row center">
          {(stage === 'oll' || stage === 'pll') && <TopView state={setup} mode={stage} size={72} />}
          <div className="grow">
            <h2>{c.name}</h2>
            {group && <p className="muted">{group}</p>}
          </div>
        </div>
        <AlgPlayer algs={c.algs} setup={setup} />
        <button className="btn wide" onClick={() => go(`train/${stage}`)}>Luyện {stage.toUpperCase()}</button>
      </div>
    </div>
  );
}
