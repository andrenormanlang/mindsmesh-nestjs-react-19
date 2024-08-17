import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile, getUserById, logout } from "../services/SkillShareAPI";
import { User } from "../types/types";
import { Button } from '../../@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from  '../../@/components/ui/dialog';
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import EditProfileForm from "./EditProfileForm";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State for profile modal

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getProfile();
        const userId = profile.id;  // This is your user ID
        const fullUserData = await getUserById(userId);
        console.log('Fetched User Data:', fullUserData);
        setUser(fullUserData);
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchData();
  }, []);
  
  const handleLogout = async () => {
    await logout(); // Assume logout function removes token and handles other cleanup
    setUser(null); // Reset the user state
    navigate("/"); // Redirect to home page
  };

  return (
    <nav className="bg-gray-800 p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          MindsMesh
        </Link>
        <div className="hidden md:flex space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="text-white" variant="ghost">
                  Welcome, {user.username}!
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white">
                <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-white">
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                  </DialogHeader>
                  <LoginForm />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-white">
                    Register
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Register</DialogTitle>
                  </DialogHeader>
                  <RegisterForm />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
        {/* Mobile menu toggle */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            className="text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <Cross1Icon className="h-6 w-6" /> : <HamburgerMenuIcon className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col space-y-2 mt-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                className="text-white"
                onClick={() => {
                  setMenuOpen(false);
                  setIsProfileOpen(true);
                }}
              >
                Profile
              </Button>
              <Button
                variant="ghost"
                className="text-white"
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                  </DialogHeader>
                  <LoginForm />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w/[425px]">
                  <DialogHeader>
                    <DialogTitle>Register</DialogTitle>
                  </DialogHeader>
                  <RegisterForm />
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      )}
      {/* Profile Edit Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w/[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          {user && <EditProfileForm user={user} onClose={() => setIsProfileOpen(false)} />}
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navbar;
