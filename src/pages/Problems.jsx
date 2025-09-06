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
import CollectionCarousel from "../components/collections/CollectionCarousel";

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
      <div className="min-h-screen dark:bg-[var(--color-bg-black)] bg-white text-[var(--color-bg)] dark:text-[var(--color-fg)] p-6">
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-8 gap-6">
          {/* Main explorer */}
          <section className="lg:col-span-5">
            {/* Daily Challenge section (unchanged) */}
            <DailyChallenge challenge={challenge} />
            <div className="rounded-2xl border-[1px] dark:border-[var(--color-muted)] border-zinc-300 dark:bg-[var(--color-bg-black)] bg-white p-5 shadow-sm text-[var(--color-bg)] dark:text-[var(--color-fg)]">
              <h2 className="text-2xl font-semibold flex items-center gap-3 text-[var(--color-bg)] dark:text-[var(--color-fg)]">
                <FaBook /> Problem Explorer
              </h2>
              <CollectionCarousel />
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
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:bg-[var(--color-bg)] bg-white text-[var(--color-bg)] dark:text-[var(--color-fg)]"
                  />
                </div>
              </div>

              {/* Content Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left dark:bg-zinc-900 bg-zinc-100 dark:text-[var(--color-fg)] text-zinc-700">
                      <th className="py-2 px-3 border-b dark:border-[var(--color-fg)] border-[var(--color-border)] w-40">
                        ID
                      </th>
                      <th className="py-2 px-3 border-b dark:border-[var(--color-fg)] border-[var(--color-border)]">
                        Title
                      </th>
                      <th className="py-2 px-3 border-b dark:border-[var(--color-fg)] border-[var(--color-border)] w-20">
                        Difficulty
                      </th>
                      <th className="py-2 px-3 border-b dark:border-[var(--color-fg)] border-[var(--color-border)] w-24">
                        Category
                      </th>
                      <th className="py-2 px-3 border-b dark:border-[var(--color-fg)] border-[var(--color-border)] w-28">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProblems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-6 text-center dark:text-[var(--color-fg)] text-[var(--color-bg)]"
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
                            className="transition cursor-pointer dark:bg-zinc-900 bg-white dark:hover:bg-zinc-800 hover:bg-zinc-100"
                            onClick={() =>
                              navigate && navigate(`/problems/${p._id}`)
                            }
                          >
                            <td className="py-3 px-3 border-b dark:border-[var(--color-fg)] border-[var(--color-border)] align-center text-[var(--color-bg)] dark:text-[var(--color-fg)]">
                              {p.problemId}
                            </td>
                            <td className="py-3 px-3 border-b dark:border-[var(--color-fg)] border-[var(--color-border)] align-center text-[var(--color-bg)] dark:text-[var(--color-fg)]">
                              {p.title}
                            </td>
                            <td className="py-3 px-3 border-b dark:border-[var(--color-fg)] border-[var(--color-border)] align-center text-[var(--color-bg)] dark:text-[var(--color-fg)]">
                              <span
                                className={`
                                    flex items-center justify-center min-w-[70px] text-sm font-medium rounded
                                    ${
                                      (p.difficulty || "").toLowerCase() ===
                                      "easy"
                                        ? "dark:text-black bg-green-500 text-white"
                                        : (p.difficulty || "").toLowerCase() ===
                                          "medium"
                                        ? "bg-amber-400 text-white dark:text-black"
                                        : (p.difficulty || "").toLowerCase() ===
                                          "hard"
                                        ? "bg-red-600 dark:text-black text-white"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
                                    }
                                  `}
                              >
                                {p.difficulty.toLowerCase()}
                              </span>
                            </td>
                            <td className="py-3 px-3 border-b dark:border-[var(--color-fg)] border-[var(--color-border)] align-center text-center text-[var(--color-bg)] dark:text-[var(--color-fg)]">
                              {p.category}
                            </td>
                            <td className="py-3 px-3 border-b dark:border-[var(--color-fg)] border-[var(--color-border)] align-center">
                              <span className="w-full flex justify-center dark:text-[var(--color-fg)] text-[var(--color-bg)] text-xs">
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
            <div className="rounded-2xl border dark:border-[var(--color-muted)] border-[var(--color-border)] dark:bg-zinc-900 bg-white p-4 text-[var(--color-bg)] dark:text-[var(--color-fg)]">
              <div className="text-xl text-center font-semibold mb-3 text-[var(--color-bg)] dark:text-[var(--color-fg)]">
                Progress Calendar
              </div>
              <MiniCalendar />
            </div>
            <div className="rounded-2xl border dark:border-[var(--color-muted)] border-[var(--color-border)] dark:bg-zinc-900 bg-white p-4 text-center text-[var(--color-bg)] dark:text-[var(--color-fg)]">
              <div className="text-2xl text-[var(--color-bg)] dark:text-[var(--color-fg)] font-bold">
                Your Stats
              </div>
              <div className="mt-3 text-2xl font-bold text-[var(--color-bg)] dark:text-[var(--color-fg)]">
                {userStats?.completionRate || 0.0}%
              </div>
              <div className="text-sm text-[var(--color-bg)] dark:text-[var(--color-fg)] mt-1">
                Completion Rate
              </div>
              <div className="mt-4 text-xl font-semibold text-[var(--color-bg)] dark:text-[var(--color-fg)]">
                {userStats?.totalQuestionsSolved || 0}
              </div>
              <div className="text-sm text-[var(--color-bg)] dark:text-[var(--color-fg)]">
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
