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
        {/* Main pages */}
        <Route path={PATHS.MAZE} element={<Maze />} />
        <Route path={PATHS.ERROR} element={<ErrorPrompt message="An error occurred" />} />

        {/* 404 page */}
        <Route path={PATHS.PNF} element={<h2>404 - Page Not Found</h2>} />

        {/* Catch-all route for unknown URLs */}
        <Route path="*" element={<Navigate to={PATHS.PNF} replace />} />
      </Routes>
    </ErrorBoundaryWithRouter>
  );
}

export default AppRoutes;
