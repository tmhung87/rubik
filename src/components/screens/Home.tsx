'use client';

import { getCases, STAGE_INFO, STAGES } from '@/lib/cases';
import { go } from '@/lib/useHashRoute';
import { masteryOf, usePracticeStore } from '@/store/usePracticeStore';

export function Home() {
  const stats = usePracticeStore((s) => s.stats);
  return (
    <div className="scroll pad">
      <p className="muted">Chọn một bước của CFOP để học hoặc luyện. Mọi thứ chạy offline.</p>
      {STAGES.map((stage) => {
        const info = STAGE_INFO[stage];
        const cases = getCases(stage);
        const good = cases.filter((c) => masteryOf(stats[`${stage}:${c.id}`]) === 'good').length;
        const tried = cases.filter((c) => (stats[`${stage}:${c.id}`]?.attempts ?? 0) > 0).length;
        const crossTried = stats['cross:random']?.attempts ?? 0;
        return (
          <section className="card stagecard" key={stage}>
            <div className="letter">{info.letter}</div>
            <div className="grow">
              <h2>{info.title}</h2>
              <p className="muted">{info.goal}</p>
              <p className="small">
                {stage === 'cross'
                  ? `Đã luyện ${crossTried} lần`
                  : `Đã thử ${tried}/${cases.length} case · thuộc ${good}`}
              </p>
              <div className="row">
                <button className="btn" onClick={() => go(`learn/${stage}`)}>Học</button>
                <button className="btn on" onClick={() => go(`train/${stage}`)}>Luyện</button>
              </div>
            </div>
          </section>
        );
      })}
      <button className="btn wide" onClick={() => go('stats')}>Thống kê</button>
    </div>
  );
}
