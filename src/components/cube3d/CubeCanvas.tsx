'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Cube3D } from './Cube3D';

/**
 * Canvas 3D. OrbitControls lo cử chỉ: 1 ngón vuốt để xoay, 2 ngón chụm để zoom
 * (chuột: kéo để xoay, lăn để zoom). Camera đặt chéo để thấy 3 mặt U, F, R.
 */
export function CubeCanvas() {
  return (
    <Canvas camera={{ position: [5.2, 4.8, 7.2], fov: 45 }} dpr={[1, 2]} style={{ touchAction: 'none' }}>
      <Cube3D />
      <OrbitControls enablePan={false} enableDamping minDistance={5} maxDistance={16} />
    </Canvas>
  );
}
