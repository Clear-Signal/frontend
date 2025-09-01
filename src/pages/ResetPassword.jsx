// ResetPassword.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { RiKey2Fill } from "react-icons/ri";
import { MdVisibility, MdVisibilityOff, MdEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";

export default function ResetPassword() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  // token can come from /reset/:token or ?token=...
  const tokenFromParams = params?.token || searchParams.get("token");
  const [token, setToken] = useState(tokenFromParams || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // if token isn't present initially, check URL (robustness for some routing setups)
    if (!tokenFromParams) {
      const urlToken = new URLSearchParams(window.location.search).get("token");
      if (urlToken) setToken(urlToken);
    } else {
      setToken(tokenFromParams);
    }
  }, [tokenFromParams]);

  const handleGoogle = () => {
    // keep same behavior as AuthPage: redirect to backend google endpoint
    try {
      if (typeof window !== "undefined") {
        window.location.href = `${import.meta.env.VITE_APP_URL || ""}/api/auth/google`;
      }
    } catch (err) {
      setLocalError("Google redirect failed.");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!token) return setLocalError("Missing reset token. Use the link from your email.");
    if (typeof password !== "string" || password.length < 8)
      return setLocalError("Password must be at least 8 characters.");
    if (password !== confirm) return setLocalError("Passwords do not match.");

    setLoading(true);
    try {
      const url = `${import.meta.env.VITE_APP_URL}/api/auth/reset-password/${token}`;

      const res = await axios.post(
        url,
        { newPassword: password },
        { withCredentials: true }
      );

      // if backend returns non-2xx axios would throw, so here we consider success
      setDone(true);

      // clear token from URL for cleanliness (don't rely on this being critical)
      try {
        const u = new URL(window.location.href);
        u.searchParams.delete("token");
        // Also remove potential path param by pushing replaced location (only modifies history)
        window.history.replaceState({}, document.title, u.toString());
      } catch (e) {
        // ignore
      }

      // redirect to sign-in after short delay so user sees success
      setTimeout(() => navigate("/sign-in", { replace: true }), 1400);
    } catch (err) {
      // axios error handling
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Reset failed. Try again.";
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] relative px-4">
        {/* Background subtle dots */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] [background-size:20px_20px] -z-10"></div>

        <div className="relative z-10 w-full max-w-md p-8 bg-[#1a1a1a] rounded-2xl shadow-lg">
          {/* Logo */}
          <div className="flex justify-center items-center mb-6">
            <img src="/Logo.jpg" alt="Clear-Signal" className="w-10 h-10 rounded-full" />
            <h1 className="text-white text-xl font-bold ml-2">Clear-Signal</h1>
          </div>

          {/* Heading */}
          <h2 className="text-center text-2xl font-bold text-white">Reset your password</h2>
          <p className="text-center text-gray-400 mt-1 mb-4">
            Enter a strong new password to regain access.
          </p>

          {/* Errors */}
          {localError && (
            <div className="mb-4 rounded-md bg-red-700/10 border border-red-700/30 text-red-200 px-4 py-2 text-sm">
              {localError}
            </div>
          )}

          {/* Success state */}
          {done && (
            <div className="mb-4 rounded-md bg-green-700/10 border border-green-700/30 text-green-200 px-4 py-2 text-sm">
              Password reset successful — redirecting to sign in...
            </div>
          )}

          {/* Google button shown even for reset flow */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 border border-gray-700 bg-[#222] hover:bg-[#333] text-white py-2 px-4 rounded-lg transition mb-4 cursor-pointer"
            aria-label="Continue with Google"
          >
            <FcGoogle />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-700"></div>
            <span className="px-2 text-xs text-gray-500">OR CONTINUE WITH EMAIL</span>
            <div className="flex-grow h-px bg-gray-700"></div>
          </div>

          {/* Missing token note */}
          {!token ? (
            <div className="p-4 rounded-md bg-yellow-700/10 border border-yellow-700/30 text-yellow-200">
              Missing token — open the reset link from your email. If you have a token, append
              <code className="mx-1 px-1 rounded bg-[#111] text-xs">?token=YOUR_TOKEN</code> to the URL.
            </div>
          ) : done ? (
            <div className="text-center">
              <p className="text-white font-semibold">Password reset successful</p>
              <p className="text-sm text-gray-400 mt-2">You will be redirected to sign in...</p>
              <div className="mt-4">
                <Link to="/sign-in" className="px-4 py-2 rounded-md bg-white text-black font-medium">
                  Go to Sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div>
                <label className="flex items-center gap-2 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus-within:border-blue-500">
                  <RiKey2Fill />
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    required
                    aria-label="New password"
                    className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="text-gray-300 p-1 rounded hover:bg-white/5"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <MdVisibility className="text-gray-200" /> : <MdVisibilityOff className="text-gray-400" />}
                  </button>
                </label>
                <p className="mt-2 text-xs text-gray-500">At least 8 characters recommended.</p>
              </div>

              <div>
                <label className="flex items-center gap-2 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-gray-300 focus-within:border-blue-500">
                  <RiKey2Fill />
                  <input
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm password"
                    required
                    aria-label="Confirm password"
                    className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  <span>Reseting for token:</span>
                  <div className="truncate max-w-xs text-xs text-gray-500">{token}</div>
                </div>

                <Link to="/sign-in" className="text-sm text-gray-400 hover:text-white">
                  Back to sign in
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg font-semibold ${
                  loading ? "opacity-80 cursor-wait bg-[#111] text-gray-300" : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                ) : (
                  "Set new password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
