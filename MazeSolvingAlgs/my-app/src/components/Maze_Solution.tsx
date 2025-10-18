import React from "react";

function MazeSolution({ cells } : { cells: Cell[][] }) {
  // if(!cells[0]){
  //   throw new Error("This is breaking")
  //   return
  // }

  return (
    <>
      {cells.flat().map(cell => (
        <div
          key={`${cell.x}-${cell.y}`}
          style={{
            width: "10px",
            height: "10px",
            backgroundColor:
              cell.state === "wall"
                ? "black"
                : cell.state === "visited"
                  ? "lightblue"
                  : cell.state === "solution"
                    ? "#299900ff"
                    : "#636363ff",
            border:
              cell.state === "visited"
                ? "lightblue"
                : cell.state === "solution"
                  ? "#299900ff"
                  : "#636363ff",
            borderRadius:
              cell.state === "solution"
                ? "15px"
                : "0px",
          }}
        />
      ))}
    </>
  )
}

export default MazeSolution