import { useContext, useEffect, useState } from "react";
import { FaCog, FaListUl } from "react-icons/fa";
import { AuthContext } from "../stores/authStore";
import SettingsPanel from "../components/profile/SettingPanel";
import ProblemsPanel from "../components/profile/ProblemPanel";
import ProfileCard from "../components/profile/ProfileCard";
import useFetch from "../hooks/useFetch";
import LoadingScreen from "../components/LoadingScreen";

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

  const navigate = auth?.navigate;

  const [activeTab, setActiveTab] = useState("problems"); // 'problems' | 'settings'
  const [privacy, setPrivacy] = useState({
    showEmail: true,
    showSocial: true,
    showBadges: true,
  });

  const response = useFetch("/api/user/stats");
  const { data: stats, loading, error } = response;

  // console.log(user);
  // save profile handler (from SettingsPanel)
  function handleSaveProfile(updated) {
    setStats((s) => ({ ...s }));
  }

  useEffect(() => {
    if(!user) navigate("/sign-in");
  }, [user]);

  if(loading || !user) return <LoadingScreen />;

  return (
    <div className="min-h-[80vh] px-6 py-8 bg-[#18181B] text-[var(--color-fg)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <ProfileCard user={user} onLogout={logout} response={response} />

        <main className="lg:col-span-8">
          {/* top tabs */}
          <div className="flex justify-center items-center gap-3 mb-6">
            <button
              onClick={() => setActiveTab("problems")}
              className={`px-4 py-2 rounded-lg border border-[var(--color-border)] cursor-pointer ${activeTab === "problems" ? "bg-zinc-800" : "bg-zinc-800/50"}`}
            >
              <span className="inline-flex items-center gap-2"><FaListUl /> Problems</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-lg border border-[var(--color-border)] cursor-pointer ${activeTab === "settings" ? "bg-zinc-800" : "bg-zinc-800/50"}`}
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