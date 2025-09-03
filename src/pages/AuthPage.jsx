import { useState, useContext, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { MdEmail, MdVisibilityOff, MdVisibility } from "react-icons/md";
import { RiKey2Fill } from "react-icons/ri";
import { BiLogIn } from "react-icons/bi";
import { AuthContext } from "../stores/authStore";
import axios from "axios";

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(null);

  const { login, register, loading, error, user, navigate } = useContext(AuthContext);

  const submitForm = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setForgotSuccess(null);

    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }
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
        await register(email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
    } catch (err) {
      setLocalError(err?.message || "Something went wrong. Please try again.");
    }
  };

  const handleGoogle = async () => {
    setLocalError(null);
    try {
      if (typeof window !== "undefined") {
        window.location.href = `${
          import.meta.env.VITE_APP_URL
        }/api/auth/google`;
      }
    } catch (err) {
      setLocalError("Google sign-in failed.");
    }
  };

  const submitForgot = async (e) => {
    e?.preventDefault();
    setLocalError(null);
    setForgotSuccess(null);

    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return;
    }
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(email)) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    setForgotLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_APP_URL}/api/auth/forgot-password`,
        {
          email: email.trim(),
        },{withCredentials: true}
      );
      if (res.data?.message) {
        setForgotSuccess(res.data.message);
      }
    } catch (err) {
      setLocalError(err?.message || "Failed to request password reset.");
    } finally {
      setForgotLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);


  return (
    <>
      <main>
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] relative px-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] [background-size:20px_20px]"></div>
          <div className="flex flex-col ">
            <div className="flex justify-center items-center mb-6">
              <img
                src="/Logo.jpg"
                alt="PixelBank"
                className="w-10 h-10 rounded-full"
              />
              <h1 className="text-white text-2xl font-bold ml-2">
                PixelBank
              </h1>
            </div>
            <div className="relative z-10 w-full max-w-md p-8 bg-[#1a1a1a] rounded-2xl shadow-lg">
              <h2 className="text-center text-2xl font-bold text-white">
                {isForgot
                  ? "Reset your password"
                  : isSignup
                  ? "Create an account"
                  : "Welcome back"}
              </h2>
              <p className="text-center text-gray-400 mt-1 mb-4">
                {isForgot
                  ? "Enter the email tied to your account and we'll send reset instructions."
                  : isSignup
                  ? "Sign up to access your Pixel Bank profile and progress"
                  : "Sign in to access your Pixel Bank profile and progress"}
              </p>

              {(localError || (!isForgot && error)) && (
                <div className="mb-4 rounded-md bg-red-700/10 border border-red-700/30 text-red-200 px-4 py-2 text-sm">
                  {localError || error}
                </div>
              )}

              {isForgot && forgotSuccess && (
                <div className="mb-4 rounded-md bg-green-700/10 border border-green-700/30 text-green-200 px-4 py-2 text-sm">
                  {forgotSuccess}
                </div>
              )}

              {/* GOOGLE BUTTON VISIBLE FOR ALL VIEWS */}
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2 border border-gray-700 bg-[#222] hover:bg-[#333] text-white py-2 px-4 rounded-lg transition mb-4 cursor-pointer"
              >
                <FcGoogle />
                Continue with Google
              </button>

              {/* Divider visible for all views */}
              <div className="flex items-center my-4">
                <div className="flex-grow h-px bg-gray-700"></div>
                <span className="px-2 text-xs text-gray-500">
                  OR CONTINUE WITH EMAIL
                </span>
                <div className="flex-grow h-px bg-gray-700"></div>
              </div>

              <form
                onSubmit={isForgot ? submitForgot : submitForm}
                className="space-y-4"
                noValidate
              >
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

                {!isForgot && (
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
                )}

                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgot((f) => !f);
                      setLocalError(null);
                      setForgotSuccess(null);
                    }}
                    className="text-sm text-gray-400 hover:text-white cursor-pointer"
                  >
                    {isForgot ? "Back to sign in" : "Forgot your password?"}
                  </button>

                  <span className="text-xs text-gray-500">
                    {isForgot
                      ? "We'll email reset instructions"
                      : isSignup
                      ? "Creating a new account"
                      : "Sign in to continue"}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isForgot ? forgotLoading : loading}
                  className={`w-full flex items-center justify-center cursor-pointer gap-2 ${
                    (isForgot ? forgotLoading : loading)
                      ? "bg-gray-300 text-black"
                      : "bg-white text-black hover:bg-gray-200"
                  } font-semibold py-2 px-4 rounded-lg transition`}
                >
                  {isForgot ? (
                    forgotLoading ? (
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
                      "Send reset email"
                    )
                  ) : loading ? (
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

              {!isForgot && (
                <p className="text-center text-sm text-gray-400 mt-4">
                  {isSignup
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
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
              )}

              {isForgot && !forgotSuccess && (
                <p className="text-center text-sm text-gray-400 mt-4">
                  Or go back and{" "}
                  <button
                    onClick={() => {
                      setIsForgot(false);
                      setLocalError(null);
                      setForgotSuccess(null);
                    }}
                    className="text-white font-semibold hover:underline ml-1 cursor-pointer"
                  >
                    sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
