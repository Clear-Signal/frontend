import { CiLogout } from "react-icons/ci";
import { FaFire } from "react-icons/fa";
import { initialsFromName } from "../../utils/helper";
import FireLottie from "../FireLottie";

const ProfileCardSkeleton = () => (
  <aside className="lg:col-span-4">
    <div className="rounded-xl bg-zinc-800/50 border border-[var(--color-border)] p-6 shadow-sm animate-pulse">
      <div className="h-14 bg-zinc-700 rounded-full mb-6 w-3/4"></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 rounded-lg bg-zinc-800 border border-[var(--color-border)]"></div>
        <div className="h-24 rounded-lg bg-zinc-800 border border-[var(--color-border)]"></div>
        <div className="col-span-2 h-20 rounded-lg bg-zinc-800 border border-[var(--color-border)]"></div>
        <div className="col-span-2 h-28 rounded-xl bg-zinc-800 border border-[var(--color-border)]"></div>
      </div>
      <div className="mt-6 h-12 w-full rounded-lg bg-zinc-800 border border-[var(--color-border)]"></div>
    </div>
  </aside>
);

export default function ProfileCard({ auth, user, onLogout, response }) {
  // 1. Fetch stats using your custom hook
  const { data: stats, loading, error } = response;
  console.log("Fetched stats:", stats);

  // 2. Handle loading and error states
  if (loading) {
    return <ProfileCardSkeleton />;
  }

  if (error) {
    return (
      <div className="lg:col-span-4 flex justify-center items-center rounded-xl bg-zinc-900/50 border border-zinc-700 p-6 text-center">
        <p className="font-semibold">Could not load profile stats.</p>
        <p className="text-sm text-red-300">{error.message}</p>
      </div>
    );
  }

  // Fallback if the fetch is successful but returns no data
  if (!stats) {
    return (
      <div className="lg:col-span-4 rounded-xl bg-zinc-800/50 border border-[var(--color-border)] p-6 text-center">
        <p>No stats available for this user.</p>
      </div>
    );
  }

  // 3. Prepare user info (no changes here)
  const avatar = user?.profilePic || null;
  const fullName = user?.fullName || user?.email || "User";

  return (
    <aside className="lg:col-span-4">
      <div className="rounded-xl bg-zinc-800/50 border border-[var(--color-border)] p-6 shadow-sm flex flex-col gap-6">
        {/* Top Section */}
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
            <p className="text-sm text-[var(--color-fg)] truncate">
              {user?.email}
            </p>
            {user?.rank && (
              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--color-fg)]">
                <span className="text-[var(--color-fg)]">🏆</span>
                <span>Rank {user.rank}</span>
              </div>
            )}
          </div>
        </div>

        {/* Small stat grid with updated data mapping */}
        <div className="grid grid-cols-2 gap-4 ">
          <div className="rounded-lg p-4 bg-zinc-800 border border-[var(--color-border)] hover:-translate-y-1 hover:bg-zinc-700 transition duration-300">
            <p className="text-xs text-[var(--color-fg)]">Problems Solved</p>
            <div className="text-2xl font-bold mt-2 text-[var(--color-fg)]">
              {stats.totalQuestionsSolved}
            </div>
          </div>

          <div className="rounded-lg p-4 bg-zinc-800 border border-[var(--color-border)] hover:-translate-y-1 hover:bg-zinc-700 transition duration-300">
            <p className="text-xs text-[var(--color-fg)]">Current Streak</p>
            <div className="text-2xl font-bold mt-2 text-[var(--color-fg)]">
              {stats.currentStreak} days
            </div>
          </div>

          <div className="col-span-2 rounded-lg p-6 bg-zinc-800 border border-[var(--color-border)] flex items-center justify-between hover:-translate-y-1 hover:bg-zinc-700 transition duration-300">
            <div>
              <p className="text-xs text-[var(--color-fg)]">
                Favorite Category
              </p>
              <div className="text-lg font-semibold mt-2 text-[var(--color-fg)]">
                {stats.favoriteCategory || "N/A"} {/* Placeholder */}
              </div>
            </div>
          </div>

          <div className="col-span-2 rounded-xl border bg-zinc-800 border-[var(--color-border)] flex items-center justify-between hover:-translate-y-1 hover:bg-zinc-700 transition duration-300">
            <div className="flex-1 p-4 rounded-l ">
              <p className="text-xs text-[var(--color-fg)]">
                Maximum Flame Score Attained
              </p>
              <div className="text-3xl font-bold mt-2 flex items-center gap-3 text-[var(--color-fg)]">
                <FireLottie size={36} />
                <span>{stats.flameScore || 0}</span> {/* Placeholder */}
              </div>
              <div className="text-xs text-[var(--color-fg)] mt-1">
                Low Score
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        {auth?.user?.data?._id === user?._id && onLogout && (
          <div>
            <button
              onClick={() => onLogout && onLogout()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-zinc-800 hover:bg-red-800/50 border border-[var(--color-border)] text-[var(--color-fg)] hover:scale-105 transition duration-500 cursor-pointer"
            >
              <CiLogout className="text-[var(--color-fg)]" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
