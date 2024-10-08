import { useState } from "react";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { sendPasswordResetEmail } from "../services/MindsMeshAPI";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(email);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      setMessage("Failed to send password reset email.");
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-sm p-4">
        <h2 className="text-2xl font-semibold text-center">Forgot Password</h2>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
          {message && <p className="text-center text-green-500">{message}</p>}
          <Button onClick={handleForgotPassword} className="w-full">
            Send Reset Link
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
