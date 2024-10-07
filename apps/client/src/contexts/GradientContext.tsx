// GradientContext.tsx
import React, { createContext, useContext, useState } from "react";

const gradients = [
  "linear-gradient(to bottom, #3498db, #2ecc71)",
  "linear-gradient(to bottom, #e74c3c, #f39c12)",
  "linear-gradient(to bottom, #9b59b6, #34495e)",
  "linear-gradient(to bottom, #1abc9c, #16a085)",
];

type GradientContextType = {
  gradientIndex: number;
  toggleGradient: () => void;
  currentGradient: string;
};

const GradientContext = createContext<GradientContextType | undefined>(
  undefined
);

export const GradientProvider: React.FC = ({ children }) => {
  const [gradientIndex, setGradientIndex] = useState(0);

  const toggleGradient = () => {
    setGradientIndex((prevIndex) => (prevIndex + 1) % gradients.length);
  };

  const value = {
    gradientIndex,
    toggleGradient,
    currentGradient: gradients[gradientIndex],
  };

  return (
    <GradientContext.Provider value={value}>
      {children}
    </GradientContext.Provider>
  );
};

export const useGradient = () => {
  const context = useContext(GradientContext);
  if (context === undefined) {
    throw new Error("useGradient must be used within a GradientProvider");
  }
  return context;
};
