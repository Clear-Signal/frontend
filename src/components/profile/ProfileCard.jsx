import { CiLogout } from "react-icons/ci";
import { FaFire } from "react-icons/fa";
import { initialsFromName } from "../../utils/helper";

export default function ProfileCard({ user, stats, onLogout }) {
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
