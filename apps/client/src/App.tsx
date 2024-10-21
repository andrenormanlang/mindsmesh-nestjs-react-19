import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import React, { Suspense } from "react";
import LoadingSpinner from "./helpers/LoadingSpinner";
import { UserProvider } from "./contexts/UserContext";
import { GradientProvider } from "./contexts/GradientContext";
import "./App.css";
import { Toaster } from "./components/shadcn/ui/toaster";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ProtectedRoute from "./helpers/ProtectedRoute";
import SkillsManagement from "./components/SkillsManagement";

const HomePage = React.lazy(() => import("./pages/HomePage")); // Lazy load the HomePage

function App() {
  return (
    <>
      <Toaster />
      <Router>
        <UserProvider>
          <GradientProvider>
            <Navbar />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/verify-email"
                  element={<EmailVerificationPage />}
                />
                <Route
                  path="/skills-management"
                  element={
                    <ProtectedRoute>
                      <SkillsManagement />
                    </ProtectedRoute>
                  }
                />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Routes>
            </Suspense>
            <Footer />
          </GradientProvider>
        </UserProvider>
      </Router>
    </>
  );
}

export default App;
