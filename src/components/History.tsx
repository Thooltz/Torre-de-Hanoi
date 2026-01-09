import { Move } from '../lib/hanoi';
import './History.css';

interface HistoryProps {
  moves: Move[];
}

export default function History({ moves }: HistoryProps) {
  return (
    <div className="history">
      <h3 className="history-title">Histórico de Movimentos</h3>
      {moves.length === 0 ? (
        <div className="history-empty">Nenhum movimento ainda</div>
      ) : (
        <ul className="history-list">
          {moves.map((move, index) => (
            <li key={index} className="history-item">
              {index + 1}. {move.from} → {move.to}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

