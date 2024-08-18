import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "../../@/components/ui/button";
import { Input } from "../..//@/components/ui/input";
import { Label } from "../../@/components/ui/label";
import { Dialog } from "../../@/components/ui/dialog";
import { Skill, User } from "../types/types";
import EditSkillsForm from "./EditSkillsForm";
import { updateUserWithSkills } from "../services/SkillShareAPI";


type ProfileFormData = {
  username: string;
  profile: {
    bio: string;
    location: string;
  };
  avatarUrls: string[];
  skills: Skill[];
};

type EditProfileFormProps = {
  user: User;
  setUser: (user: User) => void;
  onClose: () => void;
};

const EditProfileForm = ({ user, setUser, onClose }: EditProfileFormProps) => {
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const { control, handleSubmit, getValues, setValue } = useForm<ProfileFormData>({
    defaultValues: {
      username: user.username,
      avatarUrls: user.avatarUrls,
      skills: user.skills,
    },
  });

  const handleFormSubmit = async (data: ProfileFormData) => {
    try {
      const updatedUser = await updateUserWithSkills({
        id: user.id,
        username: data.username,
        avatarUrls: data.avatarUrls,
        skills: data.skills,  // Now using skills from form data
      });
      setUser(updatedUser);
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const avatarUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setValue("avatarUrls", [...getValues("avatarUrls"), ...avatarUrls]);
    }
  };

  const handleDeleteImageRequest = (index: number) => {
    const updatedAvatars = getValues("avatarUrls").filter((_, i) => i !== index);
    setValue("avatarUrls", updatedAvatars);
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
          <div className="grid grid-cols-2 gap-4 mt-2">
            {getValues("avatarUrls").map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`Avatar ${index + 1}`} className="h-20 w-full object-cover rounded-md" />
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

        <Button type="button" onClick={() => setIsSkillsModalOpen(true)} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
          Edit Skills
        </Button>

        <Button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white">
          Update Profile
        </Button>
      </form>

      {/* Skills Modal */}
      <Dialog open={isSkillsModalOpen} onOpenChange={setIsSkillsModalOpen}>
        <EditSkillsForm user={user} setUser={setUser} onClose={() => setIsSkillsModalOpen(false)} />
      </Dialog>
    </>
  );
};

export default EditProfileForm;
