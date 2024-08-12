import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../@/components/ui/dialog';
import { Button } from '../../@/components/ui/button';
import LoginForm from './LoginForm';  // Refactored login form component
import RegisterForm from './RegisterForm'; // Refactored register form component

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          MindsMesh
        </Link>
        <div className="hidden md:flex space-x-4">
          {/* Login Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-white">Login</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              
              <LoginForm /> {/* Using the refactored LoginForm component */}
            </DialogContent>
          </Dialog>

          {/* Register Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="text-white">Register</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Register</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new account.
                </DialogDescription>
              </DialogHeader>
              <RegisterForm /> {/* Using the refactored RegisterForm component */}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
