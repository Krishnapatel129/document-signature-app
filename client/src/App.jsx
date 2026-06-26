import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardHeader from "./components/DashboardHeader";
import Dashboard from "./pages/Dashboard";
import Viewer from "./pages/Viewer";
import PublicSignPage from "./pages/PublicSignPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Upload from "./pages/Upload";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
  path="/upload"
  element={
    <ProtectedRoute>
      <DashboardHeader />
      <Upload />
    </ProtectedRoute>
  }
/>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardHeader />
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/viewer/:id"
          element={
            <ProtectedRoute>
              <DashboardHeader />
              <Viewer />
            </ProtectedRoute>
          }
        />

        <Route path="/sign/:token" element={<PublicSignPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;