import { useEffect, useState } from "react";
import { Button } from "../../@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "../../@/components/ui/card";
import Navbar from "../components/NavBar";
import { Input } from "../../@/components/ui/input";
import { getAllUsers } from "../services/SkillShareAPI"; // Importing the API call
import HipsterChubbyCat from "../assets/Hipster-Chubby-Cat.png";

import { User } from "../types/types";
import { Star } from "lucide-react";

const HomePage = () => {
  const [usersWithSkills, setUsersWithSkills] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllUsers(); // Fetch all users
        const usersWithSkills = users.filter(
          (user) => user.skills && user.skills.length > 0
        ); // Filter users with at least one skill
        console.log("Users with skills", usersWithSkills);
        setUsersWithSkills(usersWithSkills);
      } catch (error) {
        console.error("Failed to fetch users with skills", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <Navbar />

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
              <CardHeader className="p-0">
                <img
                  src={
                    user.avatar || "https://nextui.org/images/hero-card.jpeg"
                  }
                  alt={`${user.username}'s skill`}
                  className="w-full h-44 object-contain rounded-lg"
                />
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
                <Button className="text-sm" variant="outline">
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="bg-gray-800 text-gray-300 p-4 text-center">
          Trusted by: Meta, Google, Netflix, P&G, PayPal, Payoneer
        </div>
      </div>
    </div>
  );
};

export default HomePage;
