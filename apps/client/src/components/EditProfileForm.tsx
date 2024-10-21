import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { Label } from "./shadcn/ui/label";
import { Dialog } from "./shadcn/ui/dialog";
import { Skill, User } from "../types/types";
import EditSkillsForm from "./EditSkillsForm";
import { updateUser } from "../services/MindsMeshAPI";
import DeleteImage from "./DeleteImageConfirm";
import { useToast } from "./shadcn/ui/use-toast";
import ChangePasswordForm from "./ChangePasswordForm";

type ProfileFormData = {
  username: string;
  avatarFiles: File[];
  skills: Skill[];
};

type EditProfileFormProps = {
  user: User;
  setUser: (user: User) => void;
};

const EditProfileForm = ({ user, setUser }: EditProfileFormProps) => {
  const { toast } = useToast();
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [existingimageUrls, setExistingimageUrls] = useState<string[]>(
    user.imageUrls || []
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [targetDeleteIndex, setTargetDeleteIndex] = useState<number | null>(
    null
  );

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
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
        imageUrls: existingimageUrls,
        avatarFiles: data.avatarFiles,
      });

      setUser(updatedUser);

      toast({
        title: "Profile Updated",
        description: "Your profile was updated successfully.",
        variant: "success",
        duration: 3000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);

      toast({
        title: "Update Failed",
        description:
          "There was an issue updating your profile. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setValue("avatarFiles", [...getValues("avatarFiles"), ...files]);
    }
  };

  const handleDeleteImageRequest = (index: number) => {
    setTargetDeleteIndex(index);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteImage = () => {
    if (targetDeleteIndex !== null) {
      if (targetDeleteIndex < existingimageUrls.length) {
        const updatedUrls = existingimageUrls.filter(
          (_, i) => i !== targetDeleteIndex
        );
        setExistingimageUrls(updatedUrls);
      } else {
        const newIndex = targetDeleteIndex - existingimageUrls.length;
        const updatedFiles = getValues("avatarFiles").filter(
          (_, i) => i !== newIndex
        );
        setValue("avatarFiles", updatedFiles);
      }
      setIsDeleteModalOpen(false);
      setTargetDeleteIndex(null);
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
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">
              {errors.username.message}
            </p>
          )}
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
          type="button"
          onClick={() => setIsChangePasswordModalOpen(true)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Change Password
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

      <DeleteImage
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDeleteConfirm={confirmDeleteImage}
      />
    </>
  );
};

export default EditProfileForm;
