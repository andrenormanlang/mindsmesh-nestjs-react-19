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
    <div className="h-screen flex items-center justify-center m-0 p-0">
      <Card className="w-full max-w-xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 shadow-lg overflow-hidden max-h-[90vh] flex flex-col m-0">
        <CardHeader className="p-0 m-0 flex-shrink-0">
          <Carousel className="w-full relative m-0">
            <CarouselContent>
              {user.avatarUrls?.map((url, index) => (
                <CarouselItem key={index}>
                  <img
                    src={url}
                    alt={`${user.username}'s image ${index + 1}`}
                    className="w-full h-72 object-cover m-0"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90" />
            <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white/90" />
          </Carousel>
        </CardHeader>
        <CardContent className="p-1 m-0 overflow-y-auto custom-scrollbar flex-grow scroll-smooth">
          <h2 className="text-3xl font-bold mb-2 text-indigo-800">
            {user.username}
          </h2>
          <p className="text-gray-600 mb-2 text-sm">{user.email}</p>
          <h3 className="text-xl font-semibold mb-2 text-indigo-700">
            Skills:
          </h3>
          <ul className="space-y-2">
            {user.skills.map((skill) => (
              <li key={skill.id} className="bg-white p-2 rounded-lg shadow">
                <span className="font-medium text-lg text-indigo-600">
                  {skill.title}
                </span>
                <p className="text-gray-600 mt-1 text-sm">
                  {skill.description}
                </p>
                <span className="text-green-600 font-semibold mt-1 inline-block">
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
