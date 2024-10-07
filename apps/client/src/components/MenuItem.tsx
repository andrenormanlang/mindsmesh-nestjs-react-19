
// src/components/MenuItem.tsx

import React from "react";
import { DropdownMenuItem } from "../../@/shadcn/ui/dropdown-menu";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick }) => (
  <DropdownMenuItem onClick={onClick} className="menuItem">
    {icon}
    <span className="ml-2">{label}</span>
  </DropdownMenuItem>
);

export default MenuItem;
