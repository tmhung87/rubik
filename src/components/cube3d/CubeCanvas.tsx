'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Cube3D } from './Cube3D';
import type { Stage } from '@/engine';

/** Vị trí camera mặc định theo giai đoạn: cross nhìn từ dưới, F2L nhìn ngang rãnh trước-phải. */
const CAMERA: Record<Stage, [number, number, number]> = {
  cross: [5, -5, 7],
  f2l: [5.5, 2.6, 6.8],
  oll: [5.2, 5.2, 6.6],
  pll: [5.2, 5.2, 6.6],
};

/**
 * Canvas 3D. OrbitControls lo cử chỉ: 1 ngón vuốt để xoay, 2 ngón chụm để zoom
 * (chuột: kéo để xoay, lăn để zoom).
 */
export function CubeCanvas({ stage = 'oll' }: { stage?: Stage }) {
  return (
    <Canvas camera={{ position: CAMERA[stage], fov: 45 }} dpr={[1, 2]} style={{ touchAction: 'none' }}>
      <Cube3D />
      <OrbitControls enablePan={false} enableDamping minDistance={5} maxDistance={16} />
    </Canvas>
  );
}
