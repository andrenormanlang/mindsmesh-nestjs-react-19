import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ComponentType } from "react";

const SuperWrapper = <P extends object>(WrappedComponent: ComponentType<P>) => {
  return function WithSuper(props: P) {
    const navigate = useNavigate();

    // Example logic: Logging
    useEffect(() => {
      console.log(`Component ${WrappedComponent.name} is rendering...`);
    }, []);

    // Example logic: Checking if user is authenticated
    useEffect(() => {
      const isAuthenticated = localStorage.getItem("token");
      if (!isAuthenticated) {
        console.log("User is not authenticated. Redirecting to login...");
        navigate("/login"); // Redirect to login if user is not authenticated
      }
    }, [navigate]);

    // Render the wrapped component with the props
    return <WrappedComponent {...props} />;
  };
};

export default SuperWrapper;
