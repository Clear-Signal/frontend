// ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MdEmail } from "react-icons/md";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    const trimmed = email.trim();
    if (!trimmed) return setLocalError("Please enter your email address.");
    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(trimmed)) return setLocalError("Enter a valid email address.");

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_URL || ""}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to request password reset.");
      }

      setSent(true);
    } catch (err) {
      setLocalError(err?.message || "Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4 py-12">
      {/* subtle dotted background like your auth page */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.02)_1px,_transparent_1px)] [background-size:20px_20px]" />

      <div className="w-full max-w-md p-8 bg-[var(--card-bg-2)] rounded-2xl border border-[var(--color-muted)] shadow-lg">
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-default)]">Reset your password</h1>
          <p className="text-sm text-[var(--text-default)] mt-1">
            Enter the email associated with your account and we'll send a link to reset your password.
          </p>
        </header>

        {localError && (
          <div className="mb-4 rounded-md bg-red-700/10 border border-red-700/30 text-red-200 px-4 py-2 text-sm">
            {localError}
          </div>
        )}

        {sent ? (
          <div className="text-center">
            <p className="text-[var(--text-default)] font-semibold">Check your email</p>
            <p className="text-sm text-[var(--text-default)] mt-2">
              If that address exists in our system, you’ll receive a reset link shortly.
            </p>
            <Link to="/sign-in" className="inline-block mt-6 px-4 py-2 rounded-md bg-[var(--brand)] text-[var(--bg-page)]">
              Back to Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4">
            <label className="flex items-center gap-2 bg-[var(--color-elevated)] border border-[var(--color-muted)] rounded-lg px-3 py-2 text-[var(--text-default)]">
              <MdEmail className="text-[var(--text-default)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                aria-label="Email address"
                className="w-full bg-transparent outline-none text-[var(--text-default)] placeholder:text-[var(--text-default)]"
                autoComplete="email"
              />
            </label>

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
                "Send reset link"
              )}
            </button>

            <div className="text-center text-sm text-[var(--text-default)]">
              Remembered? <Link to="/sign-in" className="text-[var(--brand)]">Sign in</Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
