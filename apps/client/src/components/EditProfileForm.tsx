import { useState, useEffect, useActionState } from "react";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { Dialog } from "./shadcn/ui/dialog";
import { User } from "../types/types";
import EditSkillsForm from "./EditSkillsForm";
import { updateUser } from "../services/MindsMeshAPI";
import DeleteImage from "./DeleteImageConfirm";
import { useToast } from "./shadcn/ui/use-toast";
import ChangePasswordForm from "./ChangePasswordForm";
import ImagePreview from "./ImagePreview";
import AvatarUpload from "./AvatarUpload";
import SkillImagesUpload from "./SkillImagesUpload";

type EditProfileFormProps = {
  user: User;
  setUser: (user: User) => void;
};

const EditProfileForm = ({ user, setUser }: EditProfileFormProps) => {
  const { toast } = useToast();

  // State for UI elements
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.avatarUrl || null
  );
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [existingSkillImageUrls, setExistingSkillImageUrls] = useState<
    string[]
  >(user.skillImageUrls || []);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetDeleteIndex, setTargetDeleteIndex] = useState<number | null>(
    null
  );
  const [isDeleteExisting, setIsDeleteExisting] = useState<boolean>(true);
  const [selectedSkillFiles, setSelectedSkillFiles] = useState<File[]>([]);

  // State for skill image previews
  const [skillImagePreviews, setSkillImagePreviews] = useState<string[]>([]);

  // State for form validation
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const submitHandler = async (
    _previousState: any,
    formData: FormData
  ): Promise<string | null> => {
    try {
      const username = formData.get("username") as string;
      const avatarFile = formData.get("avatarFile") as File | null;

      // Validate username before submission
      if (usernameError) {
        return "Please resolve the errors before submitting.";
      }

      const userData = {
        id: user.id,
        username,
        avatarFile: avatarFile || undefined,
        skillImageUrls: existingSkillImageUrls, 
        newSkillImages: selectedSkillFiles, 
      };

      const updatedUser = await updateUser(userData);
      setUser(updatedUser);

      toast({
        title: "Profile Updated",
        description: "Your profile was updated successfully.",
        variant: "success",
        duration: 3000,
      });

      if (avatarFile) {
        setAvatarPreview(URL.createObjectURL(avatarFile));
      }
      setSelectedSkillFiles([]);
      setSkillImagePreviews([]);

      return null;
    } catch (error: any) {
      console.error("Failed to update profile:", error);

      toast({
        title: "Update Failed",
        description:
          error.message ||
          "There was an issue updating your profile. Please try again.",
        variant: "destructive",
        duration: 5000,
      });

      // Return the error message
      return error.message;
    }
  };

  const [error, submitAction, isPending] = useActionState(submitHandler, null);

  // Handlers for avatar upload and removal
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
  };

  const handleSkillImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter((file) => {
        const isValidType = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/avif",
          "image/webp",
          "image/svg+xml",
          "image/bmp",
          "image/tiff",
          "image/jpg",
        ].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        return isValidType && isValidSize;
      });

      if (validFiles.length !== filesArray.length) {
        toast({
          title: "Invalid Files",
          description:
            "Some files were not uploaded because they are either not images or exceed 5MB.",
          variant: "destructive",
          duration: 5000,
        });
      }

      const previews = validFiles.map((file) => URL.createObjectURL(file));
      setSkillImagePreviews((prev) => [...prev, ...previews]);
      setSelectedSkillFiles((prev) => [...prev, ...validFiles]); 


      e.target.value = "";
    }
  };

  const handleDeleteImageRequest = (index: number, isExisting: boolean) => {
    setTargetDeleteIndex(index);
    setIsDeleteExisting(isExisting);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteImage = () => {
    if (targetDeleteIndex !== null) {
      if (isDeleteExisting) {
        // Deleting an existing skill image
        const updatedUrls = existingSkillImageUrls.filter(
          (_, i) => i !== targetDeleteIndex
        );
        setExistingSkillImageUrls(updatedUrls);
      } else {

        const previewToDelete = skillImagePreviews[targetDeleteIndex];
        URL.revokeObjectURL(previewToDelete); // Revoke the URL
        const updatedPreviews = skillImagePreviews.filter(
          (_, i) => i !== targetDeleteIndex
        );
        setSkillImagePreviews(updatedPreviews);
      }
      setIsDeleteModalOpen(false);
      setTargetDeleteIndex(null);
      setIsDeleteExisting(true); 
    }
  };

  // Handle username validation
  const validateUsername = (username: string) => {
    if (username.length < 3) {
      setUsernameError("Username must be at least 3 characters long.");
    } else {
      setUsernameError(null);
    }
  };

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      skillImagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [skillImagePreviews, avatarPreview]);

  return (
    <>
      <form action={submitAction} className="space-y-6 max-w-2xl mx-auto p-4">
        {/* Avatar Upload Section */}
        <AvatarUpload
          avatarPreview={avatarPreview}
          onUpload={handleAvatarUpload}
          onRemove={handleRemoveAvatar}
        />

        {/* Username Input */}
        <div className="flex flex-col">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            defaultValue={user.username}
            placeholder="Username"
            required
            onBlur={(e) => validateUsername(e.target.value)}
          />
          {usernameError && (
            <p className="text-red-500 text-sm mt-1">{usernameError}</p>
          )}
        </div>

        {/* Skills Section */}
        {user.role !== "employer" && (
          <>
            <div className="flex flex-col">
              <Label htmlFor="skillImageFiles">Skill Images</Label>
              <SkillImagesUpload onUpload={handleSkillImagesUpload} />
              <div className="mt-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Existing Skill Images */}
                  {existingSkillImageUrls.map((url, index) => (
                    <ImagePreview
                      key={`existing-${index}`}
                      src={url}
                      alt={`Skill ${index + 1}`}
                      onDelete={() => handleDeleteImageRequest(index, true)}
                    />
                  ))}

                  {/* Newly Uploaded Skill Images */}
                  {skillImagePreviews.map((preview, index) => (
                    <ImagePreview
                      key={`new-${index}`}
                      src={preview}
                      alt={`New Skill ${index + 1}`}
                      onDelete={() => handleDeleteImageRequest(index, false)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setIsSkillsModalOpen(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-4"
            >
              Edit Skills
            </Button>
          </>
        )}

        {/* Change Password Button */}
        <Button
          type="button"
          onClick={() => setIsChangePasswordModalOpen(true)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Change Password
        </Button>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending || !!usernameError}
          className={`w-full flex items-center justify-center ${
            isPending || !!usernameError
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          } text-white`}
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-label="Loading"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </Button>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>

      {/* Skills Modal */}
      <Dialog open={isSkillsModalOpen} onOpenChange={setIsSkillsModalOpen}>
        <EditSkillsForm
          user={user}
          setUser={setUser}
          onClose={() => setIsSkillsModalOpen(false)}
        />
      </Dialog>

      {/* Change Password Modal */}
      <Dialog
        open={isChangePasswordModalOpen}
        onOpenChange={setIsChangePasswordModalOpen}
      >
        <ChangePasswordForm
          userId={user.id}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      </Dialog>

      {/* Delete Image Confirmation Modal */}
      <DeleteImage
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleteConfirm={confirmDeleteImage}
      />
    </>
  );
};

export default EditProfileForm;
