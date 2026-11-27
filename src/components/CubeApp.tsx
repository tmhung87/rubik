'use client';

import dynamic from 'next/dynamic';
import { MoveControls } from './MoveControls';

// WebGL chỉ chạy trên trình duyệt => tắt SSR cho canvas
const CubeCanvas = dynamic(() => import('./cube3d/CubeCanvas').then((m) => m.CubeCanvas), {
  ssr: false,
});

export function CubeApp() {
  return (
    <main className="app">
      <div className="canvas">
        <CubeCanvas />
      </div>
      <MoveControls />
    </main>
  );
}
