import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { useToast } from "./shadcn/ui/use-toast";
import { register } from "../services/MindsMeshAPI";
import { Card } from "./shadcn/ui/card";
import { Eye, EyeOff, Loader2, Upload, X } from "lucide-react";
import { cn } from "./lib/utils";

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  role: "freelancer" | "employer";
  avatarFile?: FileList;
  skillImageUrls?: FileList;
}

const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["freelancer", "employer"] as const),
  skillImageUrls: z.any().optional(),
  avatarFile: z.any().optional(),
});

type RegisterFormProps = {
  onClose: () => void;
};

const RegisterForm = ({ onClose }: RegisterFormProps) => {
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "freelancer",
    },
  });

  const role = watch("role");

  // Handle role selection without triggering modal stacking
  const handleRoleSelection = (selectedRole: "freelancer" | "employer") => {
    setValue("role", selectedRole, { shouldValidate: true });
    // Clear files only when switching to employer
    if (selectedRole === "employer") {
      setSelectedFiles([]);
      setImagePreviews([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (files.length + selectedFiles.length > 10) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 4 images",
        variant: "destructive",
      });
      return;
    }

    const newFiles = Array.from(files).filter((file) => {
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
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    const filePreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...filePreviews]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const role = data.role as "freelancer" | "employer";
      const filesToUpload = role === "freelancer" ? selectedFiles : [];
      const avatarFile = data.avatarFile ? data.avatarFile[0] : null;

      await register(
        data.username,
        role,
        data.password,
        data.email,
        avatarFile,
        filesToUpload
      );

      toast({
        title: "Welcome aboard! 🎉",
        description: "Please check your email to verify your account.",
        variant: "success",
        duration: 5000,
      });
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast({
          title: "Registration Failed",
          description: err.message,
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      // Validate file type and size if needed
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
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setValue("avatarFile", undefined);
  };

  return (
    <div className="relative max-h-[80vh] overflow-y-auto scrollbar-thin px-1">
      <Card className="p-6 w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar image upload */}
          <div>
            <Label className="text-sm font-medium">Avatar Image</Label>
            <Controller
              name="avatarFile"
              control={control}
              render={({ field }) => (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    field.onChange(e.target.files);
                    handleAvatarFileChange(e);
                  }}
                  disabled={isLoading}
                />
              )}
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
                  disabled={isLoading}
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
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="username"
                  placeholder="Enter your username"
                  className="mt-1"
                  autoComplete="username"
                  disabled={isLoading}
                />
              )}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email field */}
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="mt-1"
                  autoComplete="email"
                  disabled={isLoading}
                />
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={cn(
                      "pr-10",
                      errors.password &&
                        "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                )}
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
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role selection */}
          <div>
            <Label className="text-sm font-medium">I am a...</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Button
                type="button"
                variant={role === "freelancer" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleRoleSelection("freelancer")}
                disabled={isLoading}
              >
                Freelancer
              </Button>
              <Button
                type="button"
                variant={role === "employer" ? "default" : "outline"}
                className="w-full"
                onClick={() => handleRoleSelection("employer")}
                disabled={isLoading}
              >
                Employer
              </Button>
            </div>
          </div>

          {/* Skill Images upload for freelancers */}
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
                      onChange={handleFileChange}
                      disabled={isLoading || selectedFiles.length >= 4}
                    />
                  </label>
                </div>
              </div>

              {/* Image previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={src}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
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
};

export default RegisterForm;
