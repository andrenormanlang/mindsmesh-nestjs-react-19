import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile, logout } from "../services/SkillShareAPI";
import { User } from "../types/types";
import { Button } from '../../@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from  '../../@/components/ui/dialog';
import { HamburgerMenuIcon, Cross1Icon } from "@radix-ui/react-icons";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";


const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        if (!profile) {
          throw new Error("No profile data found");
        }
        console.log("Fetched profile", profile);
        setUser(profile);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        handleLogout(); // Optional: Log out user if fetching profile fails
      }
    };

    fetchProfile();
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
                <DropdownMenuItem onClick={() => navigate("/profile")}>
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
                  navigate("/profile");
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
      )}
    </nav>
  );
};

export default Navbar;
