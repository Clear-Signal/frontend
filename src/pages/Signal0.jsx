import { useMemo, useState, useEffect, useRef } from "react";
import useFetch from "../hooks/useFetch"; // Assuming the hook is in this path
import LoadingScreen from "../components/LoadingScreen"; // Assuming you have a loading component
import { useNavigate } from "react-router-dom";

export default function Signal0() {
  // 1. Fetch data from both APIs
  const { data: problemsData, loading: problemsLoading, error: problemsError } = useFetch("/api/general/problems");
  const { data: collectionsData, loading: collectionsLoading, error: collectionsError } = useFetch("/api/general/collection");
  const navigate = useNavigate();

  // 2. Combine and transform the data into a single list for rendering
  const combinedItems = useMemo(() => {
    const problems = problemsData || [];
    const collections = collectionsData || [];

    const formattedProblems = problems.map(p => ({
      id: p._id,
      title: p.title,
      tags: [p.difficulty, p.category].filter(Boolean),
      displayId: p.problemId,
      type: 'problem',
    }));

    const formattedCollections = collections.map(c => ({
      id: c._id,
      title: c.name,
      tags: ['Collection'],
      displayId: c.section,
      type: 'collection',
    }));

    return [...formattedProblems, ...formattedCollections];
  }, [problemsData, collectionsData]);

  // 3. Handle combined loading and error states
  const isLoading = problemsLoading || collectionsLoading;
  const error = problemsError || collectionsError;

  // incremental loading state
  const BATCH_SIZE = 9; // how many cards to show per "page"
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef(null);

  // reset visibleCount when data changes (useful on fresh fetch)
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [problemsData, collectionsData]);

  // sentinel observer to load more when user scrolls near bottom
  useEffect(() => {
    if (!sentinelRef.current) return;
    const sentinel = sentinelRef.current;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleCount(prev => {
              const next = Math.min((combinedItems?.length || 0), prev + BATCH_SIZE);
              return next;
            });
          }
        });
      },
      { root: null, rootMargin: "400px", threshold: 0.01 } // rootMargin to preload a bit
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [combinedItems]);

  // card reveal observer: add "in-view" class to animate when card enters viewport
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll(".lazy-card"));
    if (!nodes.length) return;
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            // once revealed, we can unobserve that node
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.22 }
    );

    nodes.forEach((n) => {
      // only observe nodes that aren't already revealed
      if (!n.classList.contains("in-view")) revealObserver.observe(n);
    });

    return () => revealObserver.disconnect();
  }, [visibleCount, combinedItems]); // re-run when new cards are mounted

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-red-500">Error loading data. Please try again later.</p>
      </div>
    );
  }

  const totalProblems = problemsData?.length || 0;
  const totalCollections = collectionsData?.length || 0;

  // slice items to only render the visible batch
  const itemsToRender = (combinedItems || []).slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-black relative text-white font-sans">
      {/* Background grid + vignette (unchanged) */}
      <div
        className="absolute inset-0 pointer-events-none select-none bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#23272e_1px,transparent_1px),linear-gradient(to_bottom,#23272e_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Hero + generator card (unchanged) */}
      <main className="relative z-10">
        <section className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 pt-8">
          <div className="flex flex-col items-center text-center gap-6 mt-8">
            <div className="inline-flex items-center gap-3 text-xs text-gray-400">
              <div className="bg-[#111214] px-2 py-1 rounded-md border border-[#2b2f33]">AI Generator</div>
              <div className="text-[10px] uppercase bg-[#0b1220] px-2 py-1 rounded-md border border-[#243145] text-[#9db3ff]">BETA</div>
            </div>
            <h1 className="text-5xl md:text-8xl sm:text-7xl leading-none font-bold tracking-tight" style={{ fontFamily: "Inter, sans-serif" }}>
              Signal-0
            </h1>
            <p className="text-gray-400 text-sm">Create quizzes from your study</p>
            <div className="w-full max-w-2xl mt-8">
              <div className="bg-[#101213] border border-[#2b2f33] rounded-2xl p-6 drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                <div className="flex max-w-lg items-center gap-4">
                  <label className="text-xs font-bold text-gray-300 w-36">Topic or concept</label>
                  <select className="flex-1 min-w-1.5 bg-[#0f1113] border border-[#232629] rounded py-2 text-sm">
                    <option>Numpy</option>
                    <option>Neural Networks</option>
                    <option>Decision Trees</option>
                  </select>
                  <div className="text-sm text-gray-500">or upload PDF</div>
                </div>
                <input placeholder="e.g. Neural Networks, Decision Trees..." className="w-full mt-4 bg-[#101213] border border-[#232629] rounded p-4  text-sm placeholder:text-gray-500" maxLength={350} />
                <div className="mt-6 mx-34 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="border-dashed col-span-2 border-2 border-[#2b2f33] rounded-lg py-8 flex flex-col items-center justify-center text-gray-400">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="mb-2">
                      <path d="M12 3v14" stroke="#9aa0a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M7 8l5-5 5 5" stroke="#9aa0a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Drag & drop PDF here
                  </div>
                  <div className="gap-3 col-span-2 justify-content items-center">
                    <button className="px-4 mx-2 py-2 bg-gray-400 text-black rounded-md text-sm font-semibold">Generate</button>
                    <button className="px-4 py-2 border border-[#2b2f33] rounded-md text-sm">Clear</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Filter bar (unchanged) */}
        <header className="max-w-6xl mx-auto mt-15 px-6 md:px-12 lg:px-24 z-10">
          <div className="w-full mx-auto flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <input placeholder="Search questions and collections..." className="w-full bg-[#0f1113]/80 border border-[#2b2f33] rounded-lg py-3 px-4 pl-10 text-sm placeholder:text-gray-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]" />
                <svg className="absolute left-3 top-3 opacity-60" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21l-4.35-4.35" stroke="#9aa0a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="11" cy="11" r="5" stroke="#9aa0a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <button className="bg-[#0f1113]/70 border border-[#2b2f33] px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-80">
                <path d="M3 6h18M7 12h10M11 18h2" stroke="#9aa0a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Filter
            </button>
          </div>
        </header>

        {/* Cards grid section */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 pt-12 pb-24">
          <div className="text-gray-400 mb-6">
            {totalProblems + totalCollections} items ({totalProblems} questions, {totalCollections} collections)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemsToRender.map((item, idx) => {
              // compute a small stagger based on index for nicer entrance
              const stagger = (idx % BATCH_SIZE) * 40; // ms
              return (
                <article
                  key={item.id}
                  onClick={() => item.tags.includes('Collection') ? navigate(`/collections`) : navigate(`/problems/${item.id}`)}
                  className="lazy-card relative bg-[#0f1113] border border-[#2b2f33] rounded-xl p-4 shadow-[0_6px_18px_rgba(0,0,0,0.6)] min-h-[120px] flex flex-col justify-between cursor-pointer hover:bg-[#1f2326] hover:-translate-y-2 transition duration-500"
                  style={{ transitionDelay: `${stagger}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap justify-between gap-2">
                        {item.tags.map((tag, i) => (
                          <span
                            key={i}
                            className={` text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg ${
                              tag === "Easy"
                                ? " text-[#0fae8a] border border-[#0fae8a]"
                                : tag === "Medium"
                                ? "text-[#ffb36b] border border-[#ffb36b]"
                                : tag === "Hard"
                                ? "text-red-400 border border-red-400"
                                : tag === "Collection"
                                ? "text-[#ffb36b] border border-[#ffb36b]"
                                : "text-zinc-500 border border-zinc-500"
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="mt-2 font-semibold text-sm leading-tight">{item.title}</h3>
                    </div>
                  </div>
                  <div className="text-gray-300 mt-2 text-xs flex justify-between items-center">
                    <div className="">{item.type === 'problem' ? `#${item.displayId}` : `Sec ${item.displayId}`}</div>
                    <div className="opacity-80 hover:text-orange-400">♡ 0</div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* sentinel triggers loading next batch */}
          <div ref={sentinelRef} className="h-6" />

          {/* if there are more items, show small loader */}
          {visibleCount < (combinedItems?.length || 0) && (
            <div className="mt-6 text-center text-gray-400">Loading more...</div>
          )}
        </section>
      </main>

      {/* Floating bar and styles (unchanged) */}
      <div className="fixed left-0 right-0 bottom-0 z-30">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-3">
          <div className="bg-[#060708]/60 border border-[#222428] rounded-t-xl py-3 px-4 flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <div className="bg-[#0b0f10] border border-[#2b2f33] px-3 py-1 rounded">Deep-0</div>
              <div className="opacity-70">3/3 lifetime remaining</div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 opacity-80">📚 Browse</div>
              <div className="flex items-center gap-2 opacity-80">⚡ Generate</div>
            </div>
          </div>
        </div>
      </div>

      {/* animation CSS for lazy reveal */}
      <style>{`
        :root { --bg-dark: #0b0c0d; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.03); border-radius: 999px; }

        /* lazy reveal */
        .lazy-card {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 420ms cubic-bezier(.2,.9,.2,1), transform 420ms cubic-bezier(.2,.9,.2,1);
          will-change: opacity, transform;
        }
        .lazy-card.in-view {
          opacity: 1;
          transform: translateY(0);
        }

        @media (min-width: 1280px) { h1 { transform: translateY(4px); } }
      `}</style>
    </div>
  );
}
