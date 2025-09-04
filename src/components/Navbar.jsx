import { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSignOutAlt,
  FaBell,
  FaFire,
} from "react-icons/fa";
import Logo from "../../public/Logo.jpg";
import { CiLogin } from "react-icons/ci";
import { LiaDiscord } from "react-icons/lia";
import ThemeToggle from "./ThemeToggle";
import { AuthContext } from "../stores/authStore";
import NotificationModal from "./NotificationModal";
import FireLottie from "./FireLottie";

const Navbar = ({ activeNav, setActiveNav }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const profileRef = useRef(null);
  const profileBtnRef = useRef(null);
  const location = useLocation();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [location]);

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
      // close profile dropdown if click outside of it
      if (
        isProfileOpen &&
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        profileBtnRef.current &&
        !profileBtnRef.current.contains(e.target)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isProfileOpen]);

  // close profile dropdown on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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

  const userLabel = user?.name || user?.username || user?.email || "Profile";

  return (
    <nav className="font-code py-2 bg-[var(--color-bg-black)] border-b border-[var(--color-gray)]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo */}
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setActiveNav("Home")}
          >
            <img
              src={Logo}
              alt="Logo"
              className="h-9 w-9 rounded-full object-cover border border-[var(--panel-border)]"
            />
            <h1 className="text-[var(--text-default)] text-lg font-semibold hidden sm:inline">
              PixelBank
            </h1>
          </Link>

          {/* Center: primary nav (desktop only) */}
          <div className="hidden lg:flex lg:items-center lg:gap-8 flex-1 pl-6">
            <div className="flex gap-6 items-center">
              <Link
                to="/problems"
                className={`transition text-lg cursor-pointer hover:text-[var(--text-default)] ${
                  activeNav === "Problems"
                    ? "text-[var(--text-default)] underline"
                    : "text-[var(--text-gray)]"
                }`}
                onClick={() => setActiveNav("Problems")}
              >
                Problems
              </Link>

              <Link
                to="/collections"
                className={`transition text-lg cursor-pointer hover:text-[var(--text-default)] ${
                  activeNav === "Collections"
                    ? "text-[var(--text-default)] underline"
                    : "text-[var(--text-gray)]"
                }`}
                onClick={() => setActiveNav("Collections")}
              >
                Collections
              </Link>

              <Link
                to="/leaderboard"
                className={`transition text-lg cursor-pointer hover:text-[var(--text-default)] ${
                  activeNav === "Leaderboard"
                    ? "text-[var(--text-default)] underline"
                    : "text-[var(--text-gray)]"
                }`}
                onClick={() => setActiveNav("Leaderboard")}
              >
                Leaderboard
              </Link>

              {/* <Link
                to="/signal0"
                className={`transition text-lg cursor-pointer hover:text-[var(--text-default)] ${
                  activeNav === "Signal-0"
                    ? "text-[var(--text-default)] underline"
                    : "text-[var(--text-gray)]"
                }`}
                onClick={() => setActiveNav("Signal-0")}
              >
                Pixel-0
              </Link> */}
            </div>
          </div>

          {/* Right: actions (desktop) */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">
            {/* Flame + count */}
            <div className="flex justify-center items-center gap-2 px-3 py-1 rounded-full">
              <FireLottie size={26} />
              <span className="text-lg  font-medium text-[var(--text-default)]">
                {user?.data?.flameScore || 0}
              </span>
            </div>

            {/* Premium pill */}
            {!user?.data?.hasPremiumAccess && (
              <Link
                to="/subscription"
                className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-3"
              >
                <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 text-black border border-yellow-600 shadow-sm">
                  Premium
                </span>
              </Link>
            )}

            {/* Avatar (circular) with dropdown */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  ref={profileBtnRef}
                  onClick={() => setIsProfileOpen((s) => !s)}
                  aria-expanded={isProfileOpen}
                  aria-controls="profile-menu"
                  className="w-10 h-10 rounded-full overflow-hidden border border-[var(--panel-border)] flex items-center justify-center cursor-pointer"
                >
                  {user?.data?.profilePic ? (
                    <img
                      src={user.data.profilePic}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="text-[var(--text-default)] text-xl" />
                  )}
                </button>

                {/* Dropdown */}
                {isProfileOpen && (
                  <div
                    id="profile-menu"
                    role="menu"
                    aria-label="Profile menu"
                    className="absolute -right-18 p-2 mt-2 w-44 rounded-md shadow-lg border border-[var(--panel-border)] bg-[var(--card-bg)] z-50 cursor-pointer"
                  >
                    <div className="py-1">
                      <Link
                        to={`/profile/${user?.data?._id}`}
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 rounded-md text-sm text-[var(--text-default)] hover:bg-zinc-700"
                        role="menuitem"
                      >
                        Profile
                      </Link>
                      {/* <Link
                        to="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 rounded-md text-sm text-[var(--text-default)] hover:bg-zinc-700"
                        role="menuitem"
                      >
                        Dashboard
                      </Link> */}
                      <button
                        onClick={() => {
                          logout && logout();
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 rounded-md text-sm text-[var(--text-default)] hover:bg-zinc-700 flex items-center gap-2"
                        role="menuitem"
                      >
                        <FaSignOutAlt />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  className="flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--panel-border)] bg-gray-400 text-sm"
                >
                  <CiLogin />
                  <span className="font-semibold">Login</span>
                </Link>

                <div className="p-2 rounded-full">
                  <ThemeToggle />
                </div>
              </>
            )}

            {/* Bell */}
            {user && (
              <button className="p-2 rounded-full hover:bg-[var(--card-bg)] transition cursor-pointer">
                <FaBell
                  className="text-[var(--text-default)]"
                  onClick={() => setIsNotificationOpen(true)}
                />
              </button>
            )}

            {/* Discord */}
            {user && (
              <a
                href="https://discord.gg"
                className="p-2 rounded-full hover:bg-[var(--card-bg)] transition"
              >
                <LiaDiscord className="text-[var(--text-default)] text-lg" />
              </a>
            )}

            {/* Theme toggle (if user exists, already rendered above within user block previously; keep consistent) */}
            {!user ? null : (
              <div className="p-2 rounded-full">
                <ThemeToggle />
              </div>
            )}
          </div>

          {/* Mobile actions (visible on small screens) */}
          <div className="flex items-center lg:hidden gap-2">
            {user ? (
              <Link
                to={`/profile/${user?.data?._id}`}
                className="flex items-center gap-2 bg-gray-300 px-2 py-1 rounded-full text-sm"
                onClick={() => setIsOpen(false)}
              >
                <FaUserCircle />
                <span className="truncate max-w-[80px]">{userLabel}</span>
              </Link>
            ) : (
              <Link
                to="/sign-in"
                className="text-[var(--text-default)] bg-[var(--card-bg)] px-3 py-1 rounded-full flex items-center gap-2 text-sm"
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
              className="p-2 rounded-md text-[var(--text-default)] focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
            >
              {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (slide down) */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`lg:hidden transition-all duration-200 ease-in-out origin-top ${
          isOpen ? "max-h-screen" : "max-h-0 overflow-hidden"
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-4 bg-[var(--card-bg)] border-t border-[var(--panel-border)]">
          {/* Mobile user area */}
          <div className="flex items-center justify-between px-2">
            {user ? (
              <div className="flex items-center gap-3">
                <FaUserCircle className="text-[var(--text-default)] text-2xl" />
                <div>
                  <Link
                    to={`/profile/${user?.data?._id}`}
                    onClick={() => setIsOpen(false)}
                    className="text-[var(--text-default)] font-semibold"
                  >
                    {userLabel}
                  </Link>
                  <div className="text-xs text-[var(--text-muted)] truncate max-w-[180px]">
                    {user?.email}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Link
                  to="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="text-[var(--text-default)] font-semibold"
                >
                  Sign in
                </Link>
              </div>
            )}

            {user ? (
              <button
                onClick={() => {
                  logout && logout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-[var(--text-default)] text-[var(--bg-page)] hover:opacity-95 cursor-pointer"
                aria-label="Logout"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            ) : (
              <>
                {user?.data?.hasPremiumAccess && (
                  <Link
                    to="/subscription"
                    onClick={() => setIsOpen(false)}
                    className="text-sm px-3 py-1 rounded-full border border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-[var(--bg-page)] transition"
                  >
                    Premium
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block text-[var(--text-default)] px-3 py-2 rounded-md hover:bg-[var(--bg-page)]/10"
            >
              Home
            </Link>
            <Link
              to="/problems"
              onClick={() => setIsOpen(false)}
              className="block text-[var(--text-default)] px-3 py-2 rounded-md hover:bg-[var(--bg-page)]/10"
            >
              Problems
            </Link>
            <Link
              to="/collections"
              onClick={() => setIsOpen(false)}
              className="block text-[var(--text-default)] px-3 py-2 rounded-md hover:bg-[var(--bg-page)]/10"
            >
              Collections
            </Link>
            {/* <Link
              to="/signal0"
              onClick={() => setIsOpen(false)}
              className="block text-[var(--text-default)] px-3 py-2 rounded-md hover:bg-[var(--bg-page)]/10"
            >
              Pixel-0
            </Link> */}
            <Link
              to="/leaderboard"
              onClick={() => setIsOpen(false)}
              className="block text-[var(--text-default)] px-3 py-2 rounded-md hover:bg-[var(--bg-page)]/10"
            >
              Leaderboard
            </Link>
          </div>

          <div className="border-t border-[var(--panel-border)] pt-4 flex flex-col gap-3">
            {!user && (
              <Link
                to="/sign-in"
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-4 py-2 rounded-full bg-[var(--card-bg)] text-[var(--text-default)]"
              >
                <div className="flex items-center justify-center gap-2">
                  <CiLogin /> Sign in
                </div>
              </Link>
            )}

            {user && (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full text-center px-4 py-2 rounded-full border border-[var(--panel-border)] text-[var(--text-default)]"
              >
                View Profile
              </Link>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a
                  href="https://discord.gg"
                  className="text-[var(--text-default)] hover:text-[var(--brand)] transition"
                >
                  <LiaDiscord className="text-xl" />
                </a>
              </div>

              <div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
      {isNotificationOpen && (
        <NotificationModal
          message="No notifications yet."
          onClose={() => setIsNotificationOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
