import { useMemo, useState } from "react";
import { FaFire, FaSearch } from "react-icons/fa";
import { TbCrown } from "react-icons/tb";

const DATA = [
  { id: 1, name: "Marco Cheng", score: 5315 },
  { id: 2, name: "mr. Arman (梦想)", score: 5288 },
  { id: 3, name: "Patteera Triamamornwooth", score: 4975 },
  { id: 4, name: "TEMA 2003", score: 4510 },
  { id: 5, name: "DhanushKumar .R", score: 4485 },
  { id: 6, name: "PythonPPP", score: 4425 },
  { id: 7, name: "Alexander Krylov", score: 4215 },
  { id: 8, name: "Wulin", score: 4040 },
  { id: 9, name: "StoatScript", score: 3960 },
  { id: 10, name: "Lado Turmanidze (Stochastic Batman)", score: 3885 },
  { id: 11, name: "N R", score: 3760 },
  { id: 12, name: "Jiongran Wang", score: 3730 },
  { id: 13, name: "Inkik H", score: 3725 },
  { id: 14, name: "hiddenneuron", score: 3685 },
  // add more...
];

function initials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const TOP_STYLES = [
  {
    bg: "linear-gradient(90deg,#f6d365,#fda085)", // gold-ish
    text: "text-black",
  },
  {
    bg: "linear-gradient(90deg,#e6e6e6,#cfcfcf)", // silver-ish
    text: "text-black",
  },
  {
    bg: "linear-gradient(90deg,#f3e3d7,#f9efe6)", // bronze/light
    text: "text-black",
  },
];

export default function LeaderboardPage() {
  const [q, setQ] = useState("");
  const [perPage] = useState(50);

  const filtered = useMemo(() => {
    const s = DATA.filter((row) =>
      row.name.toLowerCase().includes(q.trim().toLowerCase())
    ).sort((a, b) => b.score - a.score);
    return s;
  }, [q]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <h1 className="text-center text-2xl md:text-3xl font-semibold mb-6">
          Leaderboard
        </h1>

        {/* Centered column */}
        <div className="mx-auto w-full max-w-2xl">
          {/* Search bar */}
          <div className="mb-4">
            <label htmlFor="search" className="sr-only">Search users</label>
            <div className="relative">
              <input
                id="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search username..."
                className="w-full rounded-full bg-[var(--color-gray)] border border-[var(--color-border)] px-4 py-2 pr-10 placeholder:text-[var(--color-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                aria-label="Search leaderboard"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-fg)]">
                <FaSearch />
              </div>
            </div>
          </div>

          {/* header row */}
          <div className="hidden md:flex justify-between items-center text-[var(--color-fg)] text-sm px-4 py-2 rounded-t-lg border-t border-l border-r border-[var(--color-border)] bg-[transparent]">
            <div className="w-14 pl-2">Rank</div>
            <div className="flex-1">User</div>
            <div className="w-28 text-right">Flame Score</div>
          </div>

          {/* list */}
          <div className="rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm">
            <ul className="divide-y divide-[var(--color-border)]">
              {filtered.slice(0, perPage).map((row, idx) => {
                const rank = idx + 1;
                const topStyle = rank <= 3 ? TOP_STYLES[rank - 1] : null;

                return (
                  <li
                    key={row.id}
                    className={`flex items-center gap-4 px-4 py-3 md:px-6 md:py-4 transition-colors ${
                      rank <= 3 ? "" : "bg-[transparent] hover:bg-[var(--color-bg)]/5"
                    }`}
                    role="listitem"
                  >
                    {/* Rank */}
                    <div className="w-14 flex items-center justify-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm`}
                        style={
                          topStyle
                            ? { background: topStyle.bg, color: "#000" }
                            : { background: "transparent", border: "1px solid rgba(255,255,255,0.04)" }
                        }
                        aria-hidden
                      >
                        {rank <= 3 ? (
                          <span className="flex items-center gap-2">
                            <TbCrown className="text-[var(--color-bg)]" />
                            <span className={`${topStyle?.text || "text-[var(--color-fg)]"}`}>{rank}</span>
                          </span>
                        ) : (
                          <span className="text-[var(--color-fg)]">{rank}</span>
                        )}
                      </div>
                    </div>

                    {/* Avatar + name */}
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                        style={{
                          background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                          border: "1px solid rgba(255,255,255,0.03)",
                          color: "var(--color-fg)",
                        }}
                      >
                        {initials(row.name)}
                      </div>

                      <div className="min-w-0">
                        <div className="font-medium truncate">{row.name}</div>
                        {/* small extra text or country can go here */}
                        <div className="text-xs text-[var(--color-primary)] truncate"># {row.id}</div>
                      </div>
                    </div>

                    {/* score */}
                    <div className="w-28 text-right">
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.03)",
                        }}
                      >
                        <span className="font-mono">{row.score.toLocaleString()}</span>
                        <FaFire className="text-[var(--color-accent)]" />
                      </div>
                    </div>
                  </li>
                );
              })}

              {filtered.length === 0 && (
                <li className="py-8 text-center text-[var(--color-muted)]">No results found</li>
              )}
            </ul>
          </div>

          {/* footer / pagination placeholder */}
          <div className="mt-4 flex justify-between items-center text-sm text-[var(--color-fg)]">
            <div>{filtered.length} users</div>
            <div className="space-x-2">
              <button className="px-3 py-1 rounded border border-[var(--color-fg)]">Previous</button>
              <button className="px-3 py-1 rounded border border-[var(--color-fg)]">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
