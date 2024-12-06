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
  isOnline?: boolean; // Added
  unreadCount?: number; // Existing unreadCount prop
  unreadCounts?: { [key: string]: number }; // New prop for freelancers
  onViewDetails: (user: User, event: React.MouseEvent) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onChat?: (user: User, event: React.MouseEvent) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  isOnline = false, // Added with default value
  unreadCount = 0,
  unreadCounts,
  onViewDetails,
  onEdit,
  onDelete,
  onChat,
}) => {
  const userContext = useContext(UserContext);
  const currentUser = userContext?.user;

  const UnreadBadge = ({ count }: { count: number }) =>
    count > 0 ? (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
        {count > 99 ? "99+" : count}
      </span>
    ) : null;

  // Determine if the current card is for the logged-in user
  const isOwnCard = currentUser?.id === user.id;

  // Calculate total unread count for freelancers viewing their own card
  const totalUnreadCount = isOwnCard
    ? Object.values(unreadCounts || {}).reduce((sum, count) => sum + count, 0)
    : unreadCount;

  return (
    <Card className="flex flex-col bg-white text-gray-900 p-4 shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
      <CardHeader className="p-0 relative overflow-hidden h-56 flex items-center justify-center">
        {/* Online Status Indicator */}

        {currentUser?.role === "employer" && user.role === "freelancer" && (
          <div className="absolute top-2 right-2 z-10">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-3 w-3 rounded-full ${
                  isOnline
                    ? "bg-green-500 ring-2 ring-green-300"
                    : "bg-gray-500 ring-2 ring-gray-300"
                }`}
              />
              {isOnline ? (
                <span className="text-white bg-green-600 px-2 py-1 rounded-md font-semibold text-sm">
                  Online
                </span>
              ) : (
                <span className="text-white bg-gray-600 px-2 py-1 rounded-md font-semibold text-sm">
                  Offline
                </span>
              )}
            </div>
          </div>
        )}
        {user.skillImageUrls && user.skillImageUrls.length > 0 ? (
          <Carousel className="w-full h-full">
            <CarouselContent>
              {user.skillImageUrls.map((url, index) => (
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
            {currentUser.role === "freelancer" && isOwnCard ? (
              // Freelancer viewing their own card - show Rooms button with total unread count
              <button
                onClick={(e) => onChat && onChat(user, e)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center relative"
                aria-label="View chat rooms"
              >
                Rooms
                <UnreadBadge count={totalUnreadCount} />
              </button>
            ) : currentUser.role === "employer" &&
              user.role === "freelancer" ? (
              // Employer viewing a freelancer's card - show Chat button (always enabled)
              <button
                onClick={(e) => onChat && onChat(user, e)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm relative flex items-center"
                aria-label={`Chat with ${user.username}`}
              >
                Chat
                <UnreadBadge count={unreadCount} />
              </button>
            ) : null}
          </div>
        )}

        {/* Edit/Delete Buttons */}
        {(onEdit || onDelete) && isOwnCard && (
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
