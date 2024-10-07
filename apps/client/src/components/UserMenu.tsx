import React from 'react';
import { User } from "../types/types";
import { Button } from "../../@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../../@/components/ui/avatar";
import { ChevronDownIcon, UserIcon, SettingsIcon, LogOutIcon } from "lucide-react";

interface UserMenuProps {
  user: User;
  onProfileClick: () => void;
  onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onProfileClick, onLogout }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-gray-700 transition-colors duration-200">
          <Avatar className="w-8 h-8">
            {/* <AvatarImage src={user.avatarUrl} alt={user.username} /> */}
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-white font-medium">{user.username}</span>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mt-2 p-2 bg-white rounded-md shadow-lg">
        <DropdownMenuItem onClick={onProfileClick} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-200">
          <UserIcon className="h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer transition-colors duration-200">
          <SettingsIcon className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-2 border-gray-200" />
        <DropdownMenuItem onClick={onLogout} className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 text-red-500 rounded-md cursor-pointer transition-colors duration-200">
          <LogOutIcon className="h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;