import { useContext, useState } from "react";
import { AuthContext } from "../../stores/authStore";

export default function SettingsPanel({
  user,
  onSaveProfile,
  privacy,
  setPrivacy,
}) {
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    gitHubUsername: user?.gitHubUsername || "",
    linkedInProfileURL: user?.linkedInProfileURL || "",
    kaggleUsername: user?.kaggleUsername || "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const { updateUser, updatePrivacy, loading } = useContext(AuthContext);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setMsg(null);
    updateUser(form, setMsg);
  }

  async function handleSavePrivacy(e) {
    e.preventDefault();
    setMsg(null);
    updatePrivacy(privacy, setMsg);
  }

  function togglePrivacy(key) {
    setPrivacy((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <form
      onSubmit={handleSaveProfile}
      className="rounded-xl bg-zinc-800/50 border border-[var(--color-border)] p-6 shadow-sm space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold">Profile Settings</h3>
      </div>

      {msg && (
        <div
          className={`px-4 py-2 rounded ${
            msg.type === "success"
              ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]"
              : "bg-[var(--color-error)]/10 border-[var(--color-error)]"
          } border`}
        >
          <span className="text-sm text-[var(--color-fg)]">{msg.text}</span>
        </div>
      )}

      <div className="space-y-3">
        <label className="block">
          <div className="text-sm text-[var(--color-fg)] mb-1">
            Display Name
          </div>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-[var(--color-fg)]"
          />
        </label>

        <label className="block">
          <div className="text-sm text-[var(--color-fg)] mb-1">
            GitHub Username
          </div>
          <input
            name="gitHubUsername"
            value={form.gitHubUsername}
            onChange={handleChange}
            className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-[var(--color-fg)]"
          />
        </label>

        <label className="block">
          <div className="text-sm text-[var(--color-fg)] mb-1">
            LinkedIn Profile URL
          </div>
          <input
            name="linkedInProfileURL"
            value={form.linkedInProfileURL}
            onChange={handleChange}
            className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-[var(--color-fg)]"
          />
        </label>

        <label className="block">
          <div className="text-sm text-[var(--color-fg)] mb-1">
            Kaggle Username
          </div>
          <input
            name="kaggleUsername"
            value={form.kaggleUsername}
            onChange={handleChange}
            className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-[var(--color-fg)]"
          />
        </label>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-md bg-zinc-700 text-[var(--color-fg)] cursor-pointer hover:scale-102 hover:bg-zinc-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </div>
      </div>

      <hr className="border-[var(--color-border)]" />

      <div>
        <h4 className="text-lg font-semibold">Privacy Settings</h4>
        <p className="text-sm text-[var(--color-fg)] mt-1">
          Control what information is visible to other users on your profile.
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--color-fg)]">
                Email Address
              </div>
              <div className="text-xs text-[var(--color-fg)]">
                Show your email to other users
              </div>
            </div>
            {/* REPLACE the current label block with this */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy?.isEmailVisible}
                onChange={() => togglePrivacy("isEmailVisible")}
                className="sr-only"
              />

              {/* track */}
              <span
                className={`block w-12 h-6 rounded-full transition-colors duration-200 ${
                  privacy.isEmailVisible
                    ? "bg-blue-400"
                    : "bg-blue-400/10"
                }`}
                aria-hidden
              />

              {/* thumb */}
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-400 ${
                  privacy.isEmailVisible ? "translate-x-6" : "translate-x-0"
                }`}
                aria-hidden
              />

              {/* optional small label (keeps your existing On/Off text) */}
              <span className="ml-2 text-xs text-[var(--color-fg)]">
                {privacy.isEmailVisible ? "On" : "Off"}
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--color-fg)]">Social Links</div>
              <div className="text-xs text-[var(--color-fg)]">
                Display your GitHub, LinkedIn, and Kaggle profiles
              </div>
            </div>
            {/* REPLACE the current label block with this */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy?.isSocialVisible}
                onChange={() => togglePrivacy("isSocialVisible")}
                className="sr-only"
              />

              {/* track */}
              <span
                className={`block w-12 h-6 rounded-full transition-colors duration-400 ${
                  privacy.isSocialVisible
                    ? "bg-blue-400"
                    : "bg-blue-400/10"
                }`}
                aria-hidden
              />

              {/* thumb */}
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                  privacy.isSocialVisible ? "translate-x-6" : "translate-x-0"
                }`}
                aria-hidden
              />

              {/* optional small label (keeps your existing On/Off text) */}
              <span className="ml-2 text-xs text-[var(--color-fg)]">
                {privacy.isSocialVisible ? "On" : "Off"}
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--color-fg)]">Badges</div>
              <div className="text-xs text-[var(--color-fg)]">
                Let others see your earned badges
              </div>
            </div>
            {/* REPLACE the current label block with this */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy?.isBadgeVisible}
                onChange={() => togglePrivacy("isBadgeVisible")}
                className="sr-only"
              />

              {/* track */}
              <span
                className={`block w-12 h-6 rounded-full transition-colors duration-400 ${
                  privacy.isBadgeVisible
                    ? "bg-blue-400"
                    : "bg-blue-400/10"
                }`}
                aria-hidden
              />

              {/* thumb */}
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-400 ${
                  privacy.isBadgeVisible ? "translate-x-6" : "translate-x-0"
                }`}
                aria-hidden
              />

              {/* optional small label (keeps your existing On/Off text) */}
              <span className="ml-2 text-xs text-[var(--color-fg)]">
                {privacy.isBadgeVisible ? "On" : "Off"}
              </span>
            </label>
          </div>

          <div>
            <button
              type="button"
              onClick={handleSavePrivacy}
              disabled={loading}
              className="w-full px-4 py-2 rounded-md bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-fg)]  cursor-pointer hover:scale-102 hover:bg-zinc-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Privacy Settings
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
