import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
// SolutionSection (paste inside ProblemSolver file; DO NOT export this function if the file already has a default export)
export default function SolutionSection({ problem, problemId, setDescriptionTab }) {
  const [unlockedUntil, setUnlockedUntil] = useState(() => {
    try {
      const key = `solution_unlocked_${problemId || "unknown"}`;
      const v = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      return v ? parseInt(v, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [remainingText, setRemainingText] = useState("");
  const [copied, setCopied] = useState(false);

  // defensive: ensure solutionText is printable
  console.log(problem);
  const rawSolution = problem?.solutionCode || "// Solution not available";
  const solutionText = typeof rawSolution === "string" ? rawSolution : JSON.stringify(rawSolution, null, 2);

  useEffect(() => {
    if (typeof rawSolution !== "string") {
      // helpful debug to inspect shape of solution
      // eslint-disable-next-line no-console
      console.debug("[SolutionSection] rawSolution is not a string:", rawSolution);
    }
  }, [rawSolution]);

  // Show the modal when this section mounts if not unlocked.
  // Using a mount flag ensures we don't flip state accidentally during strict-mode double render.
  useEffect(() => {
    let mounted = true;
    const locked = !(unlockedUntil && unlockedUntil > Date.now());
    if (mounted) setShowModal(locked);
    return () => {
      mounted = false;
    };
  }, [unlockedUntil]);

  // Countdown updater
  useEffect(() => {
    if (!unlockedUntil || unlockedUntil <= Date.now()) {
      setRemainingText("");
      if (unlockedUntil && unlockedUntil <= Date.now()) {
        try {
          const key = `solution_unlocked_${problemId || "unknown"}`;
          localStorage.removeItem(key);
          setUnlockedUntil(0);
        } catch (e) {}
      }
      return;
    }

    const update = () => {
      const diff = unlockedUntil - Date.now();
      if (diff <= 0) {
        setRemainingText("");
        try {
          const key = `solution_unlocked_${problemId || "unknown"}`;
          localStorage.removeItem(key);
        } catch (e) {}
        setUnlockedUntil(0);
        return;
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setRemainingText(`${hrs}h ${mins}m ${secs}s remaining`);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [unlockedUntil, problemId]);

  // Confirm viewing solution
  const handleConfirm = () => {
    const until = Date.now() + 4 * 60 * 60 * 1000; // 4 hours
    try {
      const key = `solution_unlocked_${problemId || "unknown"}`;
      localStorage.setItem(key, String(until));
    } catch (e) {}
    setUnlockedUntil(until);
    setShowModal(false);
  };

  // Cancel: close modal and return to description tab
  const handleCancel = () => {
    setShowModal(false);
    try {
      setDescriptionTab("description");
    } catch (e) {}
  };

  // Click-outside & Escape handling for modal
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showModal]);

  // copy handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(solutionText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("copy failed", e);
    }
  };

  const isUnlocked = Boolean(unlockedUntil && unlockedUntil > Date.now());

  // Modal element rendered in a portal to avoid stacking context issues
  const ModalPortal = showModal
    ? createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/70"
              onClick={handleCancel} // clicking outside closes modal
            />
            <motion.div
              initial={{ scale: 0.98, y: -8 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: -8 }}
              transition={{ duration: 0.18 }}
              className="relative z-[10000] w-[520px] max-w-full rounded-lg bg-[#121214] border border-zinc-800 p-6 text-center shadow-2xl"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-2">View Solution</h2>
              <p className="text-sm text-gray-300 mb-4">
                Viewing the solution will prevent you from earning the flame for <strong>4 hours</strong>.
              </p>
              <p className="text-sm text-gray-200 font-semibold mb-6">Are you sure you want to proceed?</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-md bg-[#1f2937] border border-zinc-700 text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-md bg-black text-white border border-zinc-800"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>
      {/* Render portal modal (if active) */}
      {ModalPortal}

      {/* Panel content */}
      {isUnlocked ? (
        <div className="px-6 overflow-y-auto flex-grow">
          <div className="rounded-lg bg-[#1e1e1e] border border-zinc-800 p-6 shadow-sm">
            <div className="mb-4 rounded-md bg-[#18181b] border border-zinc-700 p-3 text-center text-sm text-red-400">
              <strong>You can earn flames again in </strong>
              <span className="text-red-500 font-semibold">{remainingText || "0h 0m 0s remaining"}</span>
            </div>

            <div className="rounded-md bg-[#0f0f10] border border-zinc-700 p-4 text-sm relative">
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 px-3 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-gray-300 text-sm"
              >
                📋
              </button>

              <pre className="font-mono whitespace-pre-wrap text-gray-200 m-0">{solutionText}</pre>
            </div>

            {copied && <div className="mt-3 text-sm text-green-400">Copied!</div>}
          </div>
        </div>
      ) : (
        <div className="px-6 overflow-y-auto flex-grow">
          <div className="rounded-lg min-h-full flex justify-center items-center bg-[#1e1e1e] border border-zinc-800 p-6 shadow-sm">
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Solution</h2>
                <p>Content for this section is not yet available.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

