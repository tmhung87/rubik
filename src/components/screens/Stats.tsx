'use client';

import { getCases, STAGE_INFO, STAGES } from '@/lib/cases';
import { masteryOf, usePracticeStore } from '@/store/usePracticeStore';

export function Stats() {
  const stats = usePracticeStore((s) => s.stats);
  const resetAll = usePracticeStore((s) => s.resetAll);

  return (
    <div className="scroll pad">
      {STAGES.map((stage) => {
        const cases = getCases(stage);
        if (stage === 'cross') {
          const s = stats['cross:random'];
          return (
            <section className="card" key={stage}>
              <h2>{STAGE_INFO[stage].title}</h2>
              <p>{s ? `${s.successes}/${s.attempts} lần giải được` : 'Chưa luyện'}{s?.bestMs ? ` · nhanh nhất ${(s.bestMs / 1000).toFixed(1)}s` : ''}</p>
            </section>
          );
        }
        const rows = cases
          .map((c) => ({ c, s: stats[`${stage}:${c.id}`] }))
          .filter((r) => r.s && r.s.attempts > 0);
        const good = rows.filter((r) => masteryOf(r.s) === 'good').length;
        const weak = [...rows].sort((a, b) => a.s!.successes / a.s!.attempts - b.s!.successes / b.s!.attempts).slice(0, 5);
        return (
          <section className="card" key={stage}>
            <h2>{STAGE_INFO[stage].title}</h2>
            <p>Đã thử {rows.length}/{cases.length} case · thuộc {good}</p>
            {weak.length > 0 && (
              <>
                <h3>Cần ôn thêm</h3>
                <ul className="tips">
                  {weak.map(({ c, s }) => (
                    <li key={c.id}>{c.name}: {s!.successes}/{s!.attempts} đúng{s!.bestMs ? ` · tốt nhất ${(s!.bestMs / 1000).toFixed(1)}s` : ''}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        );
      })}
      <button
        className="btn wide"
        onClick={() => { if (window.confirm('Xoá toàn bộ thống kê luyện tập?')) resetAll(); }}
      >
        Xoá thống kê
      </button>
    </div>
  );
}
