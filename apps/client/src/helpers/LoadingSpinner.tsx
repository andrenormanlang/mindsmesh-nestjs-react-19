import { Spinner } from "../../@/components/ui/spinner";

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <Spinner size="large" className="text-teal-500" />
    </div>
  );
};

export default LoadingSpinner;