/** @jest-environment jsdom */
import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { parseAlgorithm, solveCross } from '@/engine';
import { useCubeStore } from '@/store/useCubeStore';
import { usePracticeStore } from '@/store/usePracticeStore';
import { Practice } from '../screens/Practice';

jest.mock('../cube3d/CubeCanvas', () => ({ CubeCanvas: () => null }));
jest.mock('../Keypad', () => ({ Keypad: () => null }));
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Chạy hết hàng đợi như Cube3D vẫn làm (commit sau mỗi animation) */
const drain = () => {
  while (useCubeStore.getState().current) act(() => useCubeStore.getState().commit());
};

describe('Practice', () => {
  beforeEach(() => usePracticeStore.getState().resetAll());

  it('cross: tự nhận biết khi giải xong, ghi thống kê', () => {
    render(<Practice stage="cross" />);
    const sol = solveCross(useCubeStore.getState().state);
    expect(sol.split(' ').length).toBeGreaterThan(0);
    act(() => useCubeStore.getState().enqueue(parseAlgorithm(sol)));
    drain();
    expect(screen.getByText(/Đúng!/)).toBeTruthy();
    const st = usePracticeStore.getState().stats['cross:random'];
    expect(st.attempts).toBe(1);
    expect(st.successes).toBe(1);
    fireEvent.click(screen.getByText('Tiếp theo'));
    expect(screen.queryByText(/Đúng!/)).toBeNull();
  });

  it('hiện đáp án: tính là sai, hiện trình phát', () => {
    render(<Practice stage="oll" />);
    fireEvent.click(screen.getByText('Hiện đáp án'));
    const st = Object.values(usePracticeStore.getState().stats)[0];
    expect(st.attempts).toBe(1);
    expect(st.successes).toBe(0);
    expect(screen.getByLabelText('Phát')).toBeTruthy();
    // phát đáp án => khối được giải xong giai đoạn OLL
    fireEvent.click(screen.getByLabelText('Phát'));
    drain();
    expect(document.querySelectorAll('.tok.done').length).toBeGreaterThan(0);
  });

  it('PLL: làm sai rồi giải lại bằng nút "Làm lại" vẫn hoạt động', () => {
    render(<Practice stage="pll" />);
    const start = useCubeStore.getState().state;
    act(() => useCubeStore.getState().enqueue('R U'));
    drain();
    fireEvent.click(screen.getByText('Làm lại'));
    expect(useCubeStore.getState().state).toEqual(start);
    expect(useCubeStore.getState().history).toEqual([]);
  });
});
