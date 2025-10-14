import React from "react";
import AppRoutes from "../Routing/AppRoutes.js";
import Maze from "../components/Maze.tsx";
import '../style/App.css'
import { BrowserRouter as Router } from "react-router-dom";


function App() {

    return (
        <div className="App">
            {/* <Router>
                <AppRoutes />
            </Router> */}
            <Maze/>
        </div>
    )
}

export default App;