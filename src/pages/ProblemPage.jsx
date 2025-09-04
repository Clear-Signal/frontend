import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useContext,
} from "react";
import Editor from "@monaco-editor/react";
import {
  FiRefreshCw,
  FiSave,
  FiClock,
  FiMaximize,
  FiMinimize,
  FiLink,
  FiExternalLink,
  FiSun,
  FiMinus,
  FiPlus,
} from "react-icons/fi";
import { FaCheck, FaTimes, FaCircle, FaEdit } from "react-icons/fa";
import { VscPlay } from "react-icons/vsc";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import axios from "axios";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { motion, AnimatePresence } from "framer-motion";
import LoadingScreen from "../components/LoadingScreen";
import { AuthContext } from "../stores/authStore";
import LearnTopicPanel from "../components/LearnAboutTopic";
import RequestEditModal from "../components/RequestEdit";
import { MdKeyboard } from "react-icons/md";
import SolutionSection from "../components/SolutionSection";

// --- Sub-components ---

const PlaceholderContent = ({ title }) => (
  <div className="flex items-center justify-center h-full text-gray-500">
    <div className="text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p>Content for this section is not yet available.</p>
    </div>
  </div>
);

const difficultyThemes = {
  easy: "bg-green-400 text-black",
  medium: "bg-yellow-400 text-black",
  hard: "bg-red-400 text-black",
};

const SubmissionsDropdown = ({ problemId, onSelectSubmission, onClose }) => {
  const { data: submissionsData, loading } = useFetch(
    `/api/user/code/all-submissions/${problemId}`
  );
  const submissions = submissionsData?.submissions || [];
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleItemClick = (submission) => {
    onSelectSubmission(submission.code);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute bottom-full top-10 right-0 mb-2 w-72 p-2 rounded-lg shadow-lg z-20"
    >
      <div className="p-3 border-b rounded-t-lg bg-zinc-800 border-zinc-700">
        <h4 className="font-semibold text-white">Recent Submissions</h4>
      </div>
      <ul className="max-h-80 rounded-b-lg bg-zinc-800 overflow-y-auto">
        {loading ? (
          <li className="p-4 text-center text-gray-400">Loading...</li>
        ) : submissions.length === 0 ? (
          <li className="p-4 text-center text-gray-400">
            No submissions found.
          </li>
        ) : (
          submissions.map((sub) => (
            <li
              key={sub._id}
              onClick={() => handleItemClick(sub)}
              className="flex items-center justify-between p-3 hover:bg-zinc-700 cursor-pointer text-sm"
            >
              <div className="flex items-center gap-2">
                <FaCircle
                  className={
                    sub.status === "passed" ? "text-green-500" : "text-red-500"
                  }
                  size={10}
                />
                <span className="capitalize">{sub.status}</span>
              </div>
              <span className="text-gray-400">
                {new Date(sub.submittedAt).toLocaleString()}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

const useWindowSize = () => {
  const [size, setSize] = useState([
    typeof window !== "undefined" ? window.innerWidth : 0,
    typeof window !== "undefined" ? window.innerHeight : 0,
  ]);
  useEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
};

// --- Main Component ---

export default function ProblemSolver() {
  const [descriptionTab, setDescriptionTab] = useState("description");
  const [testResultTab, setTestResultTab] = useState(0);
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState(null);
  const [running, setRunning] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLearnPanelOpen, setIsLearnPanelOpen] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const params = useParams();
  const problemId = params.id;

  const [width] = useWindowSize();
  const isMobile = width < 1024;

  const { data: problem, loading } = useFetch(
    `/api/general/problems/${problemId}`
  );

  const monacoEditorRef = useRef(null);
  const monacoRef = useRef(null); // store monaco namespace

  // font size / zoom state (default 14)
  const [fontSize, setFontSize] = useState(14);

  // theme state: true = dark, false = light
  const [isDark, setIsDark] = useState(true);
  const themeName = isDark ? "custom-dark" : "custom-light";

  // shortcuts panel open state
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const shortcutsBtnRef = useRef(null);
  const shortcutsPanelRef = useRef(null);

  useEffect(() => {
    if (!problem) return;
    const key = `snippet_${problemId || "unknown"}_${lang}`;
    const saved = localStorage.getItem(key);
    setCode(saved ?? problem.starterCode?.python ?? "// Start coding here\n");
    setSubmission(null);
  }, [lang, problemId, problem]);

  // apply font size changes to editor instance
  useEffect(() => {
    if (monacoEditorRef.current?.updateOptions) {
      monacoEditorRef.current.updateOptions({ fontSize });
    }
  }, [fontSize]);

  // set editor theme when monaco is ready or when user toggles theme
  useEffect(() => {
    if (monacoRef.current?.editor) {
      try {
        monacoRef.current.editor.setTheme(themeName);
      } catch (e) {
        // ignore if monaco not fully ready
      }
    }
  }, [themeName]);

  // close shortcuts panel on outside click or ESC
  useEffect(() => {
    if (!isShortcutsOpen) return;

    const handleOutside = (e) => {
      const panel = shortcutsPanelRef.current;
      const btn = shortcutsBtnRef.current;
      if (
        panel &&
        !panel.contains(e.target) &&
        btn &&
        !btn.contains(e.target)
      ) {
        setIsShortcutsOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsShortcutsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isShortcutsOpen]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setIsEditorFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  async function handleRun() {
    if (!user) {
      navigate("/sign-in");
      return;
    }
    setRunning(true);
    setSubmission(null);
    setTestResultTab(0);
    try {
      const body = { problemId, code, language: lang };
      const res = await axios.post(
        `${import.meta.env.VITE_APP_URL}/api/user/code/submit`,
        body,
        { withCredentials: true }
      );
      if (res.status >= 400)
        throw new Error(res.data?.message || "Judge request failed");
      setSubmission(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  }

  function handleReset() {
    setCode(problem.starterCode?.python ?? "// Start coding here\n");
  }

  function handleSave() {
    const key = `snippet_${problemId || "unknown"}_${lang}`;
    localStorage.setItem(key, code);
    const saveCode = async () => {
      try {
        await axios.post(
          `${import.meta.env.VITE_APP_URL}/api/user/code/save`,
          {
            problemId,
            code,
            language: lang,
          },
          { withCredentials: true }
        );
      } catch (error) {
        console.error("Error saving code:", error);
      }
    };
    saveCode();
  }

  const beforeMount = useCallback((monaco) => {
    // save monaco namespace (for theme switching)
    monacoRef.current = monaco;

    // dark theme
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [{ background: "1e1e1e" }],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.lineHighlightBackground": "#2c2c2e",
        "editorLineNumber.foreground": "#6e6e6e",
        "editor.selectionBackground": "#3a3d41",
        "editorGutter.background": "#1e1e1e",
      },
    });

    // light theme
    monaco.editor.defineTheme("custom-light", {
      base: "vs",
      inherit: true,
      rules: [{ background: "ffffff" }],
      colors: {
        "editor.background": "#ffffff",
        "editor.lineHighlightBackground": "#f3f4f6",
        "editorLineNumber.foreground": "#6b7280",
        "editor.selectionBackground": "#e6f0ff",
        "editor.foreground": "#111827",
        "editorGutter.background": "#ffffff",
      },
    });
  }, []);

  const handleEditorMount = useCallback(
    (editor, monaco) => {
      monacoEditorRef.current = editor;
      // ensure monacoRef is available if beforeMount wasn't called (safe)
      if (!monacoRef.current && monaco) monacoRef.current = monaco;

      editor.updateOptions({
        fontFamily: `"JetBrains Mono", "Fira Code", monospace`,
        fontSize,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: "on",
        tabSize: 4,
      });

      // set initial theme right after mount
      try {
        const m = monacoRef.current;
        if (m?.editor) m.editor.setTheme(themeName);
      } catch (e) {}
    },
    [fontSize, themeName]
  );

  const passedCount = useMemo(
    () => submission?.results?.filter((r) => r.passed).length ?? 0,
    [submission]
  );
  const totalCount = submission?.results?.length ?? 0;
  const allTestsPassed = passedCount === totalCount && totalCount > 0;
  const currentTestResult = submission?.results?.[testResultTab];

  if (loading) return <LoadingScreen />;

  // derive left panel title for placeholder
  const leftTabTitle =
    descriptionTab === "description"
      ? "Problem Description"
      : descriptionTab.charAt(0).toUpperCase() + descriptionTab.slice(1);

  // zoom handlers
  const zoomIn = () => setFontSize((s) => Math.min(32, s + 1));
  const zoomOut = () => setFontSize((s) => Math.max(10, s - 1));

  // toggle theme
  const toggleTheme = () => setIsDark((d) => !d);

  return (
    <div className="min-h-screen bg-black text-gray-200 p-4">
      <div className="mx-auto max-w-[96rem] h-[calc(100vh-2rem)]">
        <PanelGroup direction={isMobile ? "vertical" : "horizontal"}>
          <Panel defaultSize={50} minSize={30}>
            {/* LEFT PANEL: styling updated to match provided design */}
            <div className="rounded-lg border border-zinc-800 bg-[#0b0b0c] flex flex-col h-full overflow-hidden">
              {/* Top rounded nav bar */}
              <div className="mx-6 mt-2 mb-2">
                <div className="flex items-center justify-between bg-[#1e1e1e] border border-zinc-800 rounded-xl px-3 py-1">
                  {/* left - back arrow */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.history.back()}
                      className="p-2 rounded-md hover:bg-zinc-800 text-gray-300"
                      title="Back"
                      aria-label="Back"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="stroke-current text-gray-300"
                      >
                        <path
                          d="M15 18l-6-6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* center - tabs */}
                  <div className="flex items-center gap-6 ">
                    {[
                      "Problem Description",
                      "Solution",
                      "Video",
                      "Comments",
                    ].map((t) => {
                      const key =
                        t === "Problem Description"
                          ? "description"
                          : t.toLowerCase();
                      const active = descriptionTab === key;
                      return (
                        <button
                          key={t}
                          onClick={() => setDescriptionTab(key)}
                          className={`relative px-3 py-1 text-sm font-medium cursor-pointer  ${
                            active ? "text-white" : "text-gray-400"
                          }`}
                        >
                          {t}
                          {active && (
                            <span className="absolute left-0 right-0 -bottom-3 h-0.5 bg-white rounded" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* right - tiny icons */}
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded-md hover:bg-zinc-800 text-gray-400"
                      title="Toggle mute"
                    >
                      {/* small speaker-off icon placeholder */}
                      🔇
                    </button>
                  </div>
                </div>
              </div>

              {/* content card area */}
              {descriptionTab === "description" ? (
                <div className="px-6 overflow-y-auto flex-grow">
                  <div className="rounded-lg bg-[#1e1e1e] border border-zinc-800 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      {/* left small book icon */}
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-9 h-9 rounded-md bg-[#1e1e1e] border border-zinc-700 flex items-center justify-center text-gray-300">
                          📘
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h1 className="text-3xl font-bold text-white leading-tight">
                              {problem?.title}
                            </h1>
                            <div className="mt-3 flex items-center gap-2">
                              {/* difficulty pill - brown */}
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                  difficultyThemes[
                                    problem?.difficulty.toLowerCase()
                                  ] || "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {problem?.difficulty}
                              </span>
                              {/* category pill */}
                              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#1e1e1e] text-gray-300 border border-zinc-700">
                                {problem?.category}
                              </span>
                            </div>
                          </div>

                          {/* small action icon on right of title */}
                          <div className="ml-4">
                            <button className="w-10 h-10 rounded-md bg-[#1e1e1e] border border-zinc-700 flex items-center justify-center text-gray-300">
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <path
                                  d="M12 3v4"
                                  stroke="#C7C7C7"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 17v4"
                                  stroke="#C7C7C7"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M4 7h16"
                                  stroke="#C7C7C7"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M4 15h16"
                                  stroke="#C7C7C7"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* description */}
                        <div className="mt-6 prose prose-invert text-gray-300 max-w-none">
                          <p className="leading-relaxed whitespace-pre-wrap break-words">
                            {problem?.description}
                          </p>
                        </div>

                        {/* Example block */}
                        {problem?.sample && (
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white mb-3">
                              Example:
                            </h3>

                            <div className="space-y-4">
                              <div>
                                <div className="text-sm text-gray-400 mb-2">
                                  Input:
                                </div>
                                <div className="rounded-md bg-[#1e1e1e] border-2 border-zinc-700 p-4 text-sm">
                                  <pre className="font-mono whitespace-pre-wrap text-gray-200 m-0">
                                    {problem.sample.input}
                                  </pre>
                                  {/* place any additional small inputs like feature_i/threshold below if available */}
                                </div>
                              </div>

                              <div>
                                <div className="text-sm text-gray-400 mb-2">
                                  Output:
                                </div>
                                <div className="rounded-md bg-[#1e1e1e] border-2 border-zinc-700 p-4 text-sm">
                                  <pre className="font-mono whitespace-pre-wrap text-gray-200 m-0">
                                    {problem.sample.output}
                                  </pre>
                                </div>
                              </div>

                              {problem.sample.reasoning && (
                                <div>
                                  <div className="text-sm text-gray-400 mb-2">
                                    Reasoning:
                                  </div>
                                  <div className="rounded-md bg-[#1e1e1e] border-2 border-zinc-700 p-4 text-sm text-gray-300">
                                    <pre className="whitespace-pre-wrap m-0">
                                      {problem.sample.reasoning}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* bottom area: learn button & contributors */}
                        <div className="mt-8 pt-6 border-t border-zinc-800 space-y-6">
                          <div>
                            <button
                              onClick={() =>
                                setIsLearnPanelOpen((prev) => !prev)
                              }
                              className="px-4 py-2 text-sm border border-zinc-700 rounded-3xl hover:bg-zinc-800 transition disabled:opacity-50"
                              disabled={!problem?.aboutTopic}
                            >
                              Learn About topic
                            </button>
                            <AnimatePresence>
                              {isLearnPanelOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.28,
                                    ease: "easeInOut",
                                  }}
                                  style={{ overflow: "hidden" }}
                                >
                                  <LearnTopicPanel
                                    htmlContent={problem?.aboutTopic}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col items-start gap-1 text-sm">
                              <span className="text-gray-200 text-sm">
                                Contributors:
                              </span>
                              <a
                                href="#"
                                className="flex items-center gap-1.5 text-zinc-400 hover:text-white hover:underline"
                              >
                                Moe Chabot <FiExternalLink size={12} />
                              </a>
                            </div>

                            <button className="px-4 py-2 text-sm bg-[#1e1e1e] border border-zinc-700 rounded-3xl hover:bg-zinc-800 transition">
                              Contribute
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* request edit button */}
                  <div className="py-4 text-center bg-[#1e1e1e]">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-5 py-2 text-sm bg-[var(--color-bg)] border border-zinc-700 rounded-lg hover:bg-zinc-800 transition duration-500 cursor-pointer "
                    >
                      <span className="flex gap-2 items-center">
                        <FaEdit /> Request Edit
                      </span>
                    </button>
                  </div>
                </div>
              ) : descriptionTab === "solution" ? (
                <SolutionSection
                  problem={problem}
                  problemId={problemId}
                  setDescriptionTab={setDescriptionTab}
                />
              ) : (
                <div className="px-6 overflow-y-auto flex-grow">
                  <div className="rounded-lg min-h-full flex justify-center items-center bg-[#1e1e1e] border border-zinc-800 p-6 shadow-sm">
                    <PlaceholderContent title={leftTabTitle} />
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle
            className={`w-4 flex items-center justify-center group outline-none ${
              isMobile && "h-4 w-full"
            }`}
          >
            <div
              className={`rounded-full bg-zinc-800 group-hover:bg-blue-500 transition-colors ${
                isMobile ? "h-1.5 w-full" : "w-1.5 h-full"
              }`}
            />
          </PanelResizeHandle>

          <Panel defaultSize={50} minSize={30}>
            {/* RIGHT PANEL (unchanged) */}
            <div
              className={`rounded-lg border border-zinc-800 bg-[#09090B] flex flex-col h-full overflow-hidden ${
                isEditorFullscreen
                  ? "fixed py-4 px-6 inset-0 z-50 !h-screen !rounded-none"
                  : ""
              }`}
            >
              {/* --- Editor Top Bar: replaced to match image + removed Notebook Mode button --- */}
              <div className="relative flex items-center justify-between m-2 p-2 flex-shrink-0">
                {/* Center: language pill + 3-dot indicator */}
                <div className="flex  items-center gap-3 cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--color-bg)] border border-zinc-800">
                    <div className="text-sm font-semibold">Editor Mode</div>
                    <div className="w-2 h-2 rounded-full bg-green-300" />
                  </div>
                </div>

                {/* Right: icons including zoom in/out and fullscreen */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleTheme}
                    className="w-8 h-8 rounded-md border-1 border-zinc-800 hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                    title="Toggle theme"
                  >
                    <FiSun />
                  </button>

                  {/* zoom out */}
                  <button
                    onClick={zoomOut}
                    className="w-8 h-8 rounded-md border-1 border-zinc-800 hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                    title="Zoom out"
                  >
                    <FiMinus />
                  </button>

                  {/* zoom in */}
                  <button
                    onClick={zoomIn}
                    className="w-8 h-8 rounded-md border-1 border-zinc-800 hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                    title="Zoom in"
                  >
                    <FiPlus />
                  </button>

                  {/* keyboard icon (opens shortcuts) */}
                  <button
                    ref={shortcutsBtnRef}
                    onClick={() => setIsShortcutsOpen((s) => !s)}
                    className="w-8 h-8 rounded-md border-1 border-zinc-800 hover:bg-zinc-800 flex items-center justify-center cursor-pointer relative"
                    title="Keyboard shortcuts"
                    aria-expanded={isShortcutsOpen}
                    aria-controls="editor-shortcuts-panel"
                  >
                    <MdKeyboard />
                  </button>

                  {/* shortcuts panel (animated) */}
                  <AnimatePresence>
                    {isShortcutsOpen && (
                      <motion.div
                        id="editor-shortcuts-panel"
                        ref={shortcutsPanelRef}
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 6, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute right-2 top-full z-40 mt-2 w-80 rounded-lg bg-zinc-900 border border-zinc-700 shadow-lg"
                      >
                        <div className="p-3 border-b border-zinc-800">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-white">
                              Editor Shortcuts
                            </h4>
                            <button
                              onClick={() => setIsShortcutsOpen(false)}
                              className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded"
                              aria-label="Close shortcuts"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <div className="p-3 text-sm text-gray-300 space-y-2">
                          <div className="flex justify-between">
                            <div>Command Palette</div>
                            <div className="text-xs text-gray-400">
                              Ctrl / ⌘ + Shift + P
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div>Quick Open</div>
                            <div className="text-xs text-gray-400">
                              Ctrl / ⌘ + P
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div>Find</div>
                            <div className="text-xs text-gray-400">
                              Ctrl / ⌘ + F
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div>Replace</div>
                            <div className="text-xs text-gray-400">
                              Ctrl / ⌘ + H
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div>Go to Line</div>
                            <div className="text-xs text-gray-400">
                              Ctrl / ⌘ + G
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div>Toggle Comment</div>
                            <div className="text-xs text-gray-400">
                              Ctrl / ⌘ + /
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div>Format Document</div>
                            <div className="text-xs text-gray-400">
                              Shift + Alt + F
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div>Trigger Suggest</div>
                            <div className="text-xs text-gray-400">
                              Ctrl / ⌘ + Space
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <div>Run Code (UI)</div>
                            <div className="text-xs text-gray-400">
                              Run button
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* fullscreen toggle */}
                  <button
                    onClick={() => setIsEditorFullscreen((f) => !f)}
                    className="w-8 h-8 rounded-md border-1 border-zinc-800 hover:bg-zinc-800 flex items-center justify-center cursor-pointer"
                  >
                    {isEditorFullscreen ? <FiMinimize /> : <FiMaximize />}
                  </button>
                </div>
              </div>

              <PanelGroup direction="vertical" className="flex-grow">
                <Panel
                  defaultSize={60}
                  minSize={20}
                  className="mx-5 my-2 rounded-xl"
                >
                  <Editor
                    height="100%"
                    language={lang}
                    value={code}
                    onChange={(value) => setCode(value ?? "")}
                    beforeMount={beforeMount}
                    onMount={handleEditorMount}
                    theme={themeName}
                  />
                </Panel>
                <PanelResizeHandle className="h-2 w-full bg-[#161b22] flex items-center justify-center group outline-none">
                  <div className="w-full h-1 rounded-full bg-gray-700 group-hover:bg-blue-500 transition-colors" />
                </PanelResizeHandle>
                <Panel defaultSize={40} minSize={20} className="flex flex-col">
                  <div className="p-3 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={handleRun}
                      disabled={running}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-300 text-black font-semibold shadow-sm cursor-pointer disabled:bg-gray-500"
                    >
                      <VscPlay size={18} />
                      {running ? "Running..." : "Run Code"}
                    </button>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-1 border-zinc-800 cursor-pointer hover:bg-zinc-800"
                      >
                        <FiRefreshCw /> Reset
                      </button>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-1 border-zinc-800 cursor-pointer hover:bg-zinc-800"
                      >
                        <FiSave /> Save
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setIsSubmissionsOpen((prev) => !prev)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-1 border-zinc-800 cursor-pointer hover:bg-zinc-800"
                        >
                          <FiClock /> Submissions
                        </button>
                        {isSubmissionsOpen && (
                          <SubmissionsDropdown
                            problemId={problemId}
                            onSelectSubmission={setCode}
                            onClose={() => setIsSubmissionsOpen(false)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-grow bg-[#0d1117] overflow-y-auto">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white">
                            Test Results
                          </h3>
                          <span className="text-sm text-gray-400">
                            {passedCount}/{totalCount}
                          </span>
                        </div>
                        {submission && (
                          <span
                            className={`font-semibold text-sm ${
                              allTestsPassed ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {submission.status?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden mb-3">
                        <div
                          style={{
                            width:
                              totalCount > 0
                                ? `${(passedCount / totalCount) * 100}%`
                                : "0%",
                          }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            allTestsPassed ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 px-4 border-b border-gray-800">
                      {submission?.results?.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => setTestResultTab(i)}
                          className={`flex items-center gap-2 py-2 px-3 text-sm ${
                            testResultTab === i
                              ? "border-b-2 border-blue-500 text-white"
                              : "text-gray-400"
                          }`}
                        >
                          {r.passed ? (
                            <FaCheck className="text-green-500" />
                          ) : (
                            <FaTimes className="text-red-500" />
                          )}{" "}
                          Test {i + 1}
                        </button>
                      ))}
                    </div>
                    {currentTestResult ? (
                      <div className="p-4 space-y-4">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">
                            Test Case
                          </div>
                          <div className="rounded-md bg-[#161b22] p-3 text-sm font-mono">
                            {currentTestResult.testCase}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-400 mb-1">
                              Expected
                            </div>
                            <div className="rounded-md bg-[#161b22] p-3 text-sm font-mono">
                              {currentTestResult.expectedOutput}
                            </div>
                          </div>
                          <div className="relative">
                            <div className="text-sm text-gray-400 mb-1">
                              Your Output
                            </div>
                            <div
                              className={`rounded-md bg-[#161b22] p-3 text-sm font-mono whitespace-pre-wrap ${
                                !currentTestResult.passed && "text-red-400"
                              }`}
                            >
                              {currentTestResult.userOutput}
                            </div>
                            <span
                              className={`absolute top-0 right-0 mt-1 mr-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                currentTestResult.passed
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {currentTestResult.passed ? "Passed" : "Failed"}
                            </span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <button className="px-3 py-1.5 rounded-md text-sm bg-[#21262d] hover:bg-gray-700 border border-gray-700">
                            ⚡ Get Hint
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-gray-500">
                        Run code to see test results.
                      </div>
                    )}
                  </div>
                </Panel>
              </PanelGroup>
            </div>
          </Panel>
        </PanelGroup>
      </div>
      <RequestEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        problem={problem}
      />
    </div>
  );
}
