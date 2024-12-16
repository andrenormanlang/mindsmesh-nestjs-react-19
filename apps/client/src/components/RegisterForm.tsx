// RegisterForm.tsx
import  { useState, useEffect, useActionState } from "react";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { useToast } from "./shadcn/ui/use-toast";
import { register } from "../services/MindsMeshAPI";
import { Card } from "./shadcn/ui/card";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { cn } from "./lib/utils";
import { z } from "zod";
import RegistrationSkillImagesUpload from "./RegistrationSkillImagesUpload";

type RegisterFormProps = {
  onClose: () => void;
};

// Zod schema for form inputs
const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
      "Password must contain at least one number and one special character"
    ),
  role: z.enum(["freelancer", "employer"]),
});

export default function RegisterForm({ onClose }: RegisterFormProps) {
  const { toast } = useToast();

  // States for managing avatar and skill images
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"freelancer" | "employer">("freelancer");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [_avatarFile, setAvatarFile] = useState<File | null>(null);

  // Initialize useActionState
  const [error, submitAction, isPending] = useActionState(submitHandler, null);

  // Action Function
  async function submitHandler(_: unknown, formData: FormData) {
    // Extract form values
    const username = formData.get("username")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";
    const role = (formData.get("role") as "freelancer" | "employer") || "freelancer";
    const avatarFile = formData.get("avatarFile") as File | null;

    // Validate form data
    const result = registerSchema.safeParse({ username, email, password, role });

    if (!result.success) {
      // Extract and return validation errors
      const message = result.error.issues.map((issue) => issue.message).join(" ");
      toast({
        title: "Validation Error",
        description: message,
        variant: "destructive",
        duration: 5000,
      });
      return "Validation failed. Please check your inputs.";
    }

    try {
      // Prepare data for registration
      const { username, email, password, role } = result.data;
      const filesToUpload = role === "freelancer" ? selectedFiles : [];

      // Call the register API
      await register(username, role, password, email, avatarFile, filesToUpload);

      // Success toast
      toast({
        title: "Welcome aboard! 🎉",
        description: "Please check your email to verify your account.",
        variant: "success",
        duration: 5000,
      });

      // Close the form/modal
      onClose();
      return null;
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast({
          title: "Registration Failed",
          description: err.message,
          variant: "destructive",
          duration: 5000,
        });
        return err.message;
      }
      return "An unexpected error occurred.";
    }
  }

  // Handle Role Selection
  const handleRoleSelection = (selectedRole: "freelancer" | "employer") => {
    setRole(selectedRole);
    if (selectedRole === "employer") {
      // Clear freelancer-specific uploads when switching to employer
      // Revoke object URLs
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setSelectedFiles([]);
      setImagePreviews([]);
    }
  };

  // Handle Avatar File Change
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
      "image/svg+xml",
      "image/webp",
      "image/tiff",
      "image/bmp",
      "image/avif",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a supported image format`,
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `${file.name} exceeds 5MB limit`,
        variant: "destructive",
      });
      return;
    }

    // Revoke previous avatar preview if exists
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  // Handle Remove Avatar
  const handleRemoveAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  // Handle Skill Images Upload
  const handleSkillImagesUpload = (files: File[]) => {
    if (files.length + selectedFiles.length > 4) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 4 images",
        variant: "destructive",
      });
      return;
    }

    // Validate each file
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
      "image/svg+xml",
      "image/webp",
      "image/tiff",
      "image/bmp",
      "image/avif",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const newFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach((file) => {
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format`,
          variant: "destructive",
        });
        return;
      }
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        });
        return;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Handle Remove Skill Image
  const handleRemoveImage = (index: number) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [imagePreviews, avatarPreview]);

  return (
    <div className="relative max-h-[80vh] overflow-y-auto scrollbar-thin px-1">
      <Card className="p-6 w-full">
        <form action={submitAction} className="space-y-6">
          {/* Avatar Image Upload */}
          <div>
            <Label className="text-sm font-medium">Avatar Image</Label>
            <Input
              type="file"
              accept="image/*"
              name="avatarFile"
              onChange={handleAvatarFileChange}
              disabled={isPending}
            />
            {avatarPreview && (
              <div className="mt-4 relative">
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-32 h-32 object-cover rounded-full"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveAvatar}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Username Field */}
          <div>
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              placeholder="Enter your username"
              className="mt-1"
              autoComplete="username"
              disabled={isPending}
            />
            {/* Optionally handle field-specific errors */}
            {/* {fieldErrors.username && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>
            )} */}
          </div>

          {/* Email Field */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              className="mt-1"
              autoComplete="email"
              disabled={isPending}
            />
            {/* Optionally handle field-specific errors */}
            {/* {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )} */}
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className={cn("pr-10")}
                disabled={isPending}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
            {/* Optionally handle field-specific errors */}
            {/* {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
            )} */}
          </div>

          {/* Role Selection */}
          <div>
            <Label className="text-sm font-medium">I am a...</Label>
            <input type="hidden" name="role" value={role} />
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Button
                type="button"
                variant={role === "freelancer" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleRoleSelection("freelancer")}
                disabled={isPending}
              >
                Freelancer
              </Button>
              <Button
                type="button"
                variant={role === "employer" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleRoleSelection("employer")}
                disabled={isPending}
              >
                Employer
              </Button>
            </div>
            {/* Optionally handle field-specific errors */}
            {/* {fieldErrors.role && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.role}</p>
            )} */}
          </div>

          {/* Skill Images Upload for Freelancers */}
          {role === "freelancer" && (
            <div>
              <Label className="text-sm font-medium">Skill Images</Label>
              <p className="text-sm text-gray-600 mt-1">
                Upload images to showcase your skills and previous work!
              </p>
              <div className="mt-2">
                <RegistrationSkillImagesUpload onUpload={handleSkillImagesUpload} />
              </div>

              {/* Display Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Skill Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveImage(index)}
                        disabled={isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          {/* Display General Errors */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </Card>
    </div>
  );
}
