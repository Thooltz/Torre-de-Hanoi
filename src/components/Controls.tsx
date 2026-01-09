import './Controls.css';

interface ControlsProps {
  onReset: () => void;
  onUndo: () => void;
  onAutoSolve: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  canUndo: boolean;
  isAutoSolving: boolean;
  isPaused: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export default function Controls({
  onReset,
  onUndo,
  onAutoSolve,
  onPause,
  onResume,
  onStop,
  canUndo,
  isAutoSolving,
  isPaused,
  speed,
  onSpeedChange,
}: ControlsProps) {
  return (
    <div>
      <div className="controls">
        <button className="button button-primary" onClick={onReset}>
          Reiniciar
        </button>
        <button className="button button-secondary" onClick={onUndo} disabled={!canUndo}>
          Desfazer
        </button>
        {!isAutoSolving && (
          <button className="button button-success" onClick={onAutoSolve}>
            Resolver Automaticamente
          </button>
        )}
        {isAutoSolving && (
          <>
            {isPaused ? (
              <button className="button button-warning" onClick={onResume}>
                Continuar
              </button>
            ) : (
              <button className="button button-warning" onClick={onPause}>
                Pausar
              </button>
            )}
            <button className="button button-danger" onClick={onStop}>
              Parar
            </button>
          </>
        )}
      </div>
      {isAutoSolving && (
        <div className="auto-solve-controls">
          <div className="speed-control">
            <label>Velocidade:</label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
            />
            <span>{speed}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}

