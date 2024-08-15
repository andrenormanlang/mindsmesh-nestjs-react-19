import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../services/SkillShareAPI";
import { Input } from "../../@/components/ui/input";
import { Button } from "../../@/components/ui/button";
import { User } from "../types/types";

type EditProfileFormProps = {
  user: User;
  onClose: () => void;
};

const EditProfileForm = ({ user, onClose }: EditProfileFormProps) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
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
        console.log('Populating form with user data:', user);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      profile: {
        ...userData.profile,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSkillChange = (index: number, field: string, value: string | number | boolean) => {
    const newSkills = [...userData.skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setUserData({ ...userData, skills: newSkills });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const avatarUrls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setUserData({ ...userData, avatarUrls });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateProfile(userData);
    navigate(`/profile/${user.id}`);
    onClose(); // Close the modal after saving
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields remain the same */}
      <div>
        <label htmlFor="username">Username</label>
        <Input
          type="text"
          name="username"
          value={userData.username}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <div>
        <label htmlFor="bio">Bio</label>
        <Input
          type="text"
          name="bio"
          value={userData.profile.bio}
          onChange={handleProfileChange}
          className="w-full"
        />
      </div>
      <div>
        <label htmlFor="location">Location</label>
        <Input
          type="text"
          name="location"
          value={userData.profile.location}
          onChange={handleProfileChange}
          className="w-full"
        />
      </div>
      <div>
        <label htmlFor="avatar">Upload Avatar</label>
        <Input
          type="file"
          name="avatar"
          multiple
          onChange={handleAvatarUpload}
          className="w-full"
        />
        <div className="flex space-x-2 mt-2">
          {userData.avatarUrls.map((url, index) => (
            <img key={index} src={url} alt={`Avatar ${index + 1}`} className="h-16 w-16 rounded-full" />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Skills</h3>
        {userData.skills.map((skill, index) => (
          <div key={index} className="space-y-2">
            <Input
              type="text"
              placeholder="Title"
              value={skill.title}
              onChange={(e) => handleSkillChange(index, "title", e.target.value)}
              className="w-full"
            />
            <Input
              type="text"
              placeholder="Description"
              value={skill.description}
              onChange={(e) => handleSkillChange(index, "description", e.target.value)}
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Price"
              value={skill.price}
              onChange={(e) => handleSkillChange(index, "price", parseInt(e.target.value))}
              className="w-full"
            />
            <Input
              type="text"
              placeholder="Category"
              value={skill.category}
              onChange={(e) => handleSkillChange(index, "category", e.target.value)}
              className="w-full"
            />
            <label>
              <input
                type="checkbox"
                checked={skill.isAvailable}
                onChange={(e) => handleSkillChange(index, "isAvailable", e.target.checked)}
              />
              Available
            </label>
          </div>
        ))}
      </div>
      <Button type="submit" className="w-full">
        Update Profile
      </Button>
    </form>
  );
};

export default EditProfileForm;
