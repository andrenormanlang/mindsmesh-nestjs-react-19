import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import React, { Suspense } from "react";
import LoadingSpinner from "./helpers/LoadingSpinner";
import { UserProvider } from "./contexts/UserContext"; 
import { GradientProvider } from "./contexts/GradientContext"; 
import "./App.css";

const HomePage = React.lazy(() => import("./pages/HomePage")); // Lazy load the HomePage

function App() {
  return (
    <>
      <Router>
        <UserProvider> 
          <GradientProvider> 
            <Navbar />
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />                  
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