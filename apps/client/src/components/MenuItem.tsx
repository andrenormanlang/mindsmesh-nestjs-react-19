// src/components/MenuItem.tsx

import React from "react";
import { DropdownMenuItem } from "../../@/components/ui/dropdown-menu";
import { ReactNode } from "react";

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick }) => (
  <DropdownMenuItem
    onClick={onClick}
    className="
      flex items-center 
      px-4 py-2 
      hover:bg-gray-100 dark:hover:bg-gray-700 
      cursor-pointer 
      transition-colors 
      duration-200
    "
  >
    {icon}
    <span className="ml-2">{label}</span>
  </DropdownMenuItem>
);

export default MenuItem;

