import { useContext } from "react";
import { GradientContext } from "../contexts/GradientContext";

export const useGradient = () => {
  const context = useContext(GradientContext);
  if (context === undefined) {
    throw new Error("useGradient must be used within a GradientProvider");
  }
  return context;
};
