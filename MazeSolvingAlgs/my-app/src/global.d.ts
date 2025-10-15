interface Cell {
  x: number;
  y: number;
  state: "wall" | "path" | "visited" | "solution";
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly REACT_APP_API_URL: string;
  }
}  
