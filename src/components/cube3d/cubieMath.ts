import * as THREE from 'three';
import { Cubie } from '@/engine';

const toVec = (a: [number, number, number]) => new THREE.Vector3(a[0], a[1], a[2]);

/**
 * Tính phép quay đưa cubie ở trạng thái đã giải (`home`) về hướng hiện tại (`cur`).
 * Ghép sticker theo màu (mỗi sticker trên 1 cubie có màu khác nhau), rồi dựng
 * ma trận quay từ 2 cặp vector (cặp thứ 3 lấy bằng tích có hướng).
 */
export function cubieQuaternion(home: Cubie, cur: Cubie): THREE.Quaternion {
  const pairs: [THREE.Vector3, THREE.Vector3][] = [];
  for (const hs of home.stickers) {
    const cs = cur.stickers.find((s) => s.color === hs.color);
    if (cs) pairs.push([toVec(hs.normal), toVec(cs.normal)]);
  }

  const q = new THREE.Quaternion();
  if (pairs.length >= 2) {
    const [a1, b1] = pairs[0];
    const [a2, b2] = pairs[1];
    const a3 = new THREE.Vector3().crossVectors(a1, a2);
    const b3 = new THREE.Vector3().crossVectors(b1, b2);
    const A = new THREE.Matrix4().makeBasis(a1, a2, a3);
    const B = new THREE.Matrix4().makeBasis(b1, b2, b3);
    // A là ma trận trực chuẩn nên nghịch đảo = chuyển vị
    q.setFromRotationMatrix(B.multiply(A.transpose()));
  } else if (pairs.length === 1) {
    // Tâm khối: chỉ có 1 sticker
    q.setFromUnitVectors(pairs[0][0], pairs[0][1]);
  }
  return q;
}
