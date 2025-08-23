import { useContext, useEffect, useState } from "react";
import { FaCog, FaListUl } from "react-icons/fa";
import { AuthContext } from "../stores/authStore";
import SettingsPanel from "../components/profile/SettingPanel";
import ProblemsPanel from "../components/profile/ProblemPanel";
import ProfileCard from "../components/profile/ProfileCard";

const emptyStats = {
  problemsSolved: 0,
  currentStreakDays: 0,
  favoriteCategory: "N/A",
  flameScore: 0,
  difficultyPreference: { easy: 0, medium: 0, hard: 0 },
  badges: [],
};


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
              className={`px-4 py-2 rounded-md border border-[var(--color-border)] cursor-pointer ${activeTab === "problems" ? "bg-[var(--color-gray)]/10" : "bg-[var(--color-bg)]"}`}
            >
              <span className="inline-flex items-center gap-2"><FaListUl /> Problems</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-md border border-[var(--color-border)] cursor-pointer ${activeTab === "settings" ? "bg-[var(--color-gray)]/10" : "bg-[var(--color-bg)] "}`}
            >
              <span className="inline-flex items-center gap-2"><FaCog /> Settings</span>
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