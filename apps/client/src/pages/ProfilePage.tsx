import { useEffect, useState } from 'react';
import { getProfile } from '../services/SkillShareAPI';
import { User } from '../types/types';


const ProfilePage = () => {
    const [user, setUser] = useState<User | null>(null);
  
    useEffect(() => {
      const fetchProfile = async () => {
        const profileData = await getProfile();
        setUser(profileData);
      };
  
      fetchProfile();
    }, []);
  
    if (!user) {
      return <div>Loading...</div>;
    }
  
    return (
      <div className="p-4">
        <h2 className="text-2xl font-semibold">Profile</h2>
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        {/* Add more details and actions here */}
      </div>
    );
  };
  
  export default ProfilePage;