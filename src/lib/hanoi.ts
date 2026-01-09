export type PegId = 'A' | 'B' | 'C';

export type GameState = Record<PegId, number[]>;

export interface Move {
  from: PegId;
  to: PegId;
}

export function isValidMove(state: GameState, from: PegId, to: PegId): boolean {
  if (from === to) return false;
  const fromPeg = state[from];
  const toPeg = state[to];
  if (fromPeg.length === 0) return false;
  if (toPeg.length === 0) return true;
  return fromPeg[fromPeg.length - 1] < toPeg[toPeg.length - 1];
}

export function moveDisk(state: GameState, from: PegId, to: PegId): GameState {
  if (!isValidMove(state, from, to)) {
    throw new Error('Invalid move');
  }
  const newState: GameState = {
    A: [...state.A],
    B: [...state.B],
    C: [...state.C],
  };
  const disk = newState[from].pop();
  if (disk !== undefined) {
    newState[to].push(disk);
  }
  return newState;
}

export function generateSolution(n: number, from: PegId, aux: PegId, to: PegId): Move[] {
  if (n === 0) return [];
  if (n === 1) return [{ from, to }];
  const moves: Move[] = [];
  moves.push(...generateSolution(n - 1, from, to, aux));
  moves.push({ from, to });
  moves.push(...generateSolution(n - 1, aux, from, to));
  return moves;
}

export function createInitialState(numDisks: number): GameState {
  const disks: number[] = [];
  for (let i = numDisks; i >= 1; i--) {
    disks.push(i);
  }
  return {
    A: disks,
    B: [],
    C: [],
  };
}

