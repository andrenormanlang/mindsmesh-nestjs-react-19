import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateProfile } from "../services/SkillShareAPI";
import { Input } from "../../@/components/ui/input";
import { Button } from "../../@/components/ui/button";
import { User } from "../types/types"; // Assuming you have a User type defined in types

// Define the type for the userData state
type UserData = {
  username: string;
  email: string;
  avatarUrls: string[]; // This should match the type in your User interface
};

const EditProfileForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({
    username: "",
    email: "",
    avatarUrls: [],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const user: User = await getUserById(id!);
      setUserData({
        username: user.username || "",
        email: user.email || "",
        avatarUrls: user.avatarUrls || [],
      });
    };
    fetchUserData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateProfile(userData);
    navigate(`/profile/${id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <label htmlFor="email">Email</label>
        <Input
          type="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      {/* Add fields for password, avatar upload, etc. */}
      <Button type="submit" className="w-full">
        Update Profile
      </Button>
    </form>
  );
};

export default EditProfileForm;
