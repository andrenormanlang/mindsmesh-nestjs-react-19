import { useEffect, useState } from "react";
import HipsterChubbyCat from "../assets/Hipster-Chubby-Cat.png";
import { Button } from "../../@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../@/components/ui/card";
import { Input } from "../../@/components/ui/input";
import { getAllUsers, deleteUser, getProfile } from "../services/SkillShareAPI";
import { User } from "../types/types";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../@/components/ui/carousel";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [usersWithSkills, setUsersWithSkills] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers(); // Fetch all users
        const usersWithSkills = users.filter(
          (user) => user.skills && user.skills.length > 0
        ); // Filter users with at least one skill
        setUsersWithSkills(usersWithSkills);

        const profile = await getProfile();
        setCurrentUser(profile);
      } catch (error) {
        console.error("Failed to fetch users or profile", error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteAccount = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete your account? This action is irreversible.")) {
      await deleteUser(userId);
      setCurrentUser(null);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-700 to-green-900 text-white">
      <div className="flex flex-col items-center py-12">
        <h1 className="text-4xl font-bold mb-4">
          Find the right pro, right away
        </h1>
        <Input
          type="text"
          placeholder="Search for any service..."
          className="w-1/2 p-4 text-lg rounded-lg mb-8"
        />
        <div className="flex justify-center w-full">
          <img
            src={HipsterChubbyCat}
            alt="A description of the image"
            className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-sm xl:max-w-sm h-auto rounded-lg shadow-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-8">
        {usersWithSkills.map((user) => (
          <Card
            key={user.id}
            className="bg-white text-gray-900 p-4 shadow-lg rounded-lg"
          >
            <CardHeader className="p-0 relative overflow-hidden">
              {user.avatarUrls && user.avatarUrls.length > 0 ? (
                <div className="relative w-full h-56">
                  <Carousel className="relative">
                    <CarouselContent>
                      {user.avatarUrls.map((url, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={url}
                            alt={`${user.username}'s image ${index + 1}`}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10 p-2 bg-gray-800 text-white rounded-full shadow-lg" />
                    <CarouselNext className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10 p-2 bg-gray-800 text-white rounded-full shadow-lg" />
                  </Carousel>
                </div>
              ) : (
                <img
                  src="https://via.placeholder.com/150"
                  alt="Placeholder"
                  className="w-full h-full object-contain rounded-lg"
                />
              )}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{user.username}</h3>
                  <p className="text-sm text-gray-500">Level 2</p>
                </div>
              </div>
              <div className="mt-4">
                {user.skills.map((skill) => (
                  <p key={skill.id} className="text-sm">
                    {skill.title}
                  </p>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4" />
                <p className="ml-1 text-sm">4.9 (1k+)</p>
              </div>
              {currentUser?.id === user.id && (
                <>
                  <Button
                    className="text-sm"
                    variant="outline"
                    onClick={() => navigate(`/profile/edit/${user.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    className="text-sm"
                    variant="destructive"
                    onClick={() => handleDeleteAccount(user.id)}
                  >
                    Delete Account
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
