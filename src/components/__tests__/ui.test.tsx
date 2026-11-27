/** @jest-environment jsdom */
import React, { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { applyMoves, createTrainerCube, parseAlgorithm, setupFromAlgorithm } from '@/engine';
import { useCubeStore } from '@/store/useCubeStore';
import { AlgPlayer } from '../AlgPlayer';
import { Home } from '../screens/Home';
import { StageList } from '../screens/StageList';
import { Stats } from '../screens/Stats';
import { TopView } from '../TopView';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const commit = () => act(() => useCubeStore.getState().commit());
const SUNE = "R U R' U R U2 R'";

describe('AlgPlayer', () => {
  const setup = setupFromAlgorithm(SUNE);
  beforeEach(() => useCubeStore.getState().reset());

  it('đặt khối về trạng thái case khi mở', () => {
    render(<AlgPlayer algs={[SUNE]} setup={setup} />);
    expect(useCubeStore.getState().state).toBe(setup);
    expect(screen.getAllByText(/^[RU]/)).toHaveLength(7);
  });

  it('tiến từng nước rồi lùi lại, đúng trạng thái', () => {
    render(<AlgPlayer algs={[SUNE]} setup={setup} />);
    fireEvent.click(screen.getByLabelText('Tiến một nước'));
    expect(useCubeStore.getState().current?.notation).toBe('R');
    commit();
    fireEvent.click(screen.getByLabelText('Tiến một nước'));
    commit();
    expect(useCubeStore.getState().history).toEqual(['R', 'U']);
    expect(document.querySelectorAll('.tok.done')).toHaveLength(2);

    fireEvent.click(screen.getByLabelText('Lùi một nước'));
    commit();
    expect(document.querySelectorAll('.tok.done')).toHaveLength(1);
    expect(useCubeStore.getState().state).toEqual(applyMoves(setup, parseAlgorithm('R')));
  });

  it('phát cả thuật toán => giải xong, tô xám hết', () => {
    render(<AlgPlayer algs={[SUNE]} setup={setup} />);
    fireEvent.click(screen.getByLabelText('Phát'));
    for (let i = 0; i < 7; i++) commit();
    expect(document.querySelectorAll('.tok.done')).toHaveLength(7);
    expect(useCubeStore.getState().state).toEqual(applyMoves(setup, parseAlgorithm(SUNE)));
    // bấm phát lần nữa => chạy lại từ đầu
    fireEvent.click(screen.getByLabelText('Phát'));
    expect(useCubeStore.getState().history).toEqual([]);
    expect(useCubeStore.getState().current?.notation).toBe('R');
  });

  it('tạm dừng giữa chừng rồi phát tiếp đúng chỗ', () => {
    render(<AlgPlayer algs={[SUNE]} setup={setup} />);
    fireEvent.click(screen.getByLabelText('Phát'));
    commit(); commit(); // đã xong R U, đang chạy R'
    fireEvent.click(screen.getByLabelText('Tạm dừng'));
    expect(useCubeStore.getState().queue).toHaveLength(0);
    commit(); // nước đang chạy hoàn tất
    expect(document.querySelectorAll('.tok.done')).toHaveLength(3);
    fireEvent.click(screen.getByLabelText('Phát'));
    for (let i = 0; i < 4; i++) commit();
    expect(useCubeStore.getState().state).toEqual(applyMoves(setup, parseAlgorithm(SUNE)));
    expect(document.querySelectorAll('.tok.done')).toHaveLength(7);
  });

  it('nhiều cách giải => chuyển cách và đặt lại', () => {
    render(<AlgPlayer algs={[SUNE, "R U2 R' U' R U' R'"]} setup={setup} />);
    fireEvent.click(screen.getByText('Cách 2'));
    expect(screen.getAllByText(/^[RU]/)).toHaveLength(7);
    expect(useCubeStore.getState().history).toEqual([]);
  });
});

describe('render các màn hình (không lỗi)', () => {
  it('Home / StageList / Stats / TopView', () => {
    expect(renderToString(<Home />)).toContain('OLL');
    for (const stage of ['cross', 'f2l', 'oll', 'pll'] as const) {
      expect(renderToString(<StageList stage={stage} />).length).toBeGreaterThan(200);
    }
    expect(renderToString(<StageList stage="oll" />)).toContain('OLL 57');
    expect(renderToString(<Stats />)).toContain('PLL');
    expect(renderToString(<TopView state={createTrainerCube()} mode="pll" />)).toContain('<svg');
  });
});
