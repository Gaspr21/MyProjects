interface Cell {
  x: number;
  y: number;
  state: "wall" | "path" | "visited" | "solution";
}