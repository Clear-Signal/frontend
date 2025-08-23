import { useContext, useState } from "react";
import { AuthContext } from "../../stores/authStore";

export default function SettingsPanel({ user, onSaveProfile, privacy, setPrivacy }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    gitHubUsername: user?.gitHubUsername || "",
    linkedInProfileURL: user?.linkedInProfileURL || "",
    kaggleUsername: user?.kaggleUsername || "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const {updateUser, loading} = useContext(AuthContext);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setMsg(null);
    updateUser(form, setMsg);
  }

  function togglePrivacy(key) {
    setPrivacy((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <form onSubmit={handleSaveProfile} className="rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Profile Settings</h3>
      </div>

      {msg && (
        <div className={`px-4 py-2 rounded ${msg.type === "success" ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]" : "bg-[var(--color-error)]/10 border-[var(--color-error)]"} border`}>
          <span className="text-sm text-[var(--color-fg)]">{msg.text}</span>
        </div>
      )}

      <div className="space-y-3">
        <label className="block">
          <div className="text-sm text-[var(--color-fg)] mb-1">Display Name</div>
          <input name="fullName" value={form.fullName} onChange={handleChange}
            className="w-full rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-fg)]" />
        </label>

        <label className="block">
          <div className="text-sm text-[var(--color-fg)] mb-1">GitHub Username</div>
          <input name="gitHubUsername" value={form.gitHubUsername} onChange={handleChange}
            className="w-full rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-fg)]" />
        </label>

        <label className="block">
          <div className="text-sm text-[var(--color-fg)] mb-1">LinkedIn Profile URL</div>
          <input name="linkedInProfileURL" value={form.linkedInProfileURL} onChange={handleChange}
            className="w-full rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-fg)]" />
        </label>

        <label className="block">
          <div className="text-sm text-[var(--color-fg)] mb-1">Kaggle Username</div>
          <input name="kaggleUsername" value={form.kaggleUsername} onChange={handleChange}
            className="w-full rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-fg)]" />
        </label>

        <div>
          <button type="submit" disabled={loading}
            className="w-full px-4 py-2 rounded-md bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-fg)]">
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </div>
      </div>

      <hr className="border-[var(--color-border)]" />

      <div>
        <h4 className="text-lg font-semibold">Privacy Settings</h4>
        <p className="text-sm text-[var(--color-fg)] mt-1">Control what information is visible to other users on your profile.</p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--color-fg)]">Email Address</div>
              <div className="text-xs text-[var(--color-fg)]">Show your email to other users</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={privacy.showEmail} onChange={() => togglePrivacy("showEmail")} className="sr-only" />
              <span className={`w-10 h-6 rounded-full block transition ${privacy.showEmail ? "bg-[var(--color-primary)]" : "bg-[var(--color-bg)]/40"}`}></span>
              <span className="ml-2 text-xs text-[var(--color-fg)]">{privacy.showEmail ? "On" : "Off"}</span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--color-fg)]">Social Links</div>
              <div className="text-xs text-[var(--color-fg)]">Display your GitHub, LinkedIn, and Kaggle profiles</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={privacy.showSocial} onChange={() => togglePrivacy("showSocial")} className="sr-only" />
              <span className={`w-10 h-6 rounded-full block transition ${privacy.showSocial ? "bg-[var(--color-primary)]" : "bg-[var(--color-bg)]/40"}`}></span>
              <span className="ml-2 text-xs text-[var(--color-fg)]">{privacy.showSocial ? "On" : "Off"}</span>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-[var(--color-fg)]">Badges</div>
              <div className="text-xs text-[var(--color-fg)]">Let others see your earned badges</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={privacy.showBadges} onChange={() => togglePrivacy("showBadges")} className="sr-only" />
              <span className={`w-10 h-6 rounded-full block transition ${privacy.showBadges ? "bg-[var(--color-primary)]" : "bg-[var(--color-bg)]/40"}`}></span>
              <span className="ml-2 text-xs text-[var(--color-fg)]">{privacy.showBadges ? "On" : "Off"}</span>
            </label>
          </div>

          <div>
            <button type="button" onClick={() => setTimeout(() => {}, 250)} className="w-full px-4 py-2 rounded-md bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-fg)]">
              Save Privacy Settings
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}