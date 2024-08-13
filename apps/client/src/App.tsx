import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./components/LoginForm";
import RegisterPage from "./components/RegisterForm";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Router>
      <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Add more routes as needed */}
        </Routes>
      <Footer />
      </Router>
    </>
  );
}

export default App;
