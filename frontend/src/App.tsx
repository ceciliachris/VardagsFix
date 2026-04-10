import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ServicesPage from "./pages/ServicePage";
import CreateServicePage from "./pages/CreateServicePage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <ServicesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/services/create"
          element={
            <ProtectedRoute>
              <CreateServicePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;