import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          MindsMesh
        </Link>
        <div className="hidden md:flex space-x-4">
          <Link to="/" className={`text-white ${location.pathname === '/' ? 'underline' : ''}`}>Home</Link>
          <Link to="/login" className={`text-white ${location.pathname === '/login' ? 'underline' : ''}`}>Login</Link>
          <Link to="/register" className={`text-white ${location.pathname === '/register' ? 'underline' : ''}`}>Register</Link>
        </div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
            Menu
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <Link to="/" className="block text-white p-2" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/login" className="block text-white p-2" onClick={() => setIsOpen(false)}>Login</Link>
          <Link to="/register" className="block text-white p-2" onClick={() => setIsOpen(false)}>Register</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

