import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "../../public/Logo.jpg"; // Assuming you have a logo image

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[var(--color-bg)] p-1 shadow-md border-b-[1px] border-cyan-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="Clear Signal Logo" className="h-8 mr-2 rounded-full" />
            <h1 className="text-[var(--color-fg)] text-2xl font-bold">
              Clear Signal
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/" className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]">
              Home
            </Link>
            <Link to="/problems" className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]">
              Problems
            </Link>
            <Link to="/collections" className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]">
              Collections
            </Link>
            <Link to="/leaderboard" className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]">
              Leaderboard
            </Link>
            <Link
              to="/login"
              className="px-3 py-1 rounded-md text-[var(--color-bg)] bg-[var(--color-accent)] hover:opacity-90"
            >
              Login
            </Link>
            <Link
              to="/subscription"
              className="px-3 py-1 rounded-md text-[var(--color-secondary)] border border-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-bg)]"
            >
              Premium   
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[var(--color-fg)] focus:outline-none"
            >
              {isOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[var(--color-muted)] px-4 pb-4 space-y-3">
          <Link to="/" className="block text-[var(--color-fg)] hover:text-[var(--color-secondary)]">
            Home
          </Link>
          <Link to="/problems" className="block text-[var(--color-fg)] hover:text-[var(--color-secondary)]">
            Problems
          </Link>
          <Link to="/collections" className="block text-[var(--color-fg)] hover:text-[var(--color-secondary)]">
            Collections
          </Link>
          <Link to="/leaderboard" className="block text-[var(--color-fg)] hover:text-[var(--color-secondary)]">
            Leaderboard
          </Link>
          <Link
            to="/login"
            className="block px-3 py-1 rounded-md text-[var(--color-bg)] bg-[var(--color-accent)] hover:opacity-90"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="block px-3 py-1 rounded-md text-[var(--color-secondary)] border border-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-bg)]"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
