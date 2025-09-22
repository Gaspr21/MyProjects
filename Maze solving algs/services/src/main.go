package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
)

type Cell struct {
	X, Y  int    `json:"x"`
	State string `json:"state"` // "wall", "path", "visited", "solution"
}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var currentMaze [][]Cell

// ---------- Maze generation ----------
func buildMaze(width, height int) [][]Cell {
	maze := make([][]Cell, height)
	for y := 0; y < height; y++ {
		row := make([]Cell, width)
		for x := 0; x < width; x++ {
			row[x] = Cell{X: x, Y: y, State: "wall"}
		}
		maze[y] = row
	}

	var carve func(x, y int)
	carve = func(x, y int) {
		dirs := []struct{ dx, dy int }{{0, -2}, {2, 0}, {0, 2}, {-2, 0}}
		rand.Shuffle(len(dirs), func(i, j int) { dirs[i], dirs[j] = dirs[j], dirs[i] })
		for _, d := range dirs {
			nx, ny := x+d.dx, y+d.dy
			if nx > 0 && nx < width-1 && ny > 0 && ny < height-1 && maze[ny][nx].State == "wall" {
				maze[ny][nx].State = "path"
				maze[y+d.dy/2][x+d.dx/2].State = "path"
				carve(nx, ny)
			}
		}
	}

	maze[1][1].State = "path"
	carve(1, 1)
	return maze
}

// ---------- Maze solving ----------
func solveMaze(maze [][]Cell, conn *websocket.Conn) {
	type Pos struct{ X, Y int }
	visited := make([][]bool, len(maze))
	for i := range visited {
		visited[i] = make([]bool, len(maze[0]))
	}

	queue := []Pos{{1, 1}}
	prev := make(map[Pos]Pos)
	visited[1][1] = true

	dirs := []Pos{{0, -1}, {1, 0}, {0, 1}, {-1, 0}}
	end := Pos{X: len(maze[0]) - 2, Y: len(maze) - 2}

	for len(queue) > 0 {
		current := queue[0]
		queue = queue[1:]

		// Send visited step
		step := map[string]interface{}{
			"x":     current.X,
			"y":     current.Y,
			"state": "visited",
		}
		data, _ := json.Marshal(step)
		conn.WriteMessage(websocket.TextMessage, data)
		time.Sleep(30 * time.Millisecond)

		if current == end {
			break
		}

		for _, d := range dirs {
			nx, ny := current.X+d.X, current.Y+d.Y
			if nx > 0 && nx < len(maze[0])-1 && ny > 0 && ny < len(maze)-1 &&
				maze[ny][nx].State == "path" && !visited[ny][nx] {
				visited[ny][nx] = true
				queue = append(queue, Pos{nx, ny})
				prev[Pos{nx, ny}] = current
			}
		}
	}

	// Reconstruct solution path
	pathPos := end
	for {
		step := map[string]interface{}{
			"x":     pathPos.X,
			"y":     pathPos.Y,
			"state": "solution",
		}
		data, _ := json.Marshal(step)
		conn.WriteMessage(websocket.TextMessage, data)
		time.Sleep(30 * time.Millisecond)

		if pathPos == (Pos{1, 1}) {
			break
		}
		pathPos = prev[pathPos]
	}

	// Send "done" message
	doneMsg := map[string]string{"status": "done"}
	data, _ := json.Marshal(doneMsg)
	conn.WriteMessage(websocket.TextMessage, data)
}

// ---------- WebSocket handler ----------
func websocketHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("WebSocket upgrade error:", err)
		return
	}
	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}
		if string(msg) == "start" {
			if currentMaze == nil {
				currentMaze = buildMaze(21, 21)
			}
			go solveMaze(currentMaze, conn)
		}
	}
}

// ---------- HTTP handler ----------
func generateMaze(w http.ResponseWriter, r *http.Request) {
	currentMaze = buildMaze(21, 21)
	json.NewEncoder(w).Encode(currentMaze)
}

// ---------- Main ----------
func main() {
	rand.Seed(time.Now().UnixNano())
	http.HandleFunc("/maze", generateMaze)
	http.HandleFunc("/solve", websocketHandler)
	fmt.Println("Server running on :8080")
	http.ListenAndServe(":8080", nil)
}
