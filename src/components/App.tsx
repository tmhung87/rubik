'use client';

import { useEffect } from 'react';
import { go, useHashRoute } from '@/lib/useHashRoute';
import { isStage, STAGE_INFO } from '@/lib/cases';
import { usePracticeStore } from '@/store/usePracticeStore';
import { CaseDetail } from './screens/CaseDetail';
import { Home } from './screens/Home';
import { Practice } from './screens/Practice';
import { StageList } from './screens/StageList';
import { Stats } from './screens/Stats';

/** Màn hình + tiêu đề + đường quay lại theo hash route. */
export function App() {
  const route = useHashRoute();
  const [page, stage, id] = route;

  useEffect(() => {
    usePracticeStore.persist.rehydrate();
  }, []);

  let title = 'Rubik CFOP Trainer';
  let parent: string | null = null;
  let body: React.ReactNode = <Home />;

  if (page === 'learn' && isStage(stage) && id) {
    title = STAGE_INFO[stage].title;
    parent = `learn/${stage}`;
    body = <CaseDetail stage={stage} id={id} />;
  } else if (page === 'learn' && isStage(stage)) {
    title = `Học ${STAGE_INFO[stage].title}`;
    parent = '';
    body = <StageList stage={stage} />;
  } else if (page === 'train' && isStage(stage)) {
    title = `Luyện ${STAGE_INFO[stage].title}`;
    parent = '';
    body = <Practice stage={stage} key={stage} />;
  } else if (page === 'stats') {
    title = 'Thống kê';
    parent = '';
    body = <Stats />;
  }

  return (
    <main className="app">
      <header className="header">
        {parent !== null ? (
          <button className="back" onClick={() => go(parent)} aria-label="Quay lại">←</button>
        ) : (
          <span className="back" />
        )}
        <h1>{title}</h1>
      </header>
      <div className="body">{body}</div>
    </main>
  );
}
