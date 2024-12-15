import { useState, useActionState } from "react";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { useToast } from "./shadcn/ui/use-toast";
import { register } from "../services/MindsMeshAPI";
import { Card } from "./shadcn/ui/card";
import { Eye, EyeOff, Loader2, Upload, X } from "lucide-react";
import { cn } from "./lib/utils";
import { z } from "zod";

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

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"freelancer" | "employer">("freelancer");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // State to hold individual field errors
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    role?: string;
  }>({});

  const handleRoleSelection = (selectedRole: "freelancer" | "employer") => {
    setRole(selectedRole);
    if (selectedRole === "employer") {
      setSelectedFiles([]);
      setImagePreviews([]);
    }
  };

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

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setAvatarFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (files.length + selectedFiles.length > 4) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 4 images",
        variant: "destructive",
      });
      return;
    }

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

    const newFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format`,
          variant: "destructive",
        });
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        });
        continue;
      }
      newFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    const filePreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...filePreviews]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const [error, submitAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      // Reset field errors each submission attempt
      setFieldErrors({});

      try {
        const rawData = {
          username: formData.get("username")?.toString().trim() || "",
          email: formData.get("email")?.toString().trim() || "",
          password: formData.get("password")?.toString() || "",
          role: (formData.get("role")?.toString() as "freelancer" | "employer") || "freelancer"
        };

        // Use safeParse to get a result object
        const result = registerSchema.safeParse(rawData);

        if (!result.success) {
          // Validation failed, collect field-level errors
          const newFieldErrors: { [k: string]: string } = {};
          for (const issue of result.error.issues) {
            const fieldName = issue.path[0]; // e.g. "username", "email"
            if (typeof fieldName === "string") {
              newFieldErrors[fieldName] = issue.message;
            }
          }

          setFieldErrors(newFieldErrors);
          // Return a generic message or join all messages
          const message = result.error.issues.map((iss) => iss.message).join(" ");
          toast({
            title: "Validation Error",
            description: message,
            variant: "destructive",
            duration: 5000,
          });
          return message;
        }

        const { username, email, password, role } = result.data;

        const filesToUpload = role === "freelancer" ? selectedFiles : [];
        const finalAvatarFile = avatarFile || null;

        await register(username, role, password, email, finalAvatarFile, filesToUpload);

        toast({
          title: "Welcome aboard! 🎉",
          description: "Please check your email to verify your account.",
          variant: "success",
          duration: 5000,
        });
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
    },
    null
  );

  return (
    <div className="relative max-h-[80vh] overflow-y-auto scrollbar-thin px-1">
      <Card className="p-6 w-full">
        <form action={submitAction} className="space-y-6">
          {/* Avatar image upload */}
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

          {/* Username field */}
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
            {fieldErrors.username && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.username}</p>
            )}
          </div>

          {/* Email field */}
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
            {fieldErrors.email && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password field */}
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
            {fieldErrors.password && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Role selection */}
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
            {fieldErrors.role && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.role}</p>
            )}
          </div>

          {/* Skill Images upload for freelancers */}
          {role === "freelancer" && (
            <div>
              <Label className="text-sm font-medium">Skill Images</Label>
              <p className="text-sm text-gray-600 mt-1">
                Upload images to showcase your skills and previous work!
              </p>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
                    <Upload className="w-8 h-8" />
                    <span className="mt-2 text-base leading-normal">
                      Select images
                    </span>
                    <Input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      name="skillImageUrls"
                      onChange={handleFileChange}
                      disabled={isPending || selectedFiles.length >= 4}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

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
        </form>
      </Card>
    </div>
  );
}
