import { useState } from "react";
import { Button } from "./shadcn/ui/button";
import { Card, CardContent } from "./shadcn/ui/card";
import { Input } from "./shadcn/ui/input";
import { useNavigate } from "react-router-dom";
import {
  login,
  requestPasswordReset,
} from "../services/MindsMeshAPI";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./shadcn/ui/dialog";
import { useToast } from "./shadcn/ui/use-toast";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast(); 

  const handleLogin = async () => {
    try {
      const user = await login(email, password);
      if (user) {
        toast({
          title: "Login Successful",
          description: "Welcome back! You have logged in successfully.",
          duration: 4000,
          variant: "success",
        });
        navigate("/"); 
        setTimeout(() => {
          window.location.reload();
        }, 2000); 
    
      }
    } catch (err) {
      setError("Login failed. Please check your email and password.");
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Login error:", err);
    }
  };

  const handlePasswordResetRequest = async () => {
    try {
      await requestPasswordReset(resetEmail);
      setResetSuccess(true);
      toast({
        title: "Reset Link Sent",
        description: "Check your email for the password reset link.",
        duration: 4000,
      });
    } catch (err) {
      setResetError("Failed to request password reset. Please try again.");
      toast({
        title: "Reset Request Failed",
        description: "Could not send password reset link. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
      console.error("Password reset request error:", err);
    }
  };

  
  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-sm p-4">
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
                <Button variant="link" className="text-blue-600 w-full">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;