import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "../../public/Logo.jpg";
import { CiLogin } from "react-icons/ci";
import { LiaDiscord } from "react-icons/lia";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[var(--color-bg)] p-1 shadow-md border-b-[1px] border-cyan-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-10 h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={Logo}
              alt="Clear Signal Logo"
              className="h-8 mr-2 rounded-full"
            />
            <h1 className="text-[var(--color-fg)] text-xl md:text-2xl font-bold min-w-[150px] text-wrap">
              Clear Signal
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden w-full lg:flex space-x-6 items-center justify-between">
            <div className="flex gap-4">
              <Link
                to="/"
                className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]"
              >
                Home
              </Link>
              <Link
                to="/problems"
                className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]"
              >
                Problems
              </Link>
              <Link
                to="/collections"
                className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]"
              >
                Collections
              </Link>
              <Link
                to="/leaderboard"
                className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]"
              >
                Leaderboard
              </Link>
            </div>
            <div className="flex gap-4">
              <Link
                to="/sign-in"
                className="px-4 py-1 flex items-center rounded-3xl border-1 text-[var(--color-fg)] bg-[var(--color-gray)] hover:opacity-90"
              >
                <CiLogin className="mr-1" />
                Login
              </Link>
              <Link
                to="/subscription"
                className="px-4 py-1 rounded-3xl text-[var(--color-warning)] border border-[var(--color-warning)] hover:bg-[var(--color-warning)] hover:text-[var(--color-bg)]"
              >
                Premium
              </Link>
              <Link
                to="https://discord.gg"
                className="text-[var(--color-fg)] hover:text-[var(--color-primary)] flex items-center"
              >
                <LiaDiscord className="mr-1 text-3xl" />
              </Link>
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
            <Link
              to="/sign-in"
              className="text-sm px-2 py-1 flex items-center rounded-3xl border-1 text-[var(--color-fg)] bg-[var(--color-gray)] hover:opacity-90"
            >
              <CiLogin className="mr-1" />
              Login
            </Link>
            <Link
              to="/subscription"
              className="text-sm px-2 py-1 rounded-3xl text-[var(--color-warning)] border border-[var(--color-warning)] hover:bg-[var(--color-secondary)] hover:text-[var(--color-bg)]"
            >
              Premium
            </Link>
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[var(--color-fg)] focus:outline-none"
            >
              {isOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-[var(--color-muted)] px-4 pb-4 space-y-3">
          <Link
            to="/"
            className="block text-[var(--color-fg)] hover:text-[var(--color-secondary)]"
          >
            Home
          </Link>
          <Link
            to="/problems"
            className="block text-[var(--color-fg)] hover:text-[var(--color-secondary)]"
          >
            Problems
          </Link>
          <Link
            to="/collections"
            className="block text-[var(--color-fg)] hover:text-[var(--color-secondary)]"
          >
            Collections
          </Link>
          <Link
            to="/leaderboard"
            className="block text-[var(--color-fg)] hover:text-[var(--color-secondary)]"
          >
            Leaderboard
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
