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
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0]).toUpperCase();
}

const TOP_STYLES = [
  {
    bg: "linear-gradient(90deg, #FFD700, #FFCC66)", // gold
    text: "text-black text-semibold text-2xl",
  },
  {
    bg: "linear-gradient(90deg, #E6E6E6, #C0C0C0)", // silver
    text: "text-black text-semibold text-2xl",
  },
  {
    bg: "linear-gradient(90deg, #F5F5DC, #EED9C4)", // bronze / beige
    text: "text-black text-semibold text-2xl",
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
    <div className="min-h-screen bg-[var(--color-bg-black)] text-[var(--color-fg)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <h1 className="text-center text-2xl md:text-3xl font-semibold mb-6">
          Leaderboard
        </h1>

        {/* Centered column */}
        <div className="mx-auto w-full border-1 border-[var(--panel-border)] bg-zinc-900 py-6 px-8 rounded-2xl max-w-2xl">
          {/* Search bar */}
         
 
          {/* header row */}
          <div className="w-full flex flex-row justify-evenly items-center text-[var(--color-light-gray)] text-sm px-4 py-2 ">
            <div className="flex-1 text-center">Rank</div>
            <div className="flex-2 text-center">User</div>
            <div className="flex-3 text-right">Flame Score</div>
          </div>

          {/* list */}
          <div className="rounded-xl overflow-hidden shadow-sm">
            <ul className="">
              {filtered.slice(0, perPage).map((row, idx) => {
                const rank = idx + 1;
                const topStyle = rank <= 3 ? TOP_STYLES[rank - 1] : null;

                return (
                  <li
                    key={row.id}
                    className={`flex items-center m-4 rounded-xl gap-8 px-4 py-3 md:px-6 md:py-4 transition-colors cursor-pointer hover:scale-101 hover:shadow-xl ${
                      rank <= 3 ? "" : "bg-[var(--color-bg-gray)]"
                    }`}
                    role="listitem"
                    style={
                          topStyle
                            ? { background: topStyle.bg, color: "#000" }
                            : {}
                        }
                  >
                    {/* Rank */}
                    <div className="w-14 flex items-center justify-center">
                      <div
                        className={`w-10 h-10  flex items-center justify-center font-semibold text-sm`}
                        aria-hidden
                      >
                        {rank <= 3 ? (
                          <span className="flex items-center gap-2">
                            <span className={`${topStyle?.text || "text-[var(--color-fg)]"}`}>{rank}</span>
                          </span>
                        ) : (
                          <span className="text-2xl text-[var(--color-fg)]">{rank}</span>
                        )}
                      </div>
                    </div>

                    {/* Avatar + name */}
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${rank <= 3 ? "bg-gray/20 text-black" : "bg-gray  text-[var(--color-fg)]"}`}
                      >
                        {initials(row.name)}
                      </div>

                      <div className="min-w-0">
                        <div className="font-bold truncate">{row.name}</div>
                        {/* small extra text or country can go here */}
                      </div>
                    </div>

                    {/* score */}
                    <div className="w-28 text-right">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${rank<=3 ? "bg-gray/20" : "bg-gray"}`}
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
