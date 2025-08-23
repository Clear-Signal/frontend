// ResetPassword.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { RiKey2Fill } from "react-icons/ri";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

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
    if (!tokenFromParams) {
      // If token not in route, attempt to read from URL later (for completeness)
      const urlToken = new URLSearchParams(window.location.search).get("token");
      if (urlToken) setToken(urlToken);
    } else {
      setToken(tokenFromParams);
    }
  }, [tokenFromParams]);

  const submit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!token) return setLocalError("Missing reset token. Use the link from your email.");
    if (password.length < 8) return setLocalError("Password must be at least 8 characters.");
    if (password !== confirm) return setLocalError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_URL || ""}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to reset password.");
      }

      setDone(true);

      // optionally clear token from URL (replace location)
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, document.title, url.toString());
      } catch (e) {}

      // after a short delay redirect to sign-in
      setTimeout(() => navigate("/sign-in", { replace: true }), 1600);
    } catch (err) {
      setLocalError(err?.message || "Reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.02)_1px,_transparent_1px)] [background-size:20px_20px] -z-10" />

      <div className="w-full max-w-md p-8 bg-[var(--card-bg)] rounded-2xl border border-[var(--color-muted)] shadow-lg">
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-default)]">Set a new password</h1>
          <p className="text-sm text-[var(--text-default)] mt-1">Enter a strong new password to regain access.</p>
        </header>

        {!token ? (
          <div className="p-4 rounded-md bg-yellow-700/10 border border-yellow-700/30 text-yellow-200">
            Missing token — please open the reset link from your email. If you have a token, append
            <code className="mx-1 px-1 rounded bg-[var(--card-bg-2)] text-xs">?token=YOUR_TOKEN</code> to the URL.
          </div>
        ) : done ? (
          <div className="text-center">
            <p className="text-[var(--text-default)] font-semibold">Password reset successful</p>
            <p className="text-sm text-[var(--text-default)] mt-2">You will be redirected to sign in...</p>
            <div className="mt-4">
              <Link to="/sign-in" className="px-4 py-2 rounded-md bg-[var(--brand)] text-[var(--bg-page)]">Go to Sign in</Link>
            </div>
          </div>
        ) : (
          <>
            {localError && (
              <div className="mb-4 rounded-md bg-red-700/10 border border-red-700/30 text-red-200 px-4 py-2 text-sm">
                {localError}
              </div>
            )}

            <form onSubmit={submit} className="space-y-4" noValidate>
              <div>
                <label className="flex items-center gap-2 bg-[var(--card-bg-2)] border border-[var(--panel-border)] rounded-lg px-3 py-2 text-[var(--text-default)]">
                  <RiKey2Fill className="text-[var(--text-default)]" />
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    required
                    aria-label="New password"
                    className="w-full bg-transparent outline-none text-[var(--text-default)] placeholder:text-[var(--text-default)]"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="text-[var(--text-default)] p-1 rounded hover:bg-white/5"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <MdVisibility className="text-[var(--text-default)]" /> : <MdVisibilityOff className="text-[var(--text-default)]" />}
                  </button>
                </label>
                <p className="mt-2 text-xs text-[var(--text-default)]">At least 8 characters recommended.</p>
              </div>

              <div>
                <label className="flex items-center gap-2 bg-[var(--card-bg-2)] border border-[var(--panel-border)] rounded-lg px-3 py-2 text-[var(--text-default)]">
                  <RiKey2Fill className="text-[var(--text-default)]" />
                  <input
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Confirm password"
                    required
                    aria-label="Confirm password"
                    className="w-full bg-transparent outline-none text-[var(--text-default)] placeholder:text-[var(--text-default)]"
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex items-center justify-center gap-2 py-2 rounded-lg font-semibold ${
                  loading ? "opacity-80 cursor-wait bg-[var(--card-bg-2)] text-[var(--text-default)]" : "bg-[var(--color-fg)] text-[var(--text-muted)] hover:brightness-95 cursor-pointer"
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
          </>
        )}
      </div>
    </main>
  );
}
