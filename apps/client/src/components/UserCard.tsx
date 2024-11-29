// src/components/UserCard.tsx

import React, { useContext } from "react";
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
  unreadCount?: number; // Add unreadCount prop
  onViewDetails: (user: User, event: React.MouseEvent) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onChat?: (user: User, event: React.MouseEvent) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  unreadCount = 0,
  onViewDetails,
  onEdit,
  onDelete,
  onChat,
}) => {
  const userContext = useContext(UserContext);

  const currentUser = userContext?.user;

  const UnreadBadge = ({ count }: { count: number }) => (
    count > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
        {count > 99 ? "99+" : count}
      </span>
    )
  );

  return (
    <Card className="flex flex-col bg-white text-gray-900 p-4 shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
      {/* Removed the general Unread Count Badge */}

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
        <div>
          <button
            onClick={(e) => onViewDetails(user, e)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
            aria-label={`View details for ${user.username}`}
          >
            <IoInformationCircleOutline />
          </button>
        </div>

        {currentUser && (
          <div className="relative">
            {currentUser.role === "freelancer" && currentUser.id === user.id ? (
              // Freelancer viewing their own card - show Rooms button with unread count
              <button
                onClick={(e) => onChat && onChat(user, e)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
                aria-label="View chat rooms"
              >
                Rooms
                <UnreadBadge count={unreadCount} />
              </button>
            ) : currentUser.role === "employer" && user.role === "freelancer" ? (
              // Employer viewing a freelancer's card - show Chat button with unread count
              <button
                onClick={(e) => onChat && onChat(user, e)}
                className={`px-3 py-1 rounded-md text-sm relative flex items-center ${
                  user.isOnline
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-500 text-white cursor-not-allowed"
                }`}
                disabled={!user.isOnline}
                aria-label={`${user.isOnline ? "Chat with" : "Cannot chat with"} ${user.username}`}
              >
                {user.isOnline ? "Chat" : "Offline"}
                {user.isOnline && <UnreadBadge count={unreadCount} />}
              </button>
            ) : null}
          </div>
        )}

        {/* Edit/Delete Buttons */}
        {(onEdit || onDelete) && currentUser && currentUser.id === user.id && (
          <div className="flex space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(user)}
                className="text-gray-700 hover:text-gray-900"
                aria-label={`Edit ${user.username}`}
              >
                <FaEdit />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(user)}
                className="text-red-500 hover:text-red-700"
                aria-label={`Delete ${user.username}`}
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
