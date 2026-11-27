'use client';

import { useMemo, useSyncExternalStore } from 'react';

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
};

/**
 * Router bằng hash (#/learn/oll/oll-27). Chỉ có MỘT trang tĩnh, nên chạy offline
 * không phụ thuộc cách máy chủ ánh xạ đường dẫn, và nút Back của Android vẫn hoạt động.
 */
export function useHashRoute(): string[] {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => '');
  return useMemo(() => hash.replace(/^#\/?/, '').split('/').filter(Boolean), [hash]);
}

export const go = (path: string) => {
  window.location.hash = '#/' + path;
};
export const back = () => window.history.back();
