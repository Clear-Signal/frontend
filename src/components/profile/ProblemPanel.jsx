import { FaMedal, FaRegStar } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ProblemsPanel({ stats }) {
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