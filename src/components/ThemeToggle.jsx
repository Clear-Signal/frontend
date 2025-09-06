// ThemeToggle.jsx
import { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSun, FiMoon } from "react-icons/fi";
import { SignalContext } from "../stores/signalStore";
const ThemeToggle = () => {
  const { isDark, setIsDark } = useContext(SignalContext);

  // Initialize from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="relative inline-flex items-center rounded-full p-1 w-16 h-9 dark:bg-blue-800 bg-yellow-300 shadow-sm focus:outline-none border-1 border-[var(--color-border)] cursor-pointer"
    >
      <span className="absolute inset-0 rounded-full pointer-events-none" />

      {/* Sliding thumb */}
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="z-10 inline-flex items-center justify-center w-7 h-7 rounded-full dark:bg-[var(--color-muted)] bg-[var(--color-fg)] border border-[var(--color-border)]"
        style={{
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          translateX: isDark ? "28px" : "0px",
        }}
      >
        {/* Icon crossfade */}
        <AnimatePresence mode="popLayout" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="text-[var(--color-primary)]"
            >
              <FiMoon size={16} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="text-[var(--color-accent)]"
            >
              <FiSun size={16} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>

      {/* Optional labels (tiny) */}
      <span className="absolute dark:hidden left-2 text-[10px] text-[var(--color-fg)]/60 select-none">☀</span>
      <span className="dark:absolute hidden right-2 text-[10px] text-[var(--color-fg)]/60 select-none">🌙</span>
    </button>
  );
};

export default ThemeToggle;
