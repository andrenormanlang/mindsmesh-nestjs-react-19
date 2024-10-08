import React, { createContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

const gradients = [
  "linear-gradient(135deg, #00b4d8 0%, #0077b6 50%, #023e8a 100%)",
  "linear-gradient(45deg, #8338ec 0%, #3a86ff 50%, #5390d9 100%)",
  "linear-gradient(to right, #ff006e 0%, #fb5607 50%, #ffbe0b 100%)",
  "radial-gradient(circle, #06d6a0 0%, #1b9aaa 50%, #127475 100%)",
  "linear-gradient(to bottom right, #ff9e00 0%, #ff0000 50%, #7a00ff 100%)",
  "linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(253,29,29,0.8) 50%, rgba(252,176,69,1) 100%)"
];


type GradientContextType = {
  toggleGradient: () => void;
  currentGradientIndex: number;
};

export const GradientContext = createContext<GradientContextType | undefined>(undefined);

type GradientProviderProps = {
  children: ReactNode;
};

export const GradientProvider: React.FC<GradientProviderProps> = ({ children }) => {
  const [gradientIndex, setGradientIndex] = useState(0);

  const toggleGradient = () => {
    setGradientIndex((prevIndex) => (prevIndex + 1) % gradients.length);
  };

  const value = {
    toggleGradient,
    currentGradientIndex: gradientIndex,
  };

  return (
    <GradientContext.Provider value={value}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
        <AnimatePresence>
          <motion.div
            key={gradientIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{
              background: gradients[gradientIndex],
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </AnimatePresence>
      </div>
      <div style={{ position: "relative", minHeight: "100vh", width: "100%" }}>
        {children}
      </div>
    </GradientContext.Provider>
  );
};

