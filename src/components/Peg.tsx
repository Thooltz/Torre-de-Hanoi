import { PegId } from '../lib/hanoi';
import Disk from './Disk';
import './Peg.css';

interface PegProps {
  pegId: PegId;
  disks: number[];
  isSelected: boolean;
  onClick: () => void;
  numDisks: number;
  disabled: boolean;
}

export default function Peg({ pegId, disks, isSelected, onClick, numDisks, disabled }: PegProps) {
  return (
    <div
      className={`peg-container ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
    >
      <div className="peg-label">{pegId}</div>
      <div className="peg-stack">
        <div className="peg-rod" />
        {disks.map((diskSize, index) => (
          <Disk key={`${pegId}-${index}`} size={diskSize} totalDisks={numDisks} />
        ))}
      </div>
      <div className="peg-base" />
    </div>
  );
}

