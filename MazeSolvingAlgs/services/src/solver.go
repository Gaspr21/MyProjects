package main

// solver.go

import (
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
)

type Pos struct{ X, Y int }

// ---------- Shared helpers ----------
func sendStep(conn *websocket.Conn, x, y int, state string) {
	step := map[string]interface{}{
		"x":     x,
		"y":     y,
		"state": state,
	}
	data, _ := json.Marshal(step)
	conn.WriteMessage(websocket.TextMessage, data)
	time.Sleep(30 * time.Millisecond)
}

func reconstructPath(conn *websocket.Conn, end Pos, prev map[Pos]Pos) {
	pathPos := end
	for {
		sendStep(conn, pathPos.X, pathPos.Y, "solution")
		if pathPos == (Pos{1, 1}) {
			break
		}
		pathPos = prev[pathPos]
	}

	doneMsg := map[string]string{"status": "done"}
	data, _ := json.Marshal(doneMsg)
	conn.WriteMessage(websocket.TextMessage, data)
}

// ---------- BFS ----------
func SolveMazeBFS(maze [][]Cell, conn *websocket.Conn) {
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

		sendStep(conn, current.X, current.Y, "visited")

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

	reconstructPath(conn, end, prev)
}

// ---------- DFS ----------
func SolveMazeDFS(maze [][]Cell, conn *websocket.Conn) {
	visited := make([][]bool, len(maze))
	for i := range visited {
		visited[i] = make([]bool, len(maze[0]))
	}

	stack := []Pos{{1, 1}}
	prev := make(map[Pos]Pos)
	visited[1][1] = true

	dirs := []Pos{{0, -1}, {1, 0}, {0, 1}, {-1, 0}}
	end := Pos{X: len(maze[0]) - 2, Y: len(maze) - 2}

	for len(stack) > 0 {
		current := stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		sendStep(conn, current.X, current.Y, "visited")

		if current == end {
			break
		}

		for _, d := range dirs {
			nx, ny := current.X+d.X, current.Y+d.Y
			if nx > 0 && nx < len(maze[0])-1 && ny > 0 && ny < len(maze)-1 &&
				maze[ny][nx].State == "path" && !visited[ny][nx] {
				visited[ny][nx] = true
				stack = append(stack, Pos{nx, ny})
				prev[Pos{nx, ny}] = current
			}
		}
	}

	reconstructPath(conn, end, prev)
}

// ---------- Hand-on-wall rule (Left-hand) ----------
func SolveMazeWallFollower(maze [][]Cell, conn *websocket.Conn) {
	// Directions: N, E, S, W
	dirs := []Pos{{0, -1}, {1, 0}, {0, 1}, {-1, 0}}
	dir := 1 // start facing East (right)

	start := Pos{1, 1}
	end := Pos{X: len(maze[0]) - 2, Y: len(maze) - 2}

	current := start
	prev := make(map[Pos]Pos)
	visited := make(map[Pos]bool)

	for {
		sendStep(conn, current.X, current.Y, "visited")
		visited[current] = true

		if current == end {
			break
		}

		// Try left, straight, right, then back
		turned := false
		for i := -1; i <= 2; i++ {
			ndir := (dir + i + 4) % 4
			nx, ny := current.X+dirs[ndir].X, current.Y+dirs[ndir].Y
			if nx > 0 && nx < len(maze[0])-1 && ny > 0 && ny < len(maze)-1 &&
				maze[ny][nx].State == "path" {
				prev[Pos{nx, ny}] = current
				current = Pos{nx, ny}
				dir = ndir
				turned = true
				break
			}
		}
		if !turned {
			break
		}
		time.Sleep(30 * time.Millisecond)
	}

	// Reconstruct solution path
	reconstructPath(conn, end, prev)
}
