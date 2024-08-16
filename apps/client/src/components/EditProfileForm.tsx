import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "../../@/components/ui/button";
import { Input } from "../../@/components/ui/input";
import { Label } from "../../@/components/ui/label";
import { Textarea } from "../../@/components/ui/textarea";
import EditSkillsForm from "./EditSkillsForm";
import DeleteImage from "./DeleteImage";
import { User, Skill } from "../types/types";
import { updateUserWithSkills } from "../services/SkillShareAPI"; // Import the updated API method

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
  onClose: () => void;
};

const EditProfileForm = ({ user, onClose }: EditProfileFormProps) => {
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  const [userData, setUserData] = useState<ProfileFormData>({
    username: user.username || "",
    profile: {
      bio: user.profile?.bio || "",
      location: user.profile?.location || "",
    },
    skills: user.skills || [],
    avatarUrls: user.avatarUrls || [],
  });

  useEffect(() => {
    if (user) {
      setUserData({
        username: user.username || "",
        profile: {
          bio: user.profile?.bio || "",
          location: user.profile?.location || "",
        },
        skills: user.skills || [],
        avatarUrls: user.avatarUrls || [],
      });
    }
  }, [user]);

  const { control, handleSubmit } = useForm<ProfileFormData>({
    defaultValues: userData,
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const avatarUrls = Array.from(e.target.files).map((file) =>
        URL.createObjectURL(file)
      );
      setUserData({ ...userData, avatarUrls: [...userData.avatarUrls, ...avatarUrls] });
    }
  };

  const handleDeleteImageRequest = (index: number) => {
    setImageToDelete(index);
    setIsModalOpen(true);
  };

  const handleDeleteImage = () => {
    if (imageToDelete !== null) {
      const newAvatarUrls = userData.avatarUrls.filter((_, i) => i !== imageToDelete);
      setUserData({ ...userData, avatarUrls: newAvatarUrls });
      setImageToDelete(null);
      setIsModalOpen(false);
    }
  };

  const handleMainSubmit = async (data: ProfileFormData) => {
    console.log("Main Profile Data:", data);

    try {
        // Combine the user ID with the form data
        const updatedData = { id: user.id, ...data };

        // Submit the updated profile data to the backend
        await updateUserWithSkills(updatedData);
        console.log("Profile updated successfully");
        onClose();
    } catch (error) {
        console.error("Error updating profile:", error);
    }
};

  const handleSkillSubmit = async (data: { skills: Skill[] }) => {
    console.log("Skills Data:", data.skills);
    setUserData({ ...userData, skills: data.skills });
    setIsSkillModalOpen(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleMainSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Username" className="w-full" />
            )}
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Controller
            name="profile.bio"
            control={control}
            render={({ field }) => (
              <Textarea {...field} placeholder="Bio" className="w-full" />
            )}
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Controller
            name="profile.location"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Location" className="w-full" />
            )}
          />
        </div>

        <div>
          <Label htmlFor="avatar">Project Images</Label>
          <Input
            type="file"
            name="avatar"
            multiple
            onChange={handleAvatarUpload}
            className="w-full"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
            {userData.avatarUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Avatar ${index + 1}`}
                  className="h-20 w-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImageRequest(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1 hover:bg-red-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        <Button type="button" onClick={() => setIsSkillModalOpen(true)} className="w-full">
          Edit Skills
        </Button>

        <Button type="submit" className="w-full">
          Update Profile
        </Button>

        <DeleteImage
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDeleteConfirm={handleDeleteImage}
        />
      </form>

      <EditSkillsForm
        user={user}
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        onSubmit={handleSkillSubmit}
      />
    </>
  );
};

export default EditProfileForm;
