import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/shadcn/ui/button";
import { Input } from "../components/shadcn/ui/input";
import { Label } from "../components/shadcn/ui/label";
import { CheckPasswordStrength } from "../helpers/CheckPasswordStrength";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";
import { resetPassword } from "../services/MindsMeshAPI";
import { useToast } from "../components/shadcn/ui/use-toast";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handlePasswordReset = async () => {
    const token = searchParams.get("token");
    console.log("Extracted Token:", token); 

    if (!token) {
      setMessage("Invalid or missing token.");
      return;
    }

    try {
      await resetPassword(token, newPassword);
      toast({
        title: "Password Reset Successful",
        description: "Password has been reset successfully. Please login with your new password.",
        duration: 4000,
        variant: "success",
      });
      navigate("/");
    } catch (err) {
      console.error("Failed to reset password:", err);
      setMessage("Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-200 to-blue-500">
      <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Reset Password
        </h2>
        <div className="space-y-4">
          {/* Password Field */}
          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </Label>
            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
          </div>

          {/* Password Strength Checker */}
          <CheckPasswordStrength password={newPassword} />

          {/* Confirm Password Field */}
          <div>
            <Label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </Label>
            <div className="relative mt-1">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
          </div>

          {/* Reset Password Button */}
          <div>
            {message && (
              <p className="text-center text-red-500 font-medium">{message}</p>
            )}
            <Button
              type="button"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handlePasswordReset}
            >
              Reset Password
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
