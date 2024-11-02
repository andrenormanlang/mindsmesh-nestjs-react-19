import React, { use } from "react";
import { User } from "../types/types";
import { UserContext } from "../contexts/UserContext";
import { Card, CardHeader, CardContent, CardFooter } from "./shadcn/ui/card";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoInformationCircleOutline } from "react-icons/io5";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./shadcn/ui/carousel";
import DefaultImage from "../assets/default-image.webp";

interface UserCardProps {
  user: User;
  onViewDetails: (user: User, event: React.MouseEvent) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onChat?: (user: User, event: React.MouseEvent) => void; // Add correct type for onChat prop
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onViewDetails,
  onEdit,
  onDelete,
  onChat,
}) => {
  const userContext = use(UserContext);

  return (
    <Card className="flex flex-col bg-white text-gray-900 p-4 shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
      <CardHeader className="p-0 relative overflow-hidden h-56 flex items-center justify-center">
        {user.imageUrls && user.imageUrls.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {user.imageUrls.map((url, index) => (
                <CarouselItem key={index} className="w-full h-full">
                  <img
                    src={url}
                    alt={`${user.username}'s image ${index + 1}`}
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DefaultImage;
                    }}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10 p-2 bg-gray-800 text-white rounded-full shadow-lg" />
            <CarouselNext className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10 p-2 bg-gray-800 text-white rounded-full shadow-lg" />
          </Carousel>
        ) : (
          <img
            src={DefaultImage}
            alt="Placeholder"
            className="w-full h-full object-contain rounded-lg"
          />
        )}
      </CardHeader>
      <CardContent className="pt-4 flex-grow">
        <div className="text-center">
          <h3 className="text-lg font-semibold">{user.username}</h3>
        </div>
        <div className="text-left mt-2">
          <a
            href={`mailto:${user.email}`}
            className="text-sm text-blue-500 hover:underline"
          >
            {user.email}
          </a>
        </div>
        <div className="text-left mt-4 flex flex-wrap">
          {user.skills.slice(0, 3).map((skill) => (
            <span
              key={skill.id}
              className="bg-blue-100 text-blue-800 font-semibold mr-2 mb-2 px-2.5 py-0.5 rounded text-sm truncate"
              title={skill.title}
            >
              {skill.title}
            </span>
          ))}
          {user.skills.length > 3 && (
            <span className="text-xs text-gray-500">
              +{user.skills.length - 3} more
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <button
          onClick={(e) => onViewDetails(user, e)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
        >
          <IoInformationCircleOutline />
        </button>
        {userContext?.user?.role === "freelancer" &&
        userContext.user.id === user.id ? (
          <button
            onClick={(e) => onChat && onChat(user, e)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
          >
            Rooms
          </button>
        ) : (
          user.role === "freelancer" && (
            <button
              onClick={(e) => onChat && onChat(user, e)}
              className={`px-3 py-1 rounded-md text-sm ${
                user.isOnline
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-500 text-white cursor-not-allowed"
              }`}
              disabled={!user.isOnline}
            >
              {user.isOnline ? "Chat" : "Offline"}
            </button>
          )
        )}

        {(onEdit || onDelete) && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(user)}
                className="text-gray-700 hover:text-gray-900"
              >
                <FaEdit />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(user)}
                className="text-red-500 hover:text-red-700"
              >
                <FaTrash />
              </button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserCard;