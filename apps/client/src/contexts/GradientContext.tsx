import React, { createContext, useState, ReactNode, useEffect } from "react";

const gradients = ["gradient-1", "gradient-2", "gradient-3", "gradient-4"];
type GradientContextType = {
  toggleGradient: () => void;
  currentGradientClass: string;
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

  const currentGradientClass = gradients[gradientIndex];

  // Effect to apply the current gradient class to the body element
  useEffect(() => {
    // Remove any previously applied gradient classes
    document.body.classList.remove(...gradients);
    
    // Add the current gradient class
    document.body.classList.add(currentGradientClass);
  }, [currentGradientClass]);
  
  const value = {
    toggleGradient,
    currentGradientClass,
  };

  return (
    <GradientContext.Provider value={value}>
      {children}
    </GradientContext.Provider>
  );
};
