import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ServicePage from "./pages/ServicePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/services" element={<ServicePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;