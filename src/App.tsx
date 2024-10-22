import { ArrowDownUp } from "lucide-react";
import { useState } from "react";

function Square({
  value,
  onSquareClick,
  style,
}: {
  value: string;
  onSquareClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button className="square" onClick={onSquareClick} style={style}>
      {value}
    </button>
  );
}

function Board({
  xIsNext,
  squares,
  onPlay,
}: {
  xIsNext: boolean;
  squares: string[];
  onPlay: (nextSquares: string[]) => void;
}) {
  function handleClick(i: number) {
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const isLastMove = squares.every((square) => square !== null);
  const { winner, line } = calculateWinner(squares);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else {
    if (isLastMove) {
      status = "It's a draw!";
    } else {
      status = "Next player: " + (xIsNext ? "X" : "O");
    }
  }

  const winnerStyle = {
    border: "2px solid #EE5D28",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div className="status">{status}</div>
      <div>
        {[0, 1, 2].map((row) => (
          <div key={row} className="board-row">
            {[0, 1, 2].map((col) => {
              const i = row * 3 + col;
              return (
                <Square
                  key={i}
                  value={squares[i]}
                  onSquareClick={() => handleClick(i)}
                  style={line && line.includes(i) ? winnerStyle : {}}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function getLocation(position: number) {
  return `(${Math.floor(position / 3) + 1}, ${(position % 3) + 1})`;
}

export default function Game() {
  const [history, setHistory] = useState<string[][]>([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [sorted, setSorted] = useState(true);
  const [locations, setLocations] = useState<string[]>([]);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: string[]) {
    if (!currentMove) {
      const position = nextSquares.findIndex((square) => square !== null);
      setLocations([getLocation(position)]);
    } else {
      const differentIndex = nextSquares.findIndex(
        (square, index) => square !== (history[history.length - 1] || [])[index]
      );
      setLocations([...locations, getLocation(differentIndex)]);
    }
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  function handleSort() {
    setSorted(!sorted);
  }

  const moves = history.map((_, move) => {
    const term = `${move} ${(locations && locations[move - 1]) || ""}`;
    let description;
    if (move > 0) {
      description = "Go to move #" + term;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        {move === currentMove ? (
          <b>You are at move #{term}</b>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  return (
    <div className="game">
      <div className="section game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="section game-info">
        <button
          style={{
            background: sorted ? "#FDEFEA" : "#f9f9f9",
            color: sorted ? "#EE5D28" : "#333",
          }}
          onClick={handleSort}
        >
          <ArrowDownUp />
        </button>
        <ol>{sorted ? moves : moves.reverse()}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares: string[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return { winner: null, line: null };
}
