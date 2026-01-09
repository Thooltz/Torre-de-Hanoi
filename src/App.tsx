import { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, PegId, Move, createInitialState, isValidMove, moveDisk, generateSolution } from './lib/hanoi';
import Board from './components/Board';
import Controls from './components/Controls';
import History from './components/History';
import './App.css';

type StatusType = 'info' | 'success' | 'error' | 'warning';

interface StatusMessage {
  text: string;
  type: StatusType;
}

const STORAGE_KEYS = {
  NUM_DISKS: 'hanoi_numDisks',
  SPEED: 'hanoi_speed',
};

function App() {
  const [numDisks, setNumDisks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NUM_DISKS);
    return saved ? Number(saved) : 3;
  });

  const [state, setState] = useState<GameState>(() => createInitialState(numDisks));
  const [selectedPeg, setSelectedPeg] = useState<PegId | null>(null);
  const [moves, setMoves] = useState<Move[]>([]);
  const [movesCount, setMovesCount] = useState(0);
  const [status, setStatus] = useState<StatusMessage>({ text: '', type: 'info' });
  const [isAutoSolving, setIsAutoSolving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SPEED);
    return saved ? Number(saved) : 500;
  });

  const solutionMovesRef = useRef<Move[]>([]);
  const currentMoveIndexRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const historyRef = useRef<{ state: GameState; moves: Move[]; count: number }[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NUM_DISKS, numDisks.toString());
  }, [numDisks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPEED, speed.toString());
  }, [speed]);

  useEffect(() => {
    setState(createInitialState(numDisks));
    setSelectedPeg(null);
    setMoves([]);
    setMovesCount(0);
    setStatus({ text: '', type: 'info' });
    stopAutoSolve();
    historyRef.current = [];
  }, [numDisks]);

  const stopAutoSolve = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAutoSolving(false);
    setIsPaused(false);
    currentMoveIndexRef.current = 0;
    solutionMovesRef.current = [];
  };

  const executeMove = (move: Move, addToHistory = true) => {
    try {
      const newState = moveDisk(state, move.from, move.to);
      setState(newState);
      setMoves((prev) => [...prev, move]);
      setMovesCount((prev) => prev + 1);
      if (addToHistory) {
        historyRef.current.push({
          state: { ...state },
          moves: [...moves],
          count: movesCount,
        });
      }
      setStatus({ text: `Movimento: ${move.from} → ${move.to}`, type: 'success' });
      return true;
    } catch {
      setStatus({ text: 'Movimento inválido!', type: 'error' });
      setTimeout(() => setStatus({ text: '', type: 'info' }), 2000);
      return false;
    }
  };

  const handlePegClick = (pegId: PegId) => {
    if (isAutoSolving) return;

    if (selectedPeg === null) {
      if (state[pegId].length > 0) {
        setSelectedPeg(pegId);
        setStatus({ text: `Selecionado: ${pegId}`, type: 'info' });
      }
    } else {
      if (selectedPeg === pegId) {
        setSelectedPeg(null);
        setStatus({ text: '', type: 'info' });
      } else {
        const move: Move = { from: selectedPeg, to: pegId };
        if (isValidMove(state, selectedPeg, pegId)) {
          executeMove(move);
          setSelectedPeg(null);
        } else {
          setStatus({ text: 'Movimento inválido!', type: 'error' });
          setTimeout(() => {
            setStatus({ text: '', type: 'info' });
            setSelectedPeg(null);
          }, 2000);
        }
      }
    }
  };

  const handleReset = () => {
    setState(createInitialState(numDisks));
    setSelectedPeg(null);
    setMoves([]);
    setMovesCount(0);
    setStatus({ text: '', type: 'info' });
    stopAutoSolve();
    historyRef.current = [];
  };

  const handleUndo = () => {
    if (historyRef.current.length === 0) return;
    const lastState = historyRef.current.pop()!;
    setState(lastState.state);
    setMoves(lastState.moves);
    setMovesCount(lastState.count);
    setSelectedPeg(null);
    setStatus({ text: 'Movimento desfeito', type: 'info' });
    setTimeout(() => setStatus({ text: '', type: 'info' }), 1500);
  };

  const handleAutoSolve = () => {
    const solution = generateSolution(numDisks, 'A', 'B', 'C');
    solutionMovesRef.current = solution;
    currentMoveIndexRef.current = 0;
    setIsAutoSolving(true);
    setIsPaused(false);
    setSelectedPeg(null);
    setStatus({ text: 'Resolvendo...', type: 'warning' });

    const executeNextMove = () => {
      if (isPaused) return;

      if (currentMoveIndexRef.current >= solutionMovesRef.current.length) {
        stopAutoSolve();
        setStatus({ text: 'Resolvido!', type: 'success' });
        return;
      }

      const move = solutionMovesRef.current[currentMoveIndexRef.current];
      executeMove(move, false);
      currentMoveIndexRef.current++;

      if (currentMoveIndexRef.current >= solutionMovesRef.current.length) {
        stopAutoSolve();
        setStatus({ text: 'Resolvido!', type: 'success' });
      }
    };

    intervalRef.current = window.setInterval(executeNextMove, speed);
  };

  const handlePause = () => {
    setIsPaused(true);
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStatus({ text: 'Pausado', type: 'info' });
  };

  const handleResume = () => {
    setIsPaused(false);
    setStatus({ text: 'Resolvendo...', type: 'warning' });

    const executeNextMove = () => {
      if (currentMoveIndexRef.current >= solutionMovesRef.current.length) {
        stopAutoSolve();
        setStatus({ text: 'Resolvido!', type: 'success' });
        return;
      }

      const move = solutionMovesRef.current[currentMoveIndexRef.current];
      executeMove(move, false);
      currentMoveIndexRef.current++;

      if (currentMoveIndexRef.current >= solutionMovesRef.current.length) {
        stopAutoSolve();
        setStatus({ text: 'Resolvido!', type: 'success' });
      }
    };

    intervalRef.current = window.setInterval(executeNextMove, speed);
  };

  const handleStop = () => {
    stopAutoSolve();
    setStatus({ text: 'Parado', type: 'info' });
    setTimeout(() => setStatus({ text: '', type: 'info' }), 1500);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isAutoSolving && !isPaused) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
      const executeNextMove = () => {
        if (currentMoveIndexRef.current >= solutionMovesRef.current.length) {
          stopAutoSolve();
          setStatus({ text: 'Resolvido!', type: 'success' });
          return;
        }

        const move = solutionMovesRef.current[currentMoveIndexRef.current];
        executeMove(move, false);
        currentMoveIndexRef.current++;

        if (currentMoveIndexRef.current >= solutionMovesRef.current.length) {
          stopAutoSolve();
          setStatus({ text: 'Resolvido!', type: 'success' });
        }
      };
      intervalRef.current = window.setInterval(executeNextMove, newSpeed);
    }
  };

  const validDestinations = useMemo(() => {
    if (selectedPeg === null) return [];
    const destinations: PegId[] = [];
    (['A', 'B', 'C'] as PegId[]).forEach((pegId) => {
      if (pegId !== selectedPeg && isValidMove(state, selectedPeg, pegId)) {
        destinations.push(pegId);
      }
    });
    return destinations;
  }, [selectedPeg, state]);

  return (
    <div className="app">
      <div className="app-header">
        <h1>Torre de Hanói</h1>
        <p>Mova todos os discos do pino A para o pino C</p>
      </div>

      <div className="config-section">
        <div className="config-group">
          <label htmlFor="numDisks">Discos:</label>
          <select
            id="numDisks"
            value={numDisks}
            onChange={(e) => setNumDisks(Number(e.target.value))}
            disabled={isAutoSolving}
          >
            {[3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="status-bar">
        {status.text && (
          <div className={`status-message ${status.type}`}>{status.text}</div>
        )}
        {selectedPeg && validDestinations.length > 0 && (
          <div className="status-message info" style={{ marginTop: '10px' }}>
            Destinos válidos: {validDestinations.join(', ')}
          </div>
        )}
      </div>

      <div className="moves-counter">
        <span>Movimentos: {movesCount}</span>
      </div>

      <Board
        state={state}
        selectedPeg={selectedPeg}
        onPegClick={handlePegClick}
        numDisks={numDisks}
        disabled={isAutoSolving}
      />

      <Controls
        onReset={handleReset}
        onUndo={handleUndo}
        onAutoSolve={handleAutoSolve}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        canUndo={historyRef.current.length > 0}
        isAutoSolving={isAutoSolving}
        isPaused={isPaused}
        speed={speed}
        onSpeedChange={handleSpeedChange}
      />

      <History moves={moves} />
    </div>
  );
}

export default App;

