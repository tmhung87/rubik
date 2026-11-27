import * as THREE from 'three';
import {
  applyMove, applyMoves, createTrainerCube, generateScramble, parseAlgorithm,
} from '../../../engine';
import { cubieQuaternion } from '../cubieMath';
import { useCubeStore } from '../../../store/useCubeStore';
import { HOME_CUBE } from '../home';

const v = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
const home = HOME_CUBE;

describe('cubieQuaternion', () => {
  it('đưa sticker home về đúng hướng hiện tại sau scramble', () => {
    const s = applyMoves(home, parseAlgorithm(generateScramble(40)));
    s.cubies.forEach((c, i) => {
      const q = cubieQuaternion(home.cubies[i], c);
      for (const hs of home.cubies[i].stickers) {
        const cs = c.stickers.find((x) => x.color === hs.color)!;
        expect(v(hs.normal).applyQuaternion(q).distanceTo(v(cs.normal))).toBeLessThan(1e-6);
      }
    });
  });

  // Quan trọng: animation (quay thêm góc turns*90° quanh trục) phải khớp state logic của engine
  it.each(['U', "U'", 'D', 'R', "R'", 'L', 'F', "F'", 'B', 'M', "M'", 'E', 'S', 'x', "y'", 'z', 'r', 'U2', 'R2', 'Rw'])(
    'animation khớp engine cho nước %s',
    (notation) => {
      const before = applyMoves(home, parseAlgorithm(generateScramble(25)));
      const move = parseAlgorithm(notation)[0];
      const after = applyMove(before, move);
      const qa = new THREE.Quaternion().setFromAxisAngle(
        v(move.axis === 'x' ? [1, 0, 0] : move.axis === 'y' ? [0, 1, 0] : [0, 0, 1]),
        (move.turns * Math.PI) / 2,
      );
      const idx = move.axis === 'x' ? 0 : move.axis === 'y' ? 1 : 2;

      before.cubies.forEach((c0, i) => {
        const c1 = after.cubies[i];
        const moving = move.layers.includes(c0.position[idx]);
        // vị trí
        const p = v(c0.position);
        if (moving) p.applyQuaternion(qa);
        expect(p.distanceTo(v(c1.position))).toBeLessThan(1e-6);
        // hướng: áp lên sticker home phải ra đúng normal mới
        const q0 = cubieQuaternion(home.cubies[i], c0);
        const q = moving ? qa.clone().multiply(q0) : q0;
        for (const hs of home.cubies[i].stickers) {
          const cs = c1.stickers.find((x) => x.color === hs.color)!;
          expect(v(hs.normal).applyQuaternion(q).distanceTo(v(cs.normal))).toBeLessThan(1e-6);
        }
      });
    },
  );
});

describe('useCubeStore', () => {
  beforeEach(() => useCubeStore.getState().reset());

  it('enqueue -> current + queue, commit áp từng nước', () => {
    const st = useCubeStore.getState();
    st.enqueue("R U R'");
    expect(useCubeStore.getState().current?.notation).toBe('R');
    expect(useCubeStore.getState().queue).toHaveLength(2);
    useCubeStore.getState().commit();
    expect(useCubeStore.getState().current?.notation).toBe('U');
    useCubeStore.getState().commit();
    useCubeStore.getState().commit();
    expect(useCubeStore.getState().current).toBeNull();
    expect(useCubeStore.getState().queue).toHaveLength(0);
    expect(useCubeStore.getState().state).toEqual(applyMoves(createTrainerCube(), parseAlgorithm("R U R'")));
  });
  it('enqueue thêm khi đang chạy thì xếp hàng', () => {
    useCubeStore.getState().enqueue('R');
    useCubeStore.getState().enqueue('U F');
    expect(useCubeStore.getState().queue.map((m) => m.notation)).toEqual(['U', 'F']);
  });
  it('setCube/reset xoá hàng đợi', () => {
    useCubeStore.getState().enqueue('R U F');
    useCubeStore.getState().reset();
    expect(useCubeStore.getState().current).toBeNull();
    expect(useCubeStore.getState().queue).toHaveLength(0);
  });
});


describe('màu hiển thị khớp trạng thái engine (hồi quy lỗi lệch bảng màu)', () => {
  const NAME: Record<string, string> = { '0,1,0': 'U', '0,-1,0': 'D', '1,0,0': 'R', '-1,0,0': 'L', '0,0,1': 'F', '0,0,-1': 'B' };
  const EXPECTED: Record<string, string> = { U: 'yellow', D: 'white', F: 'green', B: 'blue', R: 'orange', L: 'red' };

  // Cube3D vẽ mỗi sticker bằng: màu của sticker gốc, hướng = hướng gốc xoay bởi cubieQuaternion
  function drawn(state: ReturnType<typeof createTrainerCube>) {
    const out = new Map<string, string>();
    state.cubies.forEach((c, i) => {
      const q = cubieQuaternion(home.cubies[i], c);
      for (const hs of home.cubies[i].stickers) {
        const n = v(hs.normal).applyQuaternion(q).round();
        out.set(`${c.position.join(',')}|${n.x},${n.y},${n.z}`, hs.color);
      }
    });
    return out;
  }

  it('khối đã giải: mỗi mặt đúng màu (vàng trên, trắng dưới, xanh lá trước, cam phải)', () => {
    for (const [key, color] of drawn(createTrainerCube())) {
      expect(color).toBe(EXPECTED[NAME[key.split('|')[1]]]);
    }
  });
  it('sau scramble: hình vẽ = trạng thái engine, từng sticker', () => {
    const s = applyMoves(createTrainerCube(), parseAlgorithm(generateScramble(40)));
    const d = drawn(s);
    for (const c of s.cubies) for (const st of c.stickers) {
      expect(d.get(`${c.position.join(',')}|${st.normal.join(',')}`)).toBe(st.color);
    }
  });
});
