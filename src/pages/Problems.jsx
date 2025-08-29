import { useContext, useMemo, useState } from "react";
import { FaBook, FaChartLine, FaChevronDown, FaArrowRight } from "react-icons/fa";
import { AuthContext } from "../stores/authStore";
import MiniCalendar from "../components/MiniCalendar";
import { Listbox } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import useFetch from "../hooks/useFetch";

const difficultyStyle = {
  easy: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
  medium: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
  hard: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
};

const difficultyColor = {
  easy: { bg: "#22C55E", text: "var(--color-bg)" },
  medium: { bg: "#EAB308", text: "var(--color-bg)" },
  hard: { bg: "#EF4444", text: "var(--color-bg)" },
};

// ✅ Reusable dropdown component (more robust display)
function Dropdown({ value, setValue, options, width = "w-44" }) {
  const display = (v) => {
    if (!v && v !== "") return "";
    if (typeof v !== "string") return String(v);
    if (v.toLowerCase() === "all" || v === "select category" || v === "select difficulty") return "All";
    // for multi-word categories preserve casing (just ensure first char uppercased)
    return v.charAt(0).toUpperCase() + v.slice(1);
  };

  return (
    <div className={`relative ${width}`}>
      <Listbox value={value} onChange={setValue}>
        <Listbox.Button className="flex justify-between items-center w-full px-3 py-2 rounded bg-[var(--color-bg)] border border-[var(--color-fg)]/10 text-[var(--color-fg)]">
          <span className="truncate">{display(value)}</span>
          <FaChevronDown className="ml-2 text-xs" />
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 w-full rounded-md bg-zinc-900 border border-[var(--color-muted)] shadow-lg max-h-60 overflow-auto focus:outline-none z-50">
          {options.map((opt) => (
            <Listbox.Option
              key={opt}
              value={opt}
              className={({ active }) =>
                `cursor-pointer select-none px-3 py-2 ${active ? "bg-zinc-800 text-white" : "text-[var(--color-fg)]"}`
              }
            >
              {typeof opt === "string" ? (opt === "all" ? "All" : opt.charAt(0).toUpperCase() + opt.slice(1)) : String(opt)}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
}

export default function ProblemsPage() {
  const [view, setView] = useState("table");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");

  const [expanded, setExpanded] = useState(false);

  const { navigate } = useContext(AuthContext);

  const { data: problems, loading, error } = useFetch("/api/general/problems");

  // categories depend on problems (recompute when `problems` changes)
  const categories = useMemo(() => {
    const arr = Array.isArray(problems) ? problems.map((p) => p.category || "uncategorized") : [];
    const s = new Set(arr);
    return ["all", ...Array.from(s)];
  }, [problems]);

  // filtered depends on problems + filter inputs
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

  return (
    <div className="min-h-screen bg-[var(--color-bg-black)] text-[var(--color-fg)] p-6">
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-8 gap-6">
        {/* Main explorer */}
        <section className="lg:col-span-5">
          <div className="flex flex-col items-center justify-center mb-6 mx-auto">
            {!expanded && (
              <motion.button
                whileHover={{ scale: 1.05, rotateX: 5, rotateY: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => setExpanded(true)}
                className="inline-flex items-center text-xl gap-3 px-6 py-2 rounded-full border-2 border-[var(--color-fg)] bg-[var(--color-bg)] text-[var(--color-fg)] shadow-lg shadow-black/30 cursor-pointer"
                type="button"
              >
                🎯 Daily Challenge
              </motion.button>
            )}

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-sm w-full bg-zinc-900 text-white rounded-2xl shadow-xl px-10 py-14 mt-4 border border-white"
                >
                  <h2 className="text-2xl font-bold tracking-widest mb-2">DAILY CHALLENGE</h2>
                  <div className="h-[1px] w-16 bg-white/30 mb-4"></div>

                  <h3 className="text-xl font-semibold mb-2">Implement Recall Metric in Binary Classification</h3>
                  <p className="text-sm text-gray-400 mb-1">Problem ID: 52</p>
                  <p className="text-sm text-gray-400 my-5 ">Enhance your coding skills with today's elegant challenge.</p>

                  <motion.button whileTap={{ scale: 0.95 }} className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded-full bg-white text-black font-semibold shadow-md cursor-pointer">
                    Solve it now <FaArrowRight className="hover:translate-x-1 transition-transform" size={18} />
                  </motion.button>

                  <button onClick={() => setExpanded(false)} className="mt-4 w-full text-sm text-gray-400 hover:text-gray-200 cursor-pointer">
                    Close ✖
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="rounded-2xl border-[1px] border-[var(--color-muted)] bg-[var(--color-bg-black)] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-3">
                <FaBook /> Problem Explorer
              </h2>
            </div>

            {/* filters */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-3 mb-4">
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <Dropdown value={difficulty} setValue={setDifficulty} options={["all", "easy", "medium", "hard"]} width="w-40" />

                <Dropdown value={category} setValue={setCategory} options={categories} width="w-44" />

                <Dropdown value={"Sort by ID"} setValue={() => {}} options={["Sort by ID"]} width="w-40" />
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
                    <tr className="text-left bg-zinc-900 text-[var(--color-fg)]">
                      <th className="py-2 px-3 border-b border-[var(--color-fg)] w-16">ID</th>
                      <th className="py-2 px-3 border-b border-[var(--color-fg)]">Title</th>
                      <th className="py-2 px-3 border-b border-[var(--color-fg)] w-32">Difficulty</th>
                      <th className="py-2 px-3 border-b border-[var(--color-fg)] w-40">Category</th>
                      <th className="py-2 px-3 border-b border-[var(--color-fg)] w-28">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-[var(--color-fg)]">No problems found</td>
                      </tr>
                    ) : (
                      filtered.map((p) => (
                        <tr key={p._id} className="bg-zinc-900 transition cursor-pointer hover:bg-zinc-800" onClick={() => navigate && navigate(`/problems/${p._id}`)}>
                          <td className="py-5 px-3 border-b-2 border-[var(--color-fg)] align-top">{p._id.slice(-5).toUpperCase()}</td>
                          <td className="py-5 px-3 border-b-2 border-[var(--color-fg)] align-top">{p.title}</td>
                          <td className="py-5 px-3 border-b-2 border-[var(--color-fg)] align-top">
                            <span
                              className={difficultyStyle[(p.difficulty || "").toLowerCase()]}
                              style={{
                                background: difficultyColor[(p.difficulty || "").toLowerCase()]?.bg,
                                color: difficultyColor[(p.difficulty || "").toLowerCase()]?.text,
                                minWidth: "80px",
                                justifyContent: "center",
                                fontSize: "0.875rem",
                              }}
                            >
                              {p.difficulty}
                            </span>
                          </td>
                          <td className="py-5 px-3 border-b-2 border-[var(--color-fg)] align-top">{p.category}</td>
                          <td className="py-5 px-3 border-b-2 border-[var(--color-fg)] align-top">
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

            {/* pagination */}
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
        <aside className="max-w-md lg:grid gap-6 lg:-col-end-1 lg:col-span-2">
          <div className="rounded-2xl border border-[var(--color-muted)] bg-zinc-900 p-4">
            <div className="text-xl text-center font-semibold mb-3">Progress Calendar</div>
            <MiniCalendar />
          </div>

          <div className="rounded-2xl border border-[var(--color-muted)] bg-zinc-900 p-4 text-center">
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
