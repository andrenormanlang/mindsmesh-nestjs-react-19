import { useState } from "react";
import { Button } from "../../@/components/ui/button";
import { Card, CardHeader, CardContent } from "../../@/components/ui/card";
import { Input } from "../../@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  login,
  requestPasswordReset,
  resetPassword,
} from "../services/MindsMeshAPI";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../@/components/ui/dialog";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      if (user) {
        navigate("/"); // Redirect to the home page or profile after login
        window.location.reload(); // Refresh the page to update the user state in Navbar
      }
    } catch (err) {
      setError("Login failed. Please check your email and password.");
      console.error("Login error:", err);
    }
  };

  const handlePasswordResetRequest = async () => {
    try {
      await requestPasswordReset(resetEmail);
      setResetSuccess(true);
    } catch (err) {
      setResetError("Failed to request password reset. Please try again.");
      console.error("Password reset request error:", err);
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(resetToken, newPassword);
      alert("Password reset successfully!");
      window.location.reload();
    } catch (err) {
      setResetError("Failed to reset password. Please try again.");
      console.error("Password reset error:", err);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100">
      <Card className="w-full max-w-sm p-4">
        <CardHeader>
          <h2 className="text-2xl font-semibold text-center">Login</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
            {error && <p className="text-red-500 text-center">{error}</p>}
            <Button className="w-full" onClick={handleLogin}>
              Login
            </Button>
            {/* Forgot Password Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-blue-600">
                  Forgot Password?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Forgot Password</DialogTitle>
                </DialogHeader>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full mt-4"
                />
                <Button
                  className="mt-4 w-full"
                  onClick={handlePasswordResetRequest}
                >
                  Request Password Reset
                </Button>
                {resetError && (
                  <p className="text-red-500 text-center">{resetError}</p>
                )}
                {resetSuccess && (
                  <p className="text-green-500 text-center">
                    Check your email for reset link.
                  </p>
                )}
              </DialogContent>
            </Dialog>
            {/* Reset Password Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-blue-600">
                  Reset Password?
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                </DialogHeader>
                <Input
                  type="text"
                  placeholder="Reset Token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full mt-4"
                />
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-4"
                />
                <Button className="mt-4 w-full" onClick={handleResetPassword}>
                  Reset Password
                </Button>
                {resetError && (
                  <p className="text-red-500 text-center">{resetError}</p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
