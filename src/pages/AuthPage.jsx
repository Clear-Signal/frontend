import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MdEmail, MdVisibilityOff, MdVisibility } from "react-icons/md";
import { RiKey2Fill } from "react-icons/ri";
import { BiLogIn } from "react-icons/bi";
import Navbar from "../components/Navbar";
import { AuthContext } from "../stores/authStore";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // from your AuthContext
  const { login, register, loading, error } = useContext(AuthContext);

  // submit handler for the form
  const submitForm = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // simple client-side validation
    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }
    // basic email pattern (simple)
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setLocalError("Please enter your password.");
      return;
    }

    try {
      if (isSignup) {
        register(email.trim(), password);
      } else {
        login(email.trim(), password);
      }
    } catch (err) {
      setLocalError(err?.message || "Something went wrong. Please try again.");
    }
  };

  const handleGoogle = async () => {
    setLocalError(null);
    try {
      if (typeof window !== "undefined") {
        window.location.href = `${import.meta.env.VITE_APP_URL}/api/auth/google`;
      }
    } catch (err) {
      setLocalError("Google sign-in failed.");
    }
  };

  return (
    <>
      <main>
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] relative px-4">
          {/* Background subtle dots */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] [background-size:20px_20px]"></div>

          <div className="relative z-10 w-full max-w-md p-8 bg-[#1a1a1a] rounded-2xl shadow-lg">
            {/* Logo */}
            <div className="flex justify-center items-center mb-6">
              <img
                src="/Logo.jpg"
                alt="Clear-Signal"
                className="w-10 h-10 rounded-full"
              />
              <h1 className="text-white text-xl font-bold ml-2">
                Clear-Signal
              </h1>
            </div>

            {/* Heading */}
            <h2 className="text-center text-2xl font-bold text-white">
              {isSignup ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-center text-gray-400 mt-1 mb-4">
              {isSignup
                ? "Sign up to access your Clear-Signal profile and progress"
                : "Sign in to access your Clear-Signal profile and progress"}
            </p>

            {/* show error (local validation OR backend error from context) */}
            {(localError || error) && (
              <div className="mb-4 rounded-md bg-red-700/10 border border-red-700/30 text-red-200 px-4 py-2 text-sm">
                {localError || error}
              </div>
            )}

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2 border border-gray-700 bg-[#222] hover:bg-[#333] text-white py-2 px-4 rounded-lg transition mb-4 cursor-pointer"
            >
              <FcGoogle />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-gray-700"></div>
              <span className="px-2 text-xs text-gray-500">
                OR CONTINUE WITH EMAIL
              </span>
              <div className="flex-grow h-px bg-gray-700"></div>
            </div>

            {/* FORM */}
            <form onSubmit={submitForm} className="space-y-4" noValidate>
              {/* Email Input */}
              <div>
                <label className="flex items-center gap-2 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus-within:border-blue-500">
                  <MdEmail />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                    autoComplete="email"
                    required
                    aria-label="Email address"
                  />
                </label>
              </div>

              {/* Password Input */}
              <div>
                <label className="flex items-center gap-2 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus-within:border-blue-500">
                  <RiKey2Fill />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                    required
                    aria-label="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-gray-300 p-1 rounded hover:bg-white/5 cursor-pointer"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <MdVisibility className="text-gray-200" />
                    ) : (
                      <MdVisibilityOff className="text-gray-400" />
                    )}
                  </button>
                </label>
              </div>

              {/* Forgot password */}
              <div className="flex justify-between items-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-400 hover:text-white cursor-pointer"
                >
                  Forgot your password?
                </Link>
                {/* optional small helper */}
                <span className="text-xs text-gray-500">
                  {isSignup ? "Creating a new account" : "Sign in to continue"}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center cursor-pointer gap-2 ${
                  loading
                    ? "bg-gray-300 text-black"
                    : "bg-white text-black hover:bg-gray-200"
                } font-semibold py-2 px-4 rounded-lg transition`}
              >
                {loading ? (
                  // spinner
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                ) : (
                  <>
                    <BiLogIn />
                    {isSignup ? "Sign up" : "Sign in"}
                  </>
                )}
              </button>
            </form>

            {/* Toggle link */}
            <p className="text-center text-sm text-gray-400 mt-4">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignup((s) => !s);
                  setLocalError(null);
                }}
                className="text-white font-semibold hover:underline ml-1 cursor-pointer"
              >
                {isSignup ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
