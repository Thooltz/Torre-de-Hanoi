import { GameState, PegId } from '../lib/hanoi';
import Peg from './Peg';
import './Board.css';

interface BoardProps {
  state: GameState;
  selectedPeg: PegId | null;
  onPegClick: (pegId: PegId) => void;
  numDisks: number;
  disabled: boolean;
}

export default function Board({ state, selectedPeg, onPegClick, numDisks, disabled }: BoardProps) {
  return (
    <div className="board">
      {(['A', 'B', 'C'] as PegId[]).map((pegId) => (
        <Peg
          key={pegId}
          pegId={pegId}
          disks={state[pegId]}
          isSelected={selectedPeg === pegId}
          onClick={() => !disabled && onPegClick(pegId)}
          numDisks={numDisks}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

