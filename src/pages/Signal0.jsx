export default function Signal0() {
  const sampleCards = new Array(9).fill(0).map((_, i) => ({
    id: 221 + i,
    title: [
      "Implement Basic Statistics for a NumPy Array",
      "Implement Forward Diffusion Sampling",
      "Compute Optimal Leaf Value for Boosting Models",
      "Implement Q-Learning Table Update",
      "Implement Mean Squared Error Loss for Diffusion Models in Data Generation",
      "Implementing Gaussian Noise Addition in PyTorch",
      "Implement F1 Score Calculation for Binary Classification",
      "Implement Surrogate Loss for Policy Gradient Optimization",
      "Logical Calculus For Nervous Activity (Collection)",
    ][i % 9],
    tags: [
      ["Easy", "Statistics"],
      ["Medium", "PyTorch", "Deep Learning"],
      ["Medium", "Machine Learning"],
      ["Medium", "Reinforcement Learning"],
      ["Medium", "PyTorch", "Deep Learning"],
      ["Medium", "PyTorch", "Deep Learning"],
      ["Medium", "Machine Learning"],
      ["Medium", "PyTorch", "Reinforcement Learning"],
      ["Collection"],
    ][i % 9],
  }));

  return (
    <div className="min-h-screen bg-black relative text-white font-sans">
      {/* Background grid + vignette */}
      <div
        className="
    absolute inset-0 pointer-events-none select-none
    bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)]
    dark:bg-[linear-gradient(to_right,#23272e_1px,transparent_1px),linear-gradient(to_bottom,#23272e_1px,transparent_1px)]
    bg-[size:40px_40px]
    [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]
  "
        aria-hidden="true"
      />

      {/* Hero + generator card */}
      <main className="relative z-10">
        <section className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 pt-8">
          <div className="flex flex-col items-center text-center gap-6 mt-8">
            <div className="inline-flex items-center gap-3 text-xs text-gray-400">
              <div className="bg-[#111214] px-2 py-1 rounded-md border border-[#2b2f33]">
                AI Generator
              </div>
              <div className="text-[10px] uppercase bg-[#0b1220] px-2 py-1 rounded-md border border-[#243145] text-[#9db3ff]">
                BETA
              </div>
            </div>

            <h1
              className="text-5xl md:text-8xl sm:text-7xl leading-none font-bold tracking-tight"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Signal-0
            </h1>
            <p className="text-gray-400 text-sm">
              Create quizzes from your study
            </p>

            {/* Card */}
            <div className="w-full max-w-3xl mt-8">
              <div className="bg-[#101213] border border-[#2b2f33] rounded-2xl p-6 drop-shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-4">
                  <label className="text-xs text-gray-300 w-36">
                    Topic or concept
                  </label>
                  <select className="flex-1 bg-[#0f1113] border border-[#232629] rounded px-3 py-2 text-sm">
                    <option>Numpy</option>
                    <option>Neural Networks</option>
                    <option>Decision Trees</option>
                  </select>
                  <div className="text-sm text-gray-500">or upload PDF</div>
                </div>

                <textarea
                  placeholder="e.g. Neural Networks, Decision Trees..."
                  className="w-full mt-4 bg-[#0b0c0d] border border-[#232629] rounded p-4 h-24 text-sm placeholder:text-gray-400"
                  maxLength={350}
                />

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="border-dashed border-2 border-[#2b2f33] rounded-lg py-8 flex flex-col items-center justify-center text-gray-400">
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="mb-2"
                    >
                      <path
                        d="M12 3v14"
                        stroke="#9aa0a6"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 8l5-5 5 5"
                        stroke="#9aa0a6"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Drag & drop PDF here
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button className="px-4 py-2 border border-[#2b2f33] rounded-md text-sm">
                      Clear
                    </button>
                    <button className="px-4 py-2 bg-[#ff8c2b] text-black rounded-md text-sm font-semibold">
                      Generate
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subtle top bar (search & filter) */}
        <header className="max-w-6xl mx-auto mt-15 px-6 md:px-12 lg:px-24 z-10">
          <div className="w-full mx-auto flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  placeholder="Search questions and collections..."
                  className="w-full bg-[#0f1113]/80 border border-[#2b2f33] rounded-lg py-3 px-4 pl-10 text-sm placeholder:text-gray-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
                />
                <svg
                  className="absolute left-3 top-3 opacity-60"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="#9aa0a6"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="11"
                    cy="11"
                    r="5"
                    stroke="#9aa0a6"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            <button className="bg-[#0f1113]/70 border border-[#2b2f33] px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                className="opacity-80"
              >
                <path
                  d="M3 6h18M7 12h10M11 18h2"
                  stroke="#9aa0a6"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Filter
            </button>
          </div>
        </header>

        {/* Cards grid section */}
        <section className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 pt-12 pb-24">
          <div className="text-gray-400 mb-6">
            314 items (300 questions, 14 collections)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sampleCards.map((c, idx) => (
              <article
                key={c.id}
                className={`relative bg-[#0f1113] border border-[#2b2f33] rounded-xl p-4 shadow-[0_6px_18px_rgba(0,0,0,0.6)] min-h-[120px] flex flex-col justify-between`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {c.tags.map((t, i) => (
                        <span
                          key={i}
                          className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded ${
                            t === "Easy"
                              ? "bg-[#0fae8a]/10 text-[#0fae8a] border border-[#083b2d]"
                              : t === "Medium"
                              ? "bg-[#3b2300]/10 text-[#ffb36b] border border-[#6b3e06]"
                              : t === "PyTorch" ||
                                t === "Deep Learning" ||
                                t === "Machine Learning" ||
                                t === "Reinforcement Learning" ||
                                t === "Statistics"
                              ? "bg-[#0b1220]/40 text-gray-300 border border-[#1f2326]"
                              : "bg-[#1b1b1b]/30 text-gray-300 border border-[#2b2f33]"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <h3 className="font-semibold text-sm leading-tight">
                      {c.title}
                    </h3>
                  </div>

                  {/* heart / stats small area */}
                  <div className="text-gray-500 text-xs flex flex-col items-end">
                    <div className="">#{c.id}</div>
                    <div className="mt-6 opacity-60">♡ 0</div>
                  </div>
                </div>

                {/* small footer to mimic cards */}
                <div className="mt-4 text-[12px] text-gray-500">&nbsp;</div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* bottom floating bar */}
      <div className="fixed left-0 right-0 bottom-0 z-30">
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-3">
          <div className="bg-[#060708]/60 border border-[#222428] rounded-t-xl py-3 px-4 flex items-center justify-between text-sm text-gray-300">
            <div className="flex items-center gap-3">
              <div className="bg-[#0b0f10] border border-[#2b2f33] px-3 py-1 rounded">
                Deep-0
              </div>
              <div className="opacity-70">3/3 lifetime remaining</div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 opacity-80">
                📚 Browse
              </div>
              <div className="flex items-center gap-2 opacity-80">
                ⚡ Generate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* small extra styles to perfect the grid look */}
      <style>{`
        /* ensure text uses a monospaced-ish display for tags like the screenshots */
        :root {
          --bg-dark: #0b0c0d;
        }

        /* subtle custom scrollbar for big screens */
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.03); border-radius: 999px; }

        @media (min-width: 1280px) {
          h1 { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
}
