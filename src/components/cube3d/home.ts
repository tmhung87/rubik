import { createTrainerCube } from '@/engine';

/**
 * Khối "gốc" dùng để dựng mesh: màu từng sticker phải CÙNG bảng màu với trạng thái trong
 * store (TRAINER_COLORS: vàng trên, trắng dưới, xanh lá trước). Dùng chung một nguồn để không lệch.
 */
export const HOME_CUBE = createTrainerCube();
