import { useMemo, useState } from "react";
import { FaFire } from "react-icons/fa";
import useFetch from "../hooks/useFetch";
import LoadingScreen from "../components/LoadingScreen";

// Helper function to get initials from a name or email
function initials(name) {
  if (!name || typeof name !== 'string') return "U";
  const trimmedName = name.trim();
  if (!trimmedName.includes(' ') && trimmedName.includes('@')) {
    return trimmedName[0].toUpperCase();
  }
  const parts = trimmedName.split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0]).toUpperCase();
}

// Styles for the top 3 ranks
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
  // const [perPage] = useState(50); // ❌ Removed perPage state

  const { data: apiResponse, loading, error } = useFetch("/api/general/ranking/all");
  const rankings = useMemo(() => apiResponse?.rankings || [], [apiResponse]);

  const filtered = useMemo(() => {
    if (!rankings) return [];
    const query = q.trim().toLowerCase();
    if (!query) return rankings;
    return rankings.filter((row) => {
        const name = (row.fullName || '').toLowerCase();
        const email = (row.email || '').toLowerCase();
        return name.includes(query) || email.includes(query);
    });
  }, [q, rankings]);
  
  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
        <div className="min-h-screen bg-[var(--color-bg-black)] text-center text-red-400 py-12">
            <h1 className="text-2xl">Failed to load leaderboard data.</h1>
            <p>{error.message}</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-black)] text-[var(--color-fg)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-center text-2xl md:text-3xl font-semibold mb-6">
          Leaderboard
        </h1>
        <div className="mx-auto w-full border-1 border-[var(--panel-border)] bg-zinc-900 py-6 px-8 rounded-2xl max-w-2xl">
          <div className="w-full flex flex-row justify-evenly items-center text-[var(--color-light-gray)] text-sm px-4 py-2 ">
            <div className="flex-1 text-center">Rank</div>
            <div className="flex-grow text-left ml-20">User</div>
            <div className="flex-1 text-right">Flame Score</div>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-sm">
            <ul>
              {/* ❌ Removed .slice(0, perPage) to show all users */}
              {filtered.map((row) => {
                const { rank, fullName, email, flameScore } = row;
                const topStyle = rank <= 3 ? TOP_STYLES[rank - 1] : null;
                const displayName = fullName || email;

                return (
                  <li
                    key={rank}
                    className={`flex items-center m-4 rounded-xl gap-8 px-4 py-3 md:px-6 md:py-4 transition-colors cursor-pointer hover:scale-101 hover:shadow-xl ${
                      rank <= 3 ? "" : "bg-[var(--color-bg-gray)]"
                    }`}
                    role="listitem"
                    style={topStyle ? { background: topStyle.bg, color: "#000" } : {}}
                  >
                    <div className="w-14 flex items-center justify-center">
                      <div className={`w-10 h-10 flex items-center justify-center font-semibold text-sm`}>
                        {rank <= 3 ? (
                          <span className={`flex items-center gap-2 ${topStyle?.text || "text-[var(--color-fg)]"}`}>
                            {rank}
                          </span>
                        ) : (
                          <span className="text-2xl text-[var(--color-fg)]">{rank}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                          rank <= 3 ? "bg-black/20 text-black" : "bg-zinc-700 text-[var(--color-fg)]"
                        }`}
                      >
                        {initials(displayName)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold truncate">{displayName}</div>
                      </div>
                    </div>
                    <div className="w-28 text-right">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          rank <= 3 ? "bg-black/20" : "bg-zinc-700"
                        }`}
                      >
                        <span className="font-mono">{flameScore.toLocaleString()}</span>
                        <FaFire className={rank <= 3 ? "text-orange-800" : "text-[var(--color-accent)]"} />
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

          {/* ❌ Removed pagination footer */}
        </div>
      </div>
    </div>
  );
}