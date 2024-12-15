import { useState, useActionState } from "react";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { useToast } from "./shadcn/ui/use-toast";
import { register } from "../services/MindsMeshAPI";
import { Card } from "./shadcn/ui/card";
import { Eye, EyeOff, Loader2, Upload, X } from "lucide-react";
import { cn } from "./lib/utils";

type RegisterFormProps = {
  onClose: () => void;
};

export default function RegisterForm({ onClose }: RegisterFormProps) {
  const { toast } = useToast();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"freelancer" | "employer">("freelancer");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Store selected files in state so we can show previews before submitting.
  // These will be included in the FormData when the user submits the form.
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleRoleSelection = (selectedRole: "freelancer" | "employer") => {
    setRole(selectedRole);
    // Clear skill images if switching to employer
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

    // Update state
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    const filePreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...filePreviews]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Define the action function for useActionState
  // It receives (previousState, formData) and returns either null on success or an error message.
  const [error, submitAction, isPending] = useActionState(
    async (_: unknown, formData: FormData) => {
      try {
        const username = formData.get("username")?.toString().trim() || "";
        const email = formData.get("email")?.toString().trim() || "";
        const password = formData.get("password")?.toString() || "";
        const role = formData.get("role")?.toString() as "freelancer" | "employer";

        // Get avatar file from our state since we used a controlled input for preview
        // If you prefer, you can rely on formData.get("avatarFile") if you do not manage previews.
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
        return null; // No error
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
    null // initial state (no error initially)
  );

  return (
    <div className="relative max-h-[80vh] overflow-y-auto scrollbar-thin px-1">
      <Card className="p-6 w-full">
        {/* Use the new React 19 form action */}
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

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

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
