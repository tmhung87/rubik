'use client';

import { useMemo } from 'react';
import { setupFromAlgorithm, Stage } from '@/engine';
import { CaseData, getCases, ollShape, STAGE_INFO } from '@/lib/cases';
import { go } from '@/lib/useHashRoute';
import { masteryOf, usePracticeStore } from '@/store/usePracticeStore';
import { TopView } from '../TopView';

const OLL_ORDER = ['Chấm', 'Chữ L', 'Đường thẳng', 'Chữ thập'];

export function StageList({ stage }: { stage: Stage }) {
  const info = STAGE_INFO[stage];
  const stats = usePracticeStore((s) => s.stats);

  const groups = useMemo(() => {
    const items = getCases(stage).map((c) => {
      const setup = setupFromAlgorithm(c.algs[0]);
      const group = stage === 'oll' ? ollShape(setup) : c.group ?? '';
      return { c, setup, group };
    });
    const map = new Map<string, typeof items>();
    for (const it of items) map.set(it.group, [...(map.get(it.group) ?? []), it]);
    const entries = [...map.entries()];
    if (stage === 'oll') entries.sort((a, b) => OLL_ORDER.findIndex((o) => a[0].startsWith(o)) - OLL_ORDER.findIndex((o) => b[0].startsWith(o)));
    return entries;
  }, [stage]);

  return (
    <div className="scroll pad">
      <section className="card">
        <h2>{info.title}</h2>
        <p>{info.goal}</p>
        <ul className="tips">{info.tips.map((t) => <li key={t}>{t}</li>)}</ul>
        <button className="btn on wide" onClick={() => go(`train/${stage}`)}>Luyện {info.title}</button>
      </section>

      {groups.map(([group, items]) => (
        <section key={group}>
          <h3>{group} <span className="muted">({items.length})</span></h3>
          <div className="grid">
            {items.map(({ c, setup }) => (
              <CaseCard key={c.id} stage={stage} c={c} setup={setup} mastery={masteryOf(stats[`${stage}:${c.id}`])} />
            ))}
          </div>
        </section>
      ))}
      {stage === 'cross' && <p className="muted">Cross không có danh sách case: hãy bấm Luyện để giải scramble ngẫu nhiên.</p>}
    </div>
  );
}

function CaseCard({ stage, c, setup, mastery }: { stage: Stage; c: CaseData; setup: Parameters<typeof TopView>[0]['state']; mastery: string }) {
  return (
    <button className="card casecard" onClick={() => go(`learn/${stage}/${c.id}`)}>
      <span className={`dot ${mastery}`} aria-label={mastery} />
      {(stage === 'oll' || stage === 'pll') && <TopView state={setup} mode={stage} />}
      <strong>{c.name}</strong>
      {stage === 'f2l' && <code className="mini">{c.algs[0]}</code>}
    </button>
  );
}
