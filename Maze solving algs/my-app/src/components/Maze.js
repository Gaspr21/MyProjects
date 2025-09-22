import { useState, useEffect, useRef } from "react";

function updateCells(prev, step) {
  if (!prev.length) return prev;

  const { x, y, state } = step;
  if (x === undefined || y === undefined) return prev;

  // deep copy grid to trigger React re-render
  const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
  newGrid[y][x].state = state;
  return newGrid;
}

function Maze() {
  const [cells, setCells] = useState([]);
  const [solved, setSolved] = useState(false);
  const wsRef = useRef(null);

  const fetchMaze = () => {
    fetch("/maze")
      .then(res => res.json())
      .then(data => {
        const mazeWithCoords = data.map((row, y) =>
          row.map((cell, x) => ({ ...cell, x, y }))
        );
        setCells(mazeWithCoords);
        setSolved(false);
      });
  };

  useEffect(() => {
    fetchMaze();

    if (!wsRef.current) {
      const ws = new WebSocket("ws://localhost:8080/solve");

      ws.onopen = () => console.log("WebSocket connected");

      ws.onmessage = (e) => {
        const step = JSON.parse(e.data);

        if (step.status === "done") {
          setSolved(true);
          return;
        }

        setCells(prev => updateCells(prev, step));
      };

      ws.onerror = (err) => console.error("WebSocket error:", err);

      ws.onclose = () => {
        console.log("WebSocket closed, will reconnect in 1s");
        setTimeout(() => {
          wsRef.current = null;
        }, 1000);
      };

      wsRef.current = ws;
    }
  }, []);

  const startSolving = () => {
    if (!cells.length) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send("start");
      console.log("Start message sent");
    } else {
      console.log("WebSocket not open yet");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={fetchMaze} style={{ marginRight: "10px" }}>New Maze</button>
        <button onClick={startSolving}>Start Solving</button>
      </div>

      {solved && (
        <div style={{ marginBottom: "10px", color: "green", fontWeight: "bold" }}>
          Maze Solved 🎉
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${cells.length}, 20px)`,
          gridTemplateColumns: `repeat(${cells[0]?.length || 0}, 20px)`,
          gap: "1px"
        }}
      >
        {cells.flat().map(c => (
          <div
            key={`${c.x}-${c.y}`}
            style={{
              width: "20px",
              height: "20px",
              backgroundColor:
                c.state === "wall"
                  ? "black"
                  : c.state === "visited"
                    ? "lightblue"
                    : c.state === "solution"
                      ? "green"
                      : "white",
              border: "1px solid #ccc"
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default Maze;
