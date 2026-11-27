'use client';

import { applyMoves, createSolvedCube, generateScramble, parseAlgorithm } from '@/engine';
import { useCubeStore } from '@/store/useCubeStore';

const MOVES = [
  ['U', "U'", 'D', "D'"],
  ['R', "R'", 'L', "L'"],
  ['F', "F'", 'B', "B'"],
];

/** Nút bấm để thử khối: các nước cơ bản, scramble, reset, đổi tốc độ. */
export function MoveControls() {
  const enqueue = useCubeStore((s) => s.enqueue);
  const setCube = useCubeStore((s) => s.setCube);
  const reset = useCubeStore((s) => s.reset);
  const setSpeed = useCubeStore((s) => s.setSpeed);

  const scramble = () =>
    setCube(applyMoves(createSolvedCube(), parseAlgorithm(generateScramble(20))));

  return (
    <div className="controls">
      {MOVES.map((row, i) => (
        <div className="row" key={i}>
          {row.map((m) => (
            <button key={m} className="btn" onClick={() => enqueue(m)}>
              {m}
            </button>
          ))}
        </div>
      ))}
      <div className="row">
        <button className="btn" onClick={scramble}>Scramble</button>
        <button className="btn" onClick={reset}>Reset</button>
        <button className="btn" onClick={() => enqueue("R U R' U R U2 R'")}>Sune</button>
      </div>
      <div className="row">
        <button className="btn" onClick={() => setSpeed(600)}>Chậm</button>
        <button className="btn" onClick={() => setSpeed(300)}>Vừa</button>
        <button className="btn" onClick={() => setSpeed(120)}>Nhanh</button>
      </div>
    </div>
  );
}
