import { useContext, useMemo, useState } from "react";
import { FaBook, FaChartLine } from "react-icons/fa";
import { AuthContext } from "../stores/authStore";
import MiniCalendar from "../components/MiniCalendar";

const problems = [
  { id: 176, title: "Chi-square Probability Distribution", difficulty: "medium", category: "Probability", status: "New" },
  { id: 1, title: "Matrix-Vector Dot Product", difficulty: "easy", category: "Linear Algebra", status: "Unsolved" },
  { id: 2, title: "Transpose of a Matrix", difficulty: "easy", category: "Linear Algebra", status: "Unsolved" },
  { id: 3, title: "Reshape Matrix", difficulty: "easy", category: "Linear Algebra", status: "Unsolved" },
  { id: 4, title: "Calculate Mean by Row or Column", difficulty: "easy", category: "Linear Algebra", status: "Unsolved" },
  { id: 6, title: "Calculate Eigenvalues of a Matrix", difficulty: "medium", category: "Linear Algebra", status: "Unsolved" },
  { id: 12, title: "Singular Value Decomposition (SVD)", difficulty: "hard", category: "Linear Algebra", status: "Unsolved" },
];

const difficultyStyle = {
  easy: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
  medium: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
  hard: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
};

const difficultyColor = {
  easy: { bg: "var(--color-secondary)", text: "var(--color-bg)" }, // green-ish
  medium: { bg: "var(--color-warning)", text: "var(--color-bg)" }, // yellow-ish
  hard: { bg: "var(--color-error)", text: "var(--color-bg)" },     // red-ish
};

export default function ProblemsPage() {
  const [view, setView] = useState("table"); // "table" or "graph"
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");

  const {navigate} = useContext(AuthContext);

  const categories = useMemo(() => {
    const s = new Set(problems.map((p) => p.category));
    return ["All", ...Array.from(s)];
  }, []);

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (difficulty !== "all" && p.difficulty !== difficulty) return false;
      if (category !== "all" && p.category !== category) return false;
      if (query && !p.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [query, difficulty, category]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] p-6">
      {/* Top bar */}
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between mb-6 mx-auto">
        <div />
        <button
          className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-[var(--color-fg)] bg-[var(--color-bg)] fg:bg-[var(--color-bg)]/90 text-[var(--color-fg)]"
          type="button"
        >
          🎯 Daily Challenge
        </button>
      </div>

      <div className=" mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main explorer (spans 3 cols on lg) */}
        <section className="lg:col-span-3">
          <div className="rounded-2xl border border-[var(--color-fg)] bg-[var(--color-bg)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <FaBook /> Problem Explorer
              </h2>
            </div>

            {/* filters */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-3 mb-4">
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded w-40 text-[var(--color-fg)]"
                >
                  <option value="all">Select Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded w-44 text-[var(--color-fg)]"
                >
                  <option value="all">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c === "All" ? "all" : c}>{c}</option>
                  ))}
                </select>

                <select className="px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded text-[var(--color-fg)]">
                  <option>Sort by ID</option>
                </select>
              </div>

              <div className="mt-3 md:mt-0 md:ml-auto w-full md:w-64">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search problems..."
                  className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-fg)]"
                />
              </div>
            </div>

            {/* content */}
            {view === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-[var(--color-fg)]">
                      <th className="py-2 px-3 border-b border-[var(--color-border)] w-16">ID</th>
                      <th className="py-2 px-3 border-b border-[var(--color-border)]">Title</th>
                      <th className="py-2 px-3 border-b border-[var(--color-border)] w-32">Difficulty</th>
                      <th className="py-2 px-3 border-b border-[var(--color-border)] w-40">Category</th>
                      <th className="py-2 px-3 border-b border-[var(--color-border)] w-28">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-[var(--color-fg)]">No problems found</td>
                      </tr>
                    ) : (
                      filtered.map((p) => (
                        <tr key={p.id} className="transition cursor-pointer hover:bg-[var(--color-gray)]/10" onClick={() => navigate(`/problems/${p.id}`)}>
                          <td className="py-3 px-3 border-b border-[var(--color-border)] align-top">{p.id}</td>
                          <td className="py-3 px-3 border-b border-[var(--color-border)] align-top">{p.title}</td>
                          <td className="py-3 px-3 border-b border-[var(--color-border)] align-top">
                            <span
                              className={difficultyStyle[p.difficulty]}
                              style={{ background: difficultyColor[p.difficulty].bg, color: difficultyColor[p.difficulty].text }}
                            >
                              {p.difficulty}
                            </span>
                          </td>
                          <td className="py-3 px-3 border-b border-[var(--color-border)] align-top">{p.category}</td>
                          <td className="py-3 px-3 border-b border-[var(--color-border)] align-top">
                            <span className="text-[var(--color-fg)] text-xs">{p.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-[var(--color-fg)]">
                <FaChartLine className="mr-2" /> Graph View Coming Soon
              </div>
            )}

            {/* pagination placeholder */}
            <div className="mt-4 flex justify-between items-center text-sm text-[var(--color-fg)]">
              <div>Previous</div>
              <div className="flex gap-2 items-center">
                <button className="px-3 py-1 rounded border border-[var(--color-border)]">1</button>
                <button className="px-3 py-1 rounded border border-[var(--color-border)]">2</button>
                <button className="px-3 py-1 rounded border border-[var(--color-border)]">3</button>
                <span>...</span>
                <button className="px-3 py-1 rounded border border-[var(--color-border)]">Next</button>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Calendar card */}
          <div className="rounded-2xl border border-[var(--color-fg)] bg-[var(--color-bg)] p-4">
            <div className="text-lg font-semibold mb-3">Progress Calendar</div>
            <MiniCalendar />
          </div>

          {/* Stats card */}
          <div className="rounded-2xl border border-[var(--color-fg)] bg-[var(--color-bg)] p-4 text-center">
            <div className="text-sm text-[var(--color-fg)]">Your Stats</div>
            <div className="mt-3 text-2xl font-bold">0.00%</div>
            <div className="text-sm text-[var(--color-fg)] mt-1">Completion Rate</div>
            <div className="mt-4 text-xl font-semibold">0</div>
            <div className="text-sm text-[var(--color-fg)]">Problems Solved</div>
          </div>          
        </aside>
      </div>
    </div>
  );
}
