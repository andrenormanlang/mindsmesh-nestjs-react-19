import { useActionState } from "react"; // Hypothetical import for React 19 feature
import { Button } from "./shadcn/ui/button";
import { Card, CardContent } from "./shadcn/ui/card";
import { Input } from "./shadcn/ui/input";
import { useNavigate } from "react-router-dom";
import {
  login,
  requestPasswordReset,
  resendVerificationEmail,
} from "../services/MindsMeshAPI";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./shadcn/ui/dialog";
import { useToast } from "./shadcn/ui/use-toast";
import axios from "axios";

function LoginForm() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Main Login Handler
  const loginHandler = async (_: unknown, formData: FormData) => {
    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;

    if (!email || !password) {
      return "Please fill out both email and password.";
    }

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
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (
          err.response &&
          err.response.status === 401 &&
          err.response.data?.message?.includes("Email not verified")
        ) {
          return "Email not verified. Please check your email to verify your account.";
        } else {
          return "Login failed. Please check your email and password.";
        }
      } else {
        return "An unexpected error occurred. Please try again.";
      }
    }
  };

  const [loginError, loginAction, loginPending] = useActionState(loginHandler, null);

  // Resend Verification Email Handler
  const resendHandler = async (_: unknown, formData: FormData) => {
    const email = formData.get("resendEmail") as string | null;
    if (!email) {
      return "Please enter your email.";
    }

    try {
      await resendVerificationEmail(email);
      toast({
        title: "Verification Email Sent",
        description: "Please check your email.",
        variant: "success",
        duration: 5000,
      });
    } catch (err) {
      console.error("Error resending verification email:", err);
      return "Failed to resend verification email. Please try again later.";
    }
  };

  const [resendError, resendAction, resendPending] = useActionState(resendHandler, null);

  // Password Reset Handler
  const resetHandler = async (_: unknown, formData: FormData) => {
    const resetEmail = formData.get("resetEmail") as string | null;
    if (!resetEmail) {
      return "Please enter your email to reset your password.";
    }

    try {
      await requestPasswordReset(resetEmail);
      toast({
        title: "Reset Link Sent",
        description: "Check your email for the password reset link.",
        duration: 4000,
      });
    } catch (err) {
      console.error("Password reset request error:", err);
      return "Failed to request password reset. Please try again.";
    }
  };

  const [resetError, resetAction, resetPending] = useActionState(resetHandler, null);

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-sm p-4">
        <CardContent className="space-y-4">
          {/* Main Login Form */}
          <form action={loginAction} method="post" className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              name="email"
              autoComplete="username"
              disabled={loginPending}
              className="w-full"
            />
            <Input
              type="password"
              placeholder="Password"
              name="password"
              autoComplete="current-password"
              disabled={loginPending}
              className="w-full"
            />

            {loginError && (
              <p className="text-red-500 text-center">{loginError}</p>
            )}

            <Button className="w-full" type="submit" disabled={loginPending}>
              {loginPending ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* If the user is not verified */}
          {loginError && loginError.includes("Email not verified") && (
            <div className="text-center space-y-2">
              <p className="text-gray-600">Didn't receive the email?</p>
              <form action={resendAction} method="post" className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  name="resendEmail"
                  disabled={resendPending}
                />
                {resendError && (
                  <p className="text-red-500 text-center">{resendError}</p>
                )}
                <Button
                  variant="link"
                  className="text-blue-600"
                  type="submit"
                  disabled={resendPending}
                >
                  {resendPending ? "Resending..." : "Resend Verification Email"}
                </Button>
              </form>
            </div>
          )}

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
              <form action={resetAction} method="post" className="space-y-4 mt-4">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  name="resetEmail"
                  disabled={resetPending}
                  className="w-full"
                />
                {resetError && (
                  <p className="text-red-500 text-center">{resetError}</p>
                )}
                <Button
                  className="w-full"
                  type="submit"
                  disabled={resetPending}
                >
                  {resetPending ? "Requesting..." : "Request Password Reset"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginForm;
