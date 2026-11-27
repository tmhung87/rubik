'use client';

import { useEffect } from 'react';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** Đăng ký service worker (chỉ ở bản build production) để chạy offline. */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register(`${base}/sw.js`, { scope: `${base}/` })
      .catch((err) => console.warn('Không đăng ký được service worker', err));
  }, []);
  return null;
}
