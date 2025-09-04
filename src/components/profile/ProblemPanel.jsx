import { FaMedal, FaRegStar } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function ProblemsPanel({ stats }) {
  const easy = (stats?.easyQuestionsSolved * 100) / (stats?.totalQuestionsSolved ?? 1) || 0;
  const medium = (stats?.mediumQuestionsSolved * 100) / (stats?.totalQuestionsSolved ?? 1) || 0;
  const hard = (stats?.hardQuestionsSolved * 100) / (stats?.totalQuestionsSolved ?? 1) || 0;

  return (
    <div className="rounded-xl bg-zinc-800/50 border border-[var(--color-border)] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Difficulty Preference</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-green-400">Easy</span>
            <span className="text-xs text-green-400">{easy}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-zinc-700">
            <div className="h-1 rounded-full bg-green-400" style={{ width: `${easy}%`}} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-amber-400">Medium</span>
            <span className="text-xs text-amber-400">{medium}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-zinc-700">
            <div className="h-1 rounded-full bg-amber-400" style={{ width: `${medium}%`}} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-red-400">Hard</span>
            <span className="text-xs text-red-400">{hard}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-zinc-700">
            <div className="h-1 rounded-full bg-red-400" style={{ width: `${hard}%`}} />
          </div>
        </div>
      </div>

      {/* Badges area */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Badges Earned</h4>
          <div className="text-sm text-[var(--color-fg)] px-3 py-1 rounded-xl bg-zinc-800 border border-[var(--color-border)]">
            {stats?.badges?.length ?? 0} Badges
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-zinc-900 p-8 border border-[var(--color-border)] text-center">
          {(!stats?.badges || stats?.badges?.length === 0) ? (
            <>
              <FaRegStar className="mx-auto text-3xl text-[var(--color-fg)] mb-4" />
              <p className="text-[var(--color-fg)] font-semibold mb-2">No badges earned yet</p>
              <p className="text-sm text-[var(--color-fg)] mb-4">Complete collections to earn badges</p>
              <Link to="/collections" className="inline-block px-4 py-2 rounded-md text-[var(--text-default)] bg-[var(--color-bg)] hover:bg-[var(--color-surface)] font-semibold">
                Explore Collections
              </Link>
            </>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {stats?.badges?.map((b, i) => (
                <div key={i} className="p-4 bg-zinc-700 rounded-md border border-[var(--color-border)]">
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