import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { DialogContent, DialogHeader, DialogTitle } from "./shadcn/ui/dialog";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { passwordStrength } from "../utils/passwordUtils";
import { useToast } from "./shadcn/ui/use-toast";
import { updatePassword } from "../services/MindsMeshAPI";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";

type ChangePasswordFormProps = {
  userId: string;
  onClose: () => void;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  userId,
  onClose,
}) => {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { control, handleSubmit, watch } = useForm<PasswordFormData>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const newPassword = watch("newPassword");

  const handleChangePassword = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update the API call to include currentPassword
      await updatePassword(userId, data.newPassword, data.currentPassword);
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
        variant: "success",
      });
      onClose();
    } catch (err) {
      console.error("Failed to change password:", err);
      toast({
        title: "Update Failed",
        description:
          "There was an issue changing your password. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent className="max-w-md w-full p-6">
      <DialogHeader>
        <DialogTitle>Change Password</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(handleChangePassword)} className="space-y-6">
        {/* Current Password Field */}
        <div>
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Controller
              name="currentPassword"
              control={control}
              rules={{ required: "Current password is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  className="w-full"
                />
              )}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        {/* New Password Field */}
        <div>
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Controller
              name="newPassword"
              control={control}
              rules={{ required: "Password is required", minLength: 8 }}
              render={({ field }) => (
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full"
                />
              )}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-sm font-medium mt-1">
            Password Strength: {passwordStrength(newPassword)}
          </p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Controller
              name="confirmPassword"
              control={control}
              rules={{ required: "Password confirmation is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full"
                />
              )}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button type="button" onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Change Password
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default ChangePasswordForm;
