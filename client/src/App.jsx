import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardHeader from "./components/DashboardHeader";
import Dashboard from "./pages/Dashboard";
import Viewer from "./pages/Viewer";
import PublicSignPage from "./pages/PublicSignPage";

function App() {
  return (
    <BrowserRouter>
      <DashboardHeader />

      <Routes>
        <Route path="/" element={<Dashboard />} />

        {/* Public signing page */}
        <Route path="/sign/:token" element={<PublicSignPage />} />

        {/* PDF viewer */}
        <Route path="/viewer/:id" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;