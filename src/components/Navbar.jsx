import { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import Logo from "../../public/Logo.jpg";
import { CiLogin } from "react-icons/ci";
import { LiaDiscord } from "react-icons/lia";
import ThemeToggle from "./ThemeToggle";
import { AuthContext } from "../stores/authStore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const location = useLocation();

  const { user, logout } = useContext(AuthContext);

  // Close menu when route changes (so the menu doesn't stay open after navigation)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close menu when clicking outside (on mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close mobile menu on desktop resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // helper: display name fallback
  const userLabel = user?.name || user?.username || user?.email || "Profile";

  return (
    <nav className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={Logo}
              alt="Clear Signal Logo"
              className="h-8 w-8 rounded-full object-cover"
            />
            <h1 className="text-[var(--color-fg)] text-lg md:text-xl font-bold sm:min-w-[150px]">
              Clear Signal
            </h1>
          </Link>

          {/* Desktop menu */}
          <div className="hidden lg:flex lg:items-center lg:gap-8 w-full">
            <div className="flex gap-6 items-center">
              <Link to="/" className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]">Home</Link>
              <Link to="/problems" className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]">Problems</Link>
              <Link to="/collections" className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]">Collections</Link>
              <Link to="/leaderboard" className="text-[var(--color-fg)] hover:text-[var(--color-secondary)]">Leaderboard</Link>
            </div>

            <div className="ml-auto flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-[var(--color-fg)] hover:text-[var(--color-secondary)]"
                  >
                    {/* If you have user.avatar, use <img src={user.avatar} .../> */}
                    <FaUserCircle className="text-[var(--color-fg)]" />
                    <span className="hidden sm:inline">{userLabel}</span>
                  </Link>
                  <button
                    onClick={() => logout && logout()}
                    className="text-[var(--color-fg)] hover:text-[var(--color-secondary)] cursor-pointer"
                    aria-label="Logout"
                  >
                    <FaSignOutAlt />
                  </button>
                </>
              ) : (
                <Link
                  to="/sign-in"
                  className="flex items-center gap-2 px-4 py-1 rounded-full bg-[var(--color-muted)] text-[var(--color-fg)] hover:opacity-90"
                >
                  <CiLogin /> <span className="hidden sm:inline">Login</span>
                </Link>
              )}

              <Link
                to="/subscription"
                className="px-4 py-1 rounded-full text-[var(--color-warning)] border border-[var(--color-warning)] hover:bg-[var(--color-warning)] hover:text-[var(--color-bg)] transition"
              >
                Premium
              </Link>

              <a href="https://discord.gg" className="text-[var(--color-fg)] hover:text-[var(--color-primary)]">
                <LiaDiscord className="text-2xl" />
              </a>

              <ThemeToggle />
            </div>
          </div>

          {/* Mobile actions (visible on small screens) */}
          <div className="flex items-center lg:hidden gap-2">
            {user ? (
              // show a compact profile button on mobile when logged in
              <Link
                to="/profile"
                className="flex items-center gap-2 text-[var(--color-fg)] bg-[var(--color-muted)] px-3 py-1 rounded-full text-sm"
                onClick={() => setIsOpen(false)}
              >
                <FaUserCircle />
                <span className="truncate max-w-[80px]">{userLabel}</span>
              </Link>
            ) : (
              <Link
                to="/sign-in"
                className="text-[var(--color-fg)] bg-[var(--color-muted)] px-3 py-1 rounded-full flex items-center gap-2 text-sm"
              >
                <CiLogin />
                <span>Login</span>
              </Link>
            )}

            <button
              ref={btnRef}
              onClick={() => setIsOpen((s) => !s)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="p-2 rounded-md text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (slide down) */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`lg:hidden transition-all duration-200 ease-in-out origin-top ${isOpen ? "max-h-screen" : "max-h-0 overflow-hidden"}`}
      >
        <div className="px-4 pt-4 pb-6 space-y-4 bg-[var(--color-muted)] border-t border-[var(--color-border)]">
          {/* Mobile user area */}
          <div className="flex items-center justify-between px-2">
            {user ? (
              <div className="flex items-center gap-3">
                <FaUserCircle className="text-[var(--color-fg)] text-2xl" />
                <div>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="text-[var(--color-fg)] font-semibold">
                    {userLabel}
                  </Link>
                  <div className="text-xs text-[var(--color-muted)] truncate">{user?.email}</div>
                </div>
              </div>
            ) : (
              <div>
                <Link to="/sign-in" onClick={() => setIsOpen(false)} className="text-[var(--color-fg)] font-semibold">
                  Sign in
                </Link>
              </div>
            )}

            {/* quick logout / login action */}
            {user ? (
              <button
                onClick={() => {
                  logout && logout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-[var(--color-fg)] hover:bg-[var(--color-fg)]/80 cursor-pointer"
                aria-label="Logout"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <Link
                to="/subscription"
                onClick={() => setIsOpen(false)}
                className="text-sm px-3 py-1 rounded-full border border-[var(--color-warning)] text-[var(--color-warning)] hover:bg-[var(--color-warning)] hover:text-[var(--color-bg)]"
              >
                Premium
              </Link>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="block text-[var(--color-fg)] px-3 py-2 rounded-md hover:bg-[var(--color-bg)]/20">Home</Link>
            <Link to="/problems" onClick={() => setIsOpen(false)} className="block text-[var(--color-fg)] px-3 py-2 rounded-md hover:bg-[var(--color-bg)]/20">Problems</Link>
            <Link to="/collections" onClick={() => setIsOpen(false)} className="block text-[var(--color-fg)] px-3 py-2 rounded-md hover:bg-[var(--color-bg)]/20">Collections</Link>
            <Link to="/leaderboard" onClick={() => setIsOpen(false)} className="block text-[var(--color-fg)] px-3 py-2 rounded-md hover:bg-[var(--color-bg)]/20">Leaderboard</Link>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4 flex flex-col gap-3">
            {!user && (
              <Link to="/sign-in" onClick={() => setIsOpen(false)} className="w-full text-center px-4 py-2 rounded-full bg-[var(--color-muted)] text-[var(--color-fg)]">
                <div className="flex items-center justify-center gap-2">
                  <CiLogin /> Sign in
                </div>
              </Link>
            )}

            {user && (
              <Link to="/profile" onClick={() => setIsOpen(false)} className="w-full text-center px-4 py-2 rounded-full border border-[var(--color-border)] text-[var(--color-fg)]">
                View Profile
              </Link>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a href="https://discord.gg" className="text-[var(--color-fg)] hover:text-[var(--color-primary)]">
                  <LiaDiscord className="text-xl" />
                </a>
                {/* add other social icons if needed */}
              </div>

              <div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
