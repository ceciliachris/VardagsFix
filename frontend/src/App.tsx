import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ServicesPage from "./pages/ServicePage";
import CreateServicePage from "./pages/CreateServicePage";
import ProtectedRoute from "./components/ProtectedRoute";
import MyServicesPage from "./pages/MyServicesPage";
import EditServicePage from "./pages/EditServicePage";
import CreateBookingPage from "./pages/CreateBookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* PROTECTED ROUTES MED LAYOUT */}

        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Layout>
                <ServicesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/services/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateServicePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/services/my"
          element={
            <ProtectedRoute>
              <Layout>
                <MyServicesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/services/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditServicePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/create/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateBookingPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bookings/my"
          element={
            <ProtectedRoute>
              <Layout>
                <MyBookingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;