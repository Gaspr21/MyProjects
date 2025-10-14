import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Maze from "../components/Maze.tsx";
import ErrorBoundaryWithRouter from "../ErrorBoundry.tsx";
import ErrorPrompt from "../ErrorPrompt.tsx";
import { PATHS } from "./paths.tsx";

function AppRoutes() {
  return (

    <ErrorBoundaryWithRouter>
      <Routes>
        <Route path='/' element={<Maze />} />
        <Route path={PATHS.ERROR} element={<ErrorPrompt message="An error occurred" />} />
        <Route path={PATHS.PNF} element={<h2>404 - Page Not Found</h2>} />

        <Route
          path="*"
          element={
            window.location.pathname !== PATHS.PNF ? (
              <Navigate to={PATHS.PNF} replace />
            ) : (
              <h2>404 - Page Not Found</h2>
            )
          }
        />
      </Routes>
    </ErrorBoundaryWithRouter>
  );
}

export default AppRoutes;
