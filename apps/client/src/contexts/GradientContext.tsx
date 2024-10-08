import React, { createContext, useState, ReactNode } from "react";
import { motion } from "framer-motion";

const gradients = [
  "linear-gradient(to bottom, #005f73, #0a9396)",
  "linear-gradient(to bottom, #3a0ca3, #f72585)",
  "linear-gradient(to bottom, #ff7f11, #ff206e)",
  "linear-gradient(to bottom, #4361ee, #4cc9f0)"
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
      {/* Framer Motion wrapper for smooth transitions */}
      <motion.div
        initial={{ background: gradients[gradientIndex] }}
        animate={{ background: gradients[gradientIndex] }}
        transition={{ duration: 1, ease: "easeInOut" }}
        style={{ minHeight: "100vh", width: "100%" }}
      >
        {children}
      </motion.div>
    </GradientContext.Provider>
  );
};
