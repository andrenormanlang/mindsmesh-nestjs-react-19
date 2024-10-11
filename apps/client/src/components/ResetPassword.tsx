import { useState } from "react";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/MindsMeshAPI";
import { useToast } from "./shadcn/ui/use-toast";

const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleResetPassword = async () => {
    const token = searchParams.get("token");
    console.log("Extracted Token:", token); // Check what is being extracted
  
    if (!token) {
      setMessage("Invalid or missing token.");
      return;
    }
  
    try {
      await resetPassword(token, newPassword);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully.",
        duration: 4000,
        variant: "success",
      });
      navigate("/login");
    } catch (err) {
      console.error("Failed to reset password:", err);
      setMessage("Failed to reset password.");
    }
  };
  

  return (
    <div className="flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-sm p-4">
        <h2 className="text-2xl font-semibold text-center">Reset Password</h2>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full"
          />
          {message && <p className="text-center text-green-500">{message}</p>}
          <Button onClick={handleResetPassword} className="w-full">
            Reset Password
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
