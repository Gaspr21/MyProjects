import React from "react";

function MazeSolution({ cells }) {


  return (
    <>
      {cells.flat().map(c => (
        <div
          key={`${c.x}-${c.y}`}
          style={{
            width: "10px",
            height: "10px",
            backgroundColor:
              c.state === "wall"
                ? "black"
                : c.state === "visited"
                  ? "lightblue"
                  : c.state === "solution"
                    ? "#299900ff"
                    : "#636363ff",
            border:
              c.state === "visited"
                ? "lightblue"
                : c.state === "solution"
                  ? "#299900ff"
                  : "#636363ff",
            borderRadius:
              c.state === "solution"
                ? "15px"
                : "0px",
          }}
        />
      ))}
    </>
  )
}

export default MazeSolution