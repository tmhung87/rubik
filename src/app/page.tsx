'use client';

import dynamic from 'next/dynamic';

// Toàn bộ app chạy phía trình duyệt (WebGL, localStorage, hash route)
const App = dynamic(() => import('@/components/App').then((m) => m.App), { ssr: false });

export default function Page() {
  return <App />;
}
