import React from "react";
import { User } from "../types/types";
import { Card, CardContent, CardHeader } from "../../@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../@/components/ui/carousel";

interface UserDetailCardProps {
  user: User;
}

const UserDetailCard: React.FC<UserDetailCardProps> = ({ user }) => {
  return (
    <div className=" flex items-center justify-center m-0 p-0">
      <Card className=" bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 shadow-lg rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
        <CardHeader className="p-0 m-0 flex-shrink-0 relative">
          <Carousel className="w-full relative m-0 h-80">
            <CarouselContent>
              {user.avatarUrls?.map((url, index) => (
                <CarouselItem key={index}>
                  <img
                    src={url}
                    alt={`${user.username}'s image ${index + 1}`}
                    className="w-full h-80 object-cover"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-indigo-800 p-2 rounded-full shadow" />
            <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-indigo-800 p-2 rounded-full shadow" />
          </Carousel>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto custom-scrollbar flex-grow">
          <h2 className="text-4xl font-bold mb-4 text-indigo-900">
            {user.username}
          </h2>
          <p className="text-gray-600 mb-4 text-lg">{user.email}</p>
          <h3 className="text-2xl font-semibold mb-4 text-indigo-800">
            Skills:
          </h3>
          <ul className="space-y-4">
            {user.skills.map((skill) => (
              <li key={skill.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <span className="font-medium text-xl text-indigo-700">
                  {skill.title}
                </span>
                <p className="text-gray-600 mt-2 text-base">
                  {skill.description}
                </p>
                <span className="text-green-600 font-semibold mt-2 block text-lg">
                  ${skill.price}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailCard;
