import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "../../@/components/ui/button";
import { Input } from "../../@/components/ui/input";
import { Label } from "../../@/components/ui/label";
import { Dialog } from "../../@/components/ui/dialog";
import { Skill, User } from "../types/types";
import EditSkillsForm from "./EditSkillsForm";
import { updateUser } from "../services/SkillShareAPI";
import DeleteImage from "./DeleteImage";

type ProfileFormData = {
  username: string;
  avatarFiles: File[]; // Store the newly uploaded files
  skills: Skill[];
};

type EditProfileFormProps = {
  user: User;
  setUser: (user: User) => void;
  onClose: () => void;
};

const EditProfileForm = ({ user, setUser, onClose }: EditProfileFormProps) => {
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [existingimageUrls, setExistingimageUrls] = useState<string[]>(
    user.imageUrls || []
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal visibility state
  const [targetDeleteIndex, setTargetDeleteIndex] = useState<number | null>(
    null
  ); // Index of image to delete

  const { control, handleSubmit, getValues, setValue } =
    useForm<ProfileFormData>({
      defaultValues: {
        username: user.username,
        avatarFiles: [],
        skills: user.skills,
      },
    });

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      const updatedUser = await updateUser({
        id: user.id,
        username: data.username,
        imageUrls: existingimageUrls, // Only pass existing URLs
        avatarFiles: data.avatarFiles, // Only pass new files
      });

      setUser(updatedUser);
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setValue("avatarFiles", [...getValues("avatarFiles"), ...files]); // Store new files
    }
  };

  const handleDeleteImageRequest = (index: number) => {
    setTargetDeleteIndex(index); // Set the target index
    setIsDeleteModalOpen(true); // Open the modal
  };

  const confirmDeleteImage = () => {
    if (targetDeleteIndex !== null) {
      if (targetDeleteIndex < existingimageUrls.length) {
        // Remove from existing URLs
        const updatedUrls = existingimageUrls.filter(
          (_, i) => i !== targetDeleteIndex
        );
        setExistingimageUrls(updatedUrls);
      } else {
        // Remove from newly added files
        const newIndex = targetDeleteIndex - existingimageUrls.length;
        const updatedFiles = getValues("avatarFiles").filter(
          (_, i) => i !== newIndex
        );
        setValue("avatarFiles", updatedFiles);
      }
      setIsDeleteModalOpen(false); // Close the modal after deletion
      setTargetDeleteIndex(null); // Reset the target index
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="username">Username</Label>
          <Controller
            name="username"
            control={control}
            rules={{ required: "Username is required" }}
            render={({ field }) => (
              <Input {...field} placeholder="Username" className="w-full" />
            )}
          />
        </div>

        <div>
          <Label htmlFor="avatar">Avatar Images</Label>
          <Input type="file" multiple onChange={handleAvatarUpload} />
          <div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {[
                ...existingimageUrls,
                ...getValues("avatarFiles").map((file) =>
                  URL.createObjectURL(file)
                ),
              ].map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Avatar ${index + 1}`}
                    className="h-20 w-full object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    onClick={() => handleDeleteImageRequest(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1"
                  >
                    &times;
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setIsSkillsModalOpen(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          Edit Skills
        </Button>

        <Button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white"
        >
          Update Profile
        </Button>
      </form>

      {/* Skills Modal */}
      <Dialog open={isSkillsModalOpen} onOpenChange={setIsSkillsModalOpen}>
        <EditSkillsForm
          user={user}
          setUser={setUser}
          onClose={() => setIsSkillsModalOpen(false)}
        />
      </Dialog>

      <DeleteImage
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleteConfirm={confirmDeleteImage}
      />
    </>
  );
};

export default EditProfileForm;
