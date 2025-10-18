import { useState, useEffect, useRef } from "react";
import MazeSolution from "./Maze_Solution.tsx";

function updateCells(prev: Cell[][], step: any) {
  if (!prev.length) return prev;

  const { x, y, state } = step;
  if (x === undefined || y === undefined) return prev;

  const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
  newGrid[y][x].state = state;
  return newGrid;
}

declare var process: {
  env: {
    REACT_APP_API_URL: string;
  };
};

function Maze() {
  const [cells, setCells] = useState<Cell[][]>([]);
  const [solved, setSolved] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const originalMazeRef = useRef<Cell[][]>([]);

  const apiUrl ="http://localhost:8080";
//  process.env.REACT_APP_API_URL || "http://localhost:8080"

  const fetchMaze = async () => {
    try {
      const res = await fetch(`${apiUrl}/maze`)
      const data = await res.json()

      const mazeWithCoords = data.map((row: any[], y: number) =>
        row.map((cell, x) => ({ ...cell, x, y }))
      );

      setCells(mazeWithCoords);
      originalMazeRef.current = mazeWithCoords.map((row: Cell[]) =>
        row.map(cell => ({ ...cell }))
      );
      setSolved(false);
    } catch (err) {
      console.error('Failed to fetch maze:', err)
    }
  };

  useEffect(() => {
    if (!apiUrl) {
      console.error("REACT_APP_API_URL is not defined!");
    }
    fetchMaze();

    if (!wsRef.current) {
      const ws = new WebSocket(`ws://${apiUrl.replace("http://", "")}/solve`);

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
        setTimeout(() => { wsRef.current = null; }, 1000);
      };

      wsRef.current = ws;
    }
  }, []);


  const clearMaze = () => {
    if (!originalMazeRef.current.length) return;

    const restored = originalMazeRef.current.map((row: Cell[]) =>
      row.map(cell => ({ ...cell }))
    );
    setCells(restored);
    setSolved(false);
  };


  const startSolving = (algorithm: String) => {
    if (!cells.length) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {

      if (algorithm === "bfs") {
        wsRef.current.send("start_bfs");
        console.log("Start_bfs message sent");
      }
      if (algorithm === "dfs") {
        wsRef.current.send("start_dfs");
        console.log("Start_dfs message sent");
      }
      if (algorithm === "lhw") {
        wsRef.current.send("start_lhw");
        console.log("Start_lhw message sent");
      }
    } else {
      console.log("WebSocket not open yet");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={fetchMaze} style={{ marginRight: "10px" }}>New Maze</button>
        <button onClick={clearMaze} style={{ marginRight: "10px" }}>Clear Maze</button>
        <p>Solve using selected agorithm. </p>
        <button onClick={() => { startSolving("bfs") }}>BFS</button>
        <button onClick={() => { startSolving("dfs") }}>DFS</button>
        <button onClick={() => { startSolving("lhw") }}>LHW</button>
      </div>

      {solved && (
        <div style={{ marginBottom: "10px", color: "green", fontWeight: "bold" }}>
          Maze Solved !!
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${cells.length}, 10px)`,
          gridTemplateColumns: `repeat(${cells[0]?.length || 0}, 10px)`,
          gap: "1px"
        }}
      >
        <MazeSolution cells={cells} />
      </div>
    </div>
  );
}

export default Maze;
