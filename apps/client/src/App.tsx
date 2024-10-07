import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import React, { Suspense } from "react";
import LoadingSpinner from "./helpers/LoadingSpinner"; // The spinner component
import ErrorBoundary from "./helpers/ErrorBoundary"; // Assume you create an error boundary component
import { UserProvider } from "./contexts/UserContext"; // Import UserProvider

const HomePage = React.lazy(() => import("./pages/HomePage")); // Lazy load the HomePage

function App() {
  return (
    <>
      <Router>
        <UserProvider> {/* Wrap entire app in UserProvider */}
          <Navbar />
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                {/* Add more routes as needed */}
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <Footer />
        </UserProvider>
      </Router>
    </>
  );
}

export default App;
