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

		if string(msg) == "start_bfs" {
			if currentMaze == nil {
				currentMaze = buildMaze(51, 51)
			}
			go SolveMazeBFS(currentMaze, conn)
		} else if string(msg) == "start_dfs" {
			if currentMaze == nil {
				currentMaze = buildMaze(51, 51)
			}
			go SolveMazeDFS(currentMaze, conn)
		} else if string(msg) == "start_lhw" {
			if currentMaze == nil {
				currentMaze = buildMaze(51, 51)
			}
			go SolveMazeWallFollower(currentMaze, conn)
		}
	}
}

// ---------- HTTP handler ----------
func generateMaze(w http.ResponseWriter, r *http.Request) {
	currentMaze = buildMaze(51, 51)
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
