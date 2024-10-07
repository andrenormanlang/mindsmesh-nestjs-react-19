import { Link, useNavigate } from "react-router-dom";
import React, { useState, useContext, useEffect } from "react";
import { logout } from "../services/MindsMeshAPI";
import { User } from "../types/types";
import { Button } from "../../@/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "../../@/shadcn/ui/dropdown-menu";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../@/shadcn/ui/dialog";
import {
  PersonIcon,
  ExitIcon,
  LockClosedIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import EditProfileForm from "./EditProfileForm";
import logo from "../assets/logo.svg";
import { UserContext } from "../contexts/UserContext";
import { useGradient } from "../contexts/GradientContext";
import MenuItem from "./MenuItem";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const { toggleGradient } = useGradient();

  if (!userContext) {
    throw new Error("UserContext must be used within a UserProvider");
  }

  const { user, setUser, refreshUser } = userContext;

  // State for mobile menu and dialogs
  const [menuOpen, setMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuOpen]);

  return (
    <nav
      className={`navbar   p-2 h-16  top-0 z-50 transition-colors duration-500`}
    >
      <div className="navbarContent container mx-auto flex justify-between items-center">
        {/* Logo and Brand Name */}
        <Link to="/" className="navbarTitle text-white text-xl font-bold flex items-center">
          {logo && <img src={logo} alt="MindsMesh" className="h-10 mr-2" />}
          <span className="hidden sm:inline"></span>
        </Link>

        {/* Menu Items and Theme Toggle */}
        <div className="flex items-center space-x-4">
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="text-white flex items-center"
                    variant="ghost"
                    aria-label="User menu"
                  >
                    Welcome, {user.username}!
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="dropdownMenuContent bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md shadow-lg w-48"
                  sideOffset={5}
                >
                  <MenuItem
                    icon={
                      <PersonIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    }
                    label="Profile"
                    onClick={() => setIsProfileOpen(true)}
                  />
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <MenuItem
                    icon={
                      <ExitIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    }
                    label="Logout"
                    onClick={handleLogout}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* Login Dialog */}
                <Dialog
                  open={isLoginDialogOpen}
                  onOpenChange={setIsLoginDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-white flex items-center"
                    >
                      <LockClosedIcon className="h-5 w-5 mr-1" /> Login
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] transition-transform duration-200 ease-in-out transform opacity-0 data-[state=open]:opacity-100">
                    <DialogHeader>
                      <DialogTitle>Login</DialogTitle>
                    </DialogHeader>
                    <LoginForm />
                  </DialogContent>
                </Dialog>

                {/* Register Dialog */}
                <Dialog
                  open={isRegisterDialogOpen}
                  onOpenChange={setIsRegisterDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-white flex items-center"
                    >
                      <Pencil1Icon className="h-5 w-5 mr-1" /> Register
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] transition-transform duration-200 ease-in-out transform opacity-0 data-[state=open]:opacity-100">
                    <DialogHeader>
                      <DialogTitle>Register</DialogTitle>
                    </DialogHeader>
                    <RegisterForm onClose={() => setIsRegisterDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>

          {/* Gradient Toggle Button */}
          <button
            onClick={toggleGradient}
            className="bg-blue-500 text-white px-4 py-2 rounded transition-all duration-300 hover:bg-blue-600"
          >
            Toggle Gradient
          </button>
          
          

          {/* Mobile Menu Toggle */}
          <div className="hamburgerIcon md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`bar bar1 ${menuOpen ? 'rotate45' : ''}`}></div>
            <div className={`bar bar2 ${menuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`bar bar3 ${menuOpen ? 'rotate-45' : ''}`}></div>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Only display on mobile */}
      <div className={`mobileMenu md:hidden ${menuOpen ? 'active' : ''}`}>
        {user ? (
          <>
            <Button
              variant="ghost"
              className="text-white w-full flex items-center justify-center hover:bg-gray-700 rounded-md py-3 transition-colors duration-200"
              onClick={() => {
                setMenuOpen(false);
                setIsProfileOpen(true);
              }}
            >
              <PersonIcon className="h-5 w-5 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              className="text-white w-full flex items-center justify-center hover:bg-gray-700 rounded-md py-3 transition-colors duration-200"
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
            >
              <ExitIcon className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <>
            {/* Mobile Login Dialog */}
            <Dialog
              open={isLoginDialogOpen}
              onOpenChange={(isOpen) => {
                setIsLoginDialogOpen(isOpen);
                if (isOpen) setMenuOpen(false);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white w-full flex items-center justify-center hover:bg-gray-700 rounded-md py-3 transition-colors duration-200"
                >
                  <LockClosedIcon className="h-5 w-5 mr-2" />
                  Login
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] transition-transform duration-200 ease-in-out transform opacity-0 data-[state=open]:opacity-100">
                <DialogHeader>
                  <DialogTitle>Login</DialogTitle>
                </DialogHeader>
                <LoginForm />
              </DialogContent>
            </Dialog>

            {/* Mobile Register Dialog */}
            <Dialog
              open={isRegisterDialogOpen}
              onOpenChange={(isOpen) => {
                setIsRegisterDialogOpen(isOpen);
                if (isOpen) setMenuOpen(false);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-white w-full flex items-center justify-center hover:bg-gray-700 rounded-md py-3 transition-colors duration-200"
                >
                  <Pencil1Icon className="h-5 w-5 mr-2" />
                  Register
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] transition-transform duration-200 ease-in-out transform opacity-0 data-[state=open]:opacity-100">
                <DialogHeader>
                  <DialogTitle>Register</DialogTitle>
                </DialogHeader>
                <RegisterForm onClose={() => setIsRegisterDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {/* Profile Edit Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[425px] transition-transform duration-200 ease-in-out transform opacity-0 data-[state=open]:opacity-100">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          {user && (
            <EditProfileForm
              user={user}
              onClose={() => setIsProfileOpen(false)}
              setUser={(updatedUser: User) => {
                setUser(updatedUser);
                setIsProfileOpen(false);
                refreshUser();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
