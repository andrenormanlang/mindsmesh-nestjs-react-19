import { useState,useActionState } from "react"; 
import { useToast } from "./shadcn/ui/use-toast";
import { register } from "../services/MindsMeshAPI";
import { Card } from "./shadcn/ui/card";
import { Button } from "./shadcn/ui/button";
import { Label } from "./shadcn/ui/label";
import { Loader2, AlertCircle, X } from "lucide-react";

type RegisterFormProps = {
  onClose: () => void;
};

function RegisterForm({ onClose }: RegisterFormProps) {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<"freelancer" | "employer">("freelancer");
  const [skillImagePreviews, setSkillImagePreviews] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const submitHandler = async (_: unknown, formData: FormData) => {
    try {
      const username = formData.get("username") as string | null;
      const email = formData.get("email") as string | null;
      const password = formData.get("password") as string | null;
      const role = formData.get("role") as "freelancer" | "employer" | null;
      const avatarFile = formData.get("avatarFile") as File | null;
      const skillFiles = formData.getAll("skillImageUrls") as File[];

      if (!username || !email || !password || !role) {
        return "Please fill out all required fields.";
      }

      await register(
        username,
        role,
        password,
        email,
        avatarFile ?? null,
        role === "freelancer" ? skillFiles : []
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
        return err.message;
      }
      return "An unexpected error occurred.";
    }
  };

  const [error, submitAction, isPending] = useActionState(submitHandler, null);

  // Handle role change
  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRole = event.target.value as "freelancer" | "employer";
    setSelectedRole(newRole);

    // If changing to employer, clear image previews
    if (newRole === "employer") {
      skillImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setSkillImagePreviews([]);
    }
  };

  // Handle skill images change (Freelancer only)
  const handleSkillImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Revoke previous previews
    skillImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));

    const previewUrls = Array.from(files).map((file) => URL.createObjectURL(file));
    setSkillImagePreviews(previewUrls);
  };

  // Remove a single preview image
  const removeImagePreview = (index: number) => {
    URL.revokeObjectURL(skillImagePreviews[index]);
    const newPreviews = [...skillImagePreviews];
    newPreviews.splice(index, 1);
    setSkillImagePreviews(newPreviews);
  };

  // Handle avatar change
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
      return;
    }

    // Revoke previous avatar preview if any
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  // Remove avatar preview
  const removeAvatarPreview = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
  };

  return (
    <div className="relative max-h-[80vh] overflow-y-auto scrollbar-thin px-1">
      <Card className="p-8 w-full max-w-lg mx-auto rounded-md shadow-md bg-white">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">Create Your Account</h1>
          <p className="text-sm text-gray-600 mt-2">
            Join our community to showcase your skills or find the best talent.
          </p>
        </div>
        <form
          action={submitAction}
          encType="multipart/form-data"
          method="post"
          className="space-y-6"
        >
          <div>
            <Label htmlFor="avatarFile" className="text-sm font-medium block mb-2">
              Avatar Image
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Optional. Helps personalize your profile.
            </p>
            <input
              name="avatarFile"
              id="avatarFile"
              type="file"
              accept="image/*"
              disabled={isPending}
              onChange={handleAvatarChange}
              className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:text-sm file:font-semibold hover:file:bg-gray-50"
            />
            {avatarPreview && (
              <div className="relative mt-4 inline-block">
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  className="w-24 h-24 object-cover rounded-full border border-gray-300"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1"
                  onClick={removeAvatarPreview}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="username" className="text-sm font-medium block mb-2">
              Username <span className="text-red-500">*</span>
            </Label>
            <input
              name="username"
              id="username"
              placeholder="e.g. johndoe123"
              autoComplete="username"
              disabled={isPending}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium block mb-2">
              Email <span className="text-red-500">*</span>
            </Label>
            <input
              name="email"
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              disabled={isPending}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium block mb-2">
              Password <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              At least 8 characters. Stronger passwords keep your account secure.
            </p>
            <input
              name="password"
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isPending}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <Label className="text-sm font-medium block mb-2">
              I am a... <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2 border border-gray-300 rounded p-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="freelancer"
                  defaultChecked
                  disabled={isPending}
                  onChange={handleRoleChange}
                />
                <span className="text-sm">Freelancer</span>
              </label>
              <label className="flex items-center space-x-2 border border-gray-300 rounded p-2 hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="employer"
                  disabled={isPending}
                  onChange={handleRoleChange}
                />
                <span className="text-sm">Employer</span>
              </label>
            </div>
          </div>

          {selectedRole === "freelancer" && (
            <div>
              <Label className="text-sm font-medium block mb-2">
                Skill Images (Freelancers only)
              </Label>
              <p className="text-xs text-gray-500 mb-2">
                Showcase your work by uploading images (up to 4).
              </p>
              <input
                name="skillImageUrls"
                type="file"
                accept="image/*"
                multiple
                disabled={isPending}
                onChange={handleSkillImagesChange}
                className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:text-sm file:font-semibold hover:file:bg-gray-50"
              />
              {/* Preview of selected images */}
              {skillImagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {skillImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImagePreview(index)}
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

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-800 text-sm rounded p-3 flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full text-sm font-medium bg-blue-600 text-white py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default RegisterForm;
