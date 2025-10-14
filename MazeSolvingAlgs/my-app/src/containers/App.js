import React from "react";
import AppRoutes from "../Routing/AppRoutes.js";
import {BrowserRouter as Router} from "react-router-dom";
import '../style/App.css'

function App() {

    return (
        <div className="App">
            <Router>
                <AppRoutes />
            </Router>
        </div>
    )
}

export default App;