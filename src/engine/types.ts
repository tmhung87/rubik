/** Vector 3 chiều có tọa độ nguyên: mỗi thành phần thuộc {-1, 0, 1}. */
export type Vec3 = [number, number, number];

export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';
export type Axis = 'x' | 'y' | 'z';

/** Hệ trục: +x = R, +y = U, +z = F (nhìn từ phía trước, tay phải). */
export const FACE_NORMAL: Record<Face, Vec3> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
};

/** Màu chuẩn quốc tế: trắng trên, xanh lá trước. */
export type Color = 'white' | 'yellow' | 'green' | 'blue' | 'red' | 'orange';

export const DEFAULT_COLORS: Record<Face, Color> = {
  U: 'white',
  D: 'yellow',
  F: 'green',
  B: 'blue',
  R: 'red',
  L: 'orange',
};

/** Một sticker dán trên cubie: nhìn ra hướng `normal`. */
export interface Sticker {
  normal: Vec3;
  color: Color;
}

/** Một khối nhỏ (cubie). Tâm khối (0,0,0) không được tạo. */
export interface Cubie {
  position: Vec3;
  stickers: Sticker[];
}

/** Trạng thái cả khối: 26 cubie. Immutable: mọi thao tác trả về state mới. */
export interface CubeState {
  cubies: Cubie[];
}

/**
 * Một nước xoay đã được chuẩn hoá.
 * - axis, layers: trục và các lớp (toạ độ -1/0/1) bị xoay
 * - turns: số lần xoay +90° quanh trục theo quy tắc bàn tay phải (1, -1 hoặc 2)
 * - notation: ký hiệu chuẩn, dùng để hiển thị/highlight (vd "R'", "U2")
 */
export interface Move {
  notation: string;
  axis: Axis;
  layers: number[];
  turns: 1 | -1 | 2;
}
