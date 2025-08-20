import { use, useContext, useEffect, useState } from "react";
import { FaFire, FaRegStar, FaMedal, FaCog, FaListUl } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { AuthContext } from "../stores/authStore";
import { Link } from "react-router-dom";

/* ---------- helpers ---------- */
function initialsFromName(name) {
  if (!name) return "U";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1][0] || "")).toUpperCase();
}

const emptyStats = {
  problemsSolved: 0,
  currentStreakDays: 0,
  favoriteCategory: "N/A",
  flameScore: 0,
  difficultyPreference: { easy: 0, medium: 0, hard: 0 },
  badges: [],
};

/* ---------- Profile card (left) ---------- */
function ProfileCard({ user, stats, onLogout }) {
  const avatar = user?.profilePic || null;
  const fullName =
    user?.fullName ||
    (user?.email || "User");

  return (
    <aside className="lg:col-span-4">
      <div className="rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] p-6 shadow-sm flex flex-col gap-6">
        {/* Top */}
        <div className="flex items-center gap-4">
          {avatar ? (
            <img
              src={avatar}
              alt={fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-border)]"
            />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--color-bg)] text-[var(--color-fg)] font-semibold border-2 border-[var(--color-border)]">
              {initialsFromName(fullName)}
            </div>
          )}

          <div className="min-w-0">
            <h3 className="text-lg font-bold truncate">{fullName}</h3>
            <p className="text-sm text-[var(--color-fg)] truncate">{user?.email}</p>
            {user?.rank && (
              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-fg)]">
                <span className="text-[var(--color-fg)]">🏆</span>
                <span>Rank {user.rank}</span>
              </div>
            )}
          </div>
        </div>

        {/* Small stat grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg p-4 bg-[var(--color-bg)] border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-fg)]">Problems Solved</p>
            <div className="text-2xl font-bold mt-2 text-[var(--color-fg)]">
              {stats.problemsSolved}
            </div>
          </div>

          <div className="rounded-lg p-4 bg-[var(--color-bg)] border border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-fg)]">Current Streak</p>
            <div className="text-2xl font-bold mt-2 text-[var(--color-fg)]">
              {stats.currentStreakDays} days
            </div>
          </div>

          <div className="col-span-2 rounded-lg p-6 bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--color-fg)]">Favorite Category</p>
              <div className="text-sm font-semibold mt-2 text-[var(--color-fg)]">
                {stats.favoriteCategory}
              </div>
            </div>
          </div>

          <div className="col-span-2 rounded-xl p-4 border border-[var(--color-border)] flex items-center justify-between" style={{ backgroundColor: "transparent" }}>
            <div className="flex-1 p-4 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
              <p className="text-xs text-[var(--color-fg)]">Maximum Flame Score Attained</p>
              <div className="text-3xl font-bold mt-2 flex items-center gap-3 text-[var(--color-fg)]">
                <FaFire className="text-[var(--color-accent)]" />
                <span>{stats.flameScore}</span>
              </div>
              <div className="text-xs text-[var(--color-fg)] mt-1">Low Score</div>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => onLogout && onLogout()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-muted)] hover:bg-[var(--color-bg)]/60 border border-[var(--color-border)] text-[var(--color-fg)]"
          >
            <CiLogout className="text-[var(--color-fg)]" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

/* ---------- Problems panel (right) ---------- */
function ProblemsPanel({ stats }) {
  const easy = stats.difficultyPreference?.easy ?? 0;
  const medium = stats.difficultyPreference?.medium ?? 0;
  const hard = stats.difficultyPreference?.hard ?? 0;

  return (
    <div className="rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Difficulty Preference</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--color-fg)]/90">Easy</span>
            <span className="text-xs text-[var(--color-secondary)]">{easy}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--color-bg)]/40 border border-[var(--color-border)]">
            <div className="h-2 rounded-full" style={{ width: `${easy}%`, background: "var(--color-secondary)" }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--color-fg)]/90">Medium</span>
            <span className="text-xs text-[var(--color-warning)]">{medium}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--color-bg)]/40 border border-[var(--color-border)]">
            <div className="h-2 rounded-full" style={{ width: `${medium}%`, background: "var(--color-warning)" }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-[var(--color-fg)]/90">Hard</span>
            <span className="text-xs text-[var(--color-error)]">{hard}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[var(--color-bg)]/40 border border-[var(--color-border)]">
            <div className="h-2 rounded-full" style={{ width: `${hard}%`, background: "var(--color-error)" }} />
          </div>
        </div>
      </div>

      {/* Badges area */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Badges Earned</h4>
          <div className="text-sm text-[var(--color-fg)] px-3 py-1 rounded-full bg-[var(--color-bg)]/60 border border-[var(--color-border)]">
            {stats.badges?.length ?? 0} Badges
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-[var(--color-bg)] p-8 border border-[var(--color-border)] text-center">
          {(!stats.badges || stats.badges.length === 0) ? (
            <>
              <FaRegStar className="mx-auto text-3xl text-[var(--color-fg)] mb-4" />
              <p className="text-[var(--color-fg)] font-semibold mb-2">No badges earned yet</p>
              <p className="text-sm text-[var(--color-fg)] mb-4">Complete collections to earn badges</p>
              <Link to="/collections" className="inline-block px-4 py-2 rounded-md bg-[var(--color-warning)] text-[var(--color-muted)] font-semibold">
                Explore Collections
              </Link>
            </>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {stats.badges.map((b, i) => (
                <div key={i} className="p-4 bg-[var(--color-bg)] rounded-md border border-[var(--color-border)]">
                  <FaMedal className="text-[var(--color-accent)]" />
                  <div className="mt-2 text-sm text-[var(--color-fg)]">{b.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Settings panel (right) ---------- */
function SettingsPanel({ user, onSaveProfile, privacy, setPrivacy }) {
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

/* ---------- Main Profile page (combines left + right + tabs) ---------- */
export default function ProfilePage({ initialUser }) {
  const auth = useContext(AuthContext);
  const user = initialUser || auth?.user?.data || null;
  const logout = auth?.logout;

  const [activeTab, setActiveTab] = useState("problems"); // 'problems' | 'settings'
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(false);
  const [privacy, setPrivacy] = useState({
    showEmail: true,
    showSocial: true,
    showBadges: true,
  });

  console.log(user);

  // fetch stats (replace endpoint as needed)
  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/user/${encodeURIComponent(user._id)}/stats`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setStats((s) => ({ ...s, ...data }));
      })
      .catch(() => {
        if (!cancelled) setStats(emptyStats);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => (cancelled = true);
  }, [user?._id]);

  // save profile handler (from SettingsPanel)
  function handleSaveProfile(updated) {
    // set optimistic UI; send to server if you want
    setStats((s) => ({ ...s }));
    // TODO: call backend to persist profile
  }

  return (
    <div className="min-h-[80vh] px-6 py-8 bg-[var(--color-bg)] text-[var(--color-fg)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <ProfileCard user={user} stats={stats} onLogout={logout} />

        <main className="lg:col-span-8">
          {/* top tabs */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setActiveTab("problems")}
              className={`px-4 py-2 rounded-md border border-[var(--color-border)] ${activeTab === "problems" ? "bg-[var(--color-bg)]/30" : "bg-[var(--color-bg)]/10"}`}
            >
              <span className="inline-flex items-center gap-2 cursor-pointer"><FaListUl /> Problems</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-md border border-[var(--color-border)] ${activeTab === "settings" ? "bg-[var(--color-bg)]/30" : "bg-[var(--color-bg)]/10"}`}
            >
              <span className="inline-flex items-center gap-2 cursor-pointer"><FaCog /> Settings</span>
            </button>
          </div>

          {/* active panel */}
          <div>
            {activeTab === "problems" ? (
              <ProblemsPanel stats={stats} />
            ) : (
              <SettingsPanel user={user} onSaveProfile={handleSaveProfile} privacy={privacy} setPrivacy={setPrivacy} />
            )}
            {loading && <div className="mt-3 text-sm text-[var(--color-fg)]">Loading stats...</div>}
          </div>
        </main>
      </div>
    </div>
  );
}