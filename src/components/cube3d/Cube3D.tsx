'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { axisIndex, createSolvedCube, CubeState, Vec3 } from '@/engine';
import { useCubeStore } from '@/store/useCubeStore';
import { BODY_HEX, STICKER_HEX } from './colors';
import { cubieQuaternion } from './cubieMath';

const BODY_SIZE = 0.96;
const STICKER_SIZE = 0.86;
const STICKER_OFFSET = 0.4815; // hơi nhô ra khỏi mặt thân (0.48) để tránh z-fighting

const AXIS_VEC = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

const ease = (t: number) => t * t * (3 - 2 * t); // smoothstep

function Sticker({ normal, color }: { normal: Vec3; color: string }) {
  const { position, quaternion } = useMemo(() => {
    const n = new THREE.Vector3(normal[0], normal[1], normal[2]);
    return {
      position: n.clone().multiplyScalar(STICKER_OFFSET),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n),
    };
  }, [normal]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/**
 * Khối Rubik 3D. Không tự giữ state: đọc từ useCubeStore, và mỗi frame
 * đặt lại vị trí/hướng của 26 cubie:
 *  - vị trí + hướng "nghỉ" lấy từ state logic (engine)
 *  - nếu đang có nước `current`, các cubie thuộc lớp bị xoay được quay thêm
 *    một góc theo tiến độ animation. Xong thì gọi commit() để cập nhật state.
 */
export function Cube3D() {
  const home = useMemo(() => createSolvedCube(), []);
  const groups = useRef<(THREE.Group | null)[]>([]);

  // Cache vị trí/hướng nghỉ, chỉ tính lại khi state đổi
  const rest = useRef<{ state: CubeState | null; quats: THREE.Quaternion[] }>({
    state: null,
    quats: [],
  });
  const anim = useRef<{ move: unknown; t: number }>({ move: null, t: 0 });
  const qa = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, delta) => {
    const s = useCubeStore.getState();

    if (rest.current.state !== s.state) {
      rest.current = {
        state: s.state,
        quats: s.state.cubies.map((c, i) => cubieQuaternion(home.cubies[i], c)),
      };
    }

    if (anim.current.move !== s.current) {
      anim.current = { move: s.current, t: 0 };
    }

    const move = s.current;
    let angle = 0;
    if (move) {
      const dur = Math.max(0.001, (s.speedMs * (Math.abs(move.turns) === 2 ? 1.4 : 1)) / 1000);
      anim.current.t = Math.min(1, anim.current.t + delta / dur);
      angle = ease(anim.current.t) * move.turns * (Math.PI / 2);
      qa.setFromAxisAngle(AXIS_VEC[move.axis], angle);
    }

    for (let i = 0; i < s.state.cubies.length; i++) {
      const g = groups.current[i];
      if (!g) continue;
      const cubie = s.state.cubies[i];
      g.position.set(cubie.position[0], cubie.position[1], cubie.position[2]);
      g.quaternion.copy(rest.current.quats[i]);

      if (move && move.layers.includes(cubie.position[axisIndex(move.axis)])) {
        g.position.applyQuaternion(qa);
        g.quaternion.premultiply(qa);
      }
    }

    if (move && anim.current.t >= 1) s.commit();
  });

  return (
    <group>
      {home.cubies.map((c, i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
        >
          <mesh>
            <boxGeometry args={[BODY_SIZE, BODY_SIZE, BODY_SIZE]} />
            <meshBasicMaterial color={BODY_HEX} />
          </mesh>
          {c.stickers.map((st, j) => (
            <Sticker key={j} normal={st.normal} color={STICKER_HEX[st.color]} />
          ))}
        </group>
      ))}
    </group>
  );
}
