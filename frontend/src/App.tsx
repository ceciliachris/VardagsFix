import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ServicesPage from "./pages/ServicePage";
import CreateServicePage from "./pages/CreateServicePage";
import ProtectedRoute from "./components/ProtectedRoute";
import MyServicesPage from "./pages/MyServicesPage";
import EditServicePage from "./pages/EditServicePage";
import CreateBookingPage from "./pages/CreateBookingPage";

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

        <Route
          path="/services/my"
          element={
            <ProtectedRoute>
              <MyServicesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/services/edit/:id"
          element={
            <ProtectedRoute>
              <EditServicePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/create/:id"
          element={
            <ProtectedRoute>
              <CreateBookingPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;