import { useContext, useMemo, useState, useEffect, useRef } from "react";

import { FaBook, FaCheckCircle } from "react-icons/fa";
import { AuthContext } from "../stores/authStore";
import MiniCalendar from "../components/MiniCalendar";
import useFetch from "../hooks/useFetch";
import LoadingScreen from "../components/LoadingScreen";
import Pagination from "../components/ProblemsPagination";
import Dropdown from "../components/Dropdown";
import DailyChallenge from "../components/DailyChallenge";
import Footer from "../components/Footer";

const ITEMS_PER_PAGE = 10;

const difficultyStyle = {
  easy: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
  medium:
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
  hard: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
};

const difficultyColor = {
  easy: { bg: "#22C55E", text: "var(--color-bg)" },
  medium: { bg: "#EAB308", text: "var(--color-bg)" },
  hard: { bg: "#EF4444", text: "var(--color-bg)" },
};

export default function ProblemsPage() {
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // ✅ State for pagination

  const { navigate } = useContext(AuthContext);

  const { data: problems, loading } = useFetch("/api/general/problems");
  const { data: userStats } = useFetch("/api/user/stats");
  const { data: challenge } = useFetch("/api/general/daily-question/new");
  console.log(challenge);

  const categories = useMemo(() => {
    const arr = Array.isArray(problems)
      ? problems.map((p) => p.category || "uncategorized")
      : [];
    const s = new Set(arr);
    return ["all", ...Array.from(s)];
  }, [problems]);

  const filtered = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    const diff = (difficulty || "all").toLowerCase();
    const cat = (category || "all").toLowerCase();
    const q = (query || "").trim().toLowerCase();

    return problems.filter((p) => {
      const pd = (p.difficulty || "").toLowerCase();
      const pc = (p.category || "").toLowerCase();
      if (diff !== "all" && pd !== diff) return false;
      if (cat !== "all" && pc !== cat) return false;
      if (q && !(p.title || "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [problems, query, difficulty, category]);

  // ✅ Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, difficulty, category]);

  // ✅ Calculate pagination variables
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedProblems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <div className="min-h-screen bg-[var(--color-bg-black)] text-[var(--color-fg)] p-6">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-8 gap-6">
        {/* Main explorer */}
        <section className="lg:col-span-5">
          {/* Daily Challenge section (unchanged) */}
          <DailyChallenge challenge={challenge} />
          <div className="rounded-2xl border-[1px] border-[var(--color-muted)] bg-[var(--color-bg-black)] p-5 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              <FaBook /> Problem Explorer
            </h2>
            {/* Filters section (unchanged) */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-3 my-4">
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <Dropdown
                  value={difficulty}
                  setValue={setDifficulty}
                  options={["all", "easy", "medium", "hard"]}
                  width="w-40"
                />
                <Dropdown
                  value={category}
                  setValue={setCategory}
                  options={categories}
                  width="w-44"
                />
                <Dropdown
                  value={"Sort by ID"}
                  setValue={() => {}}
                  options={["Sort by ID"]}
                  width="w-40"
                />
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

            {/* Content Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="text-left bg-zinc-900 text-[var(--color-fg)]">
                    <th className="py-2 px-3 border-b border-[var(--color-fg)] w-16">
                      ID
                    </th>
                    <th className="py-2 px-3 border-b border-[var(--color-fg)]">
                      Title
                    </th>
                    <th className="py-2 px-3 border-b border-[var(--color-fg)] w-32">
                      Difficulty
                    </th>
                    <th className="py-2 px-3 border-b border-[var(--color-fg)] w-40">
                      Category
                    </th>
                    <th className="py-2 px-3 border-b border-[var(--color-fg)] w-28">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProblems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-[var(--color-fg)]"
                      >
                        No problems found
                      </td>
                    </tr>
                  ) : (
                    paginatedProblems.map(
                      (
                        p // ✅ Use paginatedProblems here
                      ) => (
                        <tr
                          key={p._id}
                          className="bg-zinc-900 transition cursor-pointer hover:bg-zinc-800"
                          onClick={() =>
                            navigate && navigate(`/problems/${p._id}`)
                          }
                        >
                          <td className="py-5 px-3 border-b-2 border-[var(--color-fg)] align-top">
                            {p.problemId}
                          </td>
                          <td className="py-5 px-3 border-b-2 border-[var(--color-fg)] align-top">
                            {p.title}
                          </td>
                          <td className="py-5 px-3 border-b-2 border-[var(--color-fg)] align-top">
                            <span
                              className={
                                difficultyStyle[
                                  (p.difficulty || "").toLowerCase()
                                ]
                              }
                              style={{
                                background:
                                  difficultyColor[
                                    (p.difficulty || "").toLowerCase()
                                  ]?.bg,
                                color:
                                  difficultyColor[
                                    (p.difficulty || "").toLowerCase()
                                  ]?.text,
                                minWidth: "80px",
                                justifyContent: "center",
                                fontSize: "0.875rem",
                              }}
                            >
                              {p.difficulty}
                            </span>
                          </td>
                          <td className="py-5 px-3 border-b-2 border-[var(--color-fg)] align-top">
                            {p.category}
                          </td>
                          <td className="py-5 px-3 border-b-2 border-[var(--color-fg)] align-top">
                            <span className="text-[var(--color-fg)] text-center text-xs">
                              {p.status &&
                              p.status.toLowerCase() === "solved" ? (
                                <FaCheckCircle color="green" size={20} />
                              ) : (
                                ""
                              )}
                            </span>
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* ✅ Render the dynamic pagination component */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </section>

        {/* Sidebar (unchanged) */}
        <aside className="max-w-md lg:grid gap-6 lg:-col-end-1 lg:col-span-2 max-h-15">
          <div className="rounded-2xl border border-[var(--color-muted)] bg-zinc-900 p-4">
            <div className="text-xl text-center font-semibold mb-3">
              Progress Calendar
            </div>
            <MiniCalendar />
          </div>
          <div className="rounded-2xl border border-[var(--color-muted)] bg-zinc-900 p-4 text-center">
            <div className="text-sm text-[var(--color-fg)]">Your Stats</div>
            <div className="mt-3 text-2xl font-bold">
              {userStats?.completionRate || 0.0}%
            </div>
            <div className="text-sm text-[var(--color-fg)] mt-1">
              Completion Rate
            </div>
            <div className="mt-4 text-xl font-semibold">
              {userStats?.totalQuestionsSolved || 0}
            </div>
            <div className="text-sm text-[var(--color-fg)]">
              Problems Solved
            </div>
          </div>
        </aside>
      </div>
    </div>
    <Footer />
    </>
  );
}
