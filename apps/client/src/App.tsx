
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import React, { Suspense } from "react";
import LoadingSpinner from "./helpers/LoadingSpinner"; // The spinner component

const HomePage = React.lazy(() => import("./pages/HomePage")); // Lazy load the HomePage

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Add more routes as needed */}
          </Routes>
        </Suspense>
        <Footer />
      </Router>
    </>
  );
}

export default App;
