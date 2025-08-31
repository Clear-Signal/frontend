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

// --- Sub-components ---

const PlaceholderContent = ({ title }) => (
  <div className="flex items-center justify-center h-full text-gray-500">
    <div className="text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p>Content for this section is not yet available.</p>
    </div>
  </div>
);

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
        typeof window !== 'undefined' ? window.innerWidth : 0, 
        typeof window !== 'undefined' ? window.innerHeight : 0
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

  useEffect(() => {
    if (!problem) return;
    const key = `snippet_${problemId || "unknown"}_${lang}`;
    const saved = localStorage.getItem(key);
    setCode(saved ?? problem.starterCode?.python ?? "// Start coding here\n");
    setSubmission(null);
  }, [lang, problemId, problem]);

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
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [{ background: "1e1e1e" }],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.lineHighlightBackground": "#2c2c2e",
        "editorLineNumber.foreground": "#6e6e6e",
        "editor.selectionBackground": "#3a3d41",
      },
    });
  }, []);

  const handleEditorMount = useCallback((editor) => {
    monacoEditorRef.current = editor;
    editor.updateOptions({
      fontFamily: `"JetBrains Mono", "Fira Code", monospace`,
      fontSize: 14,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: "on",
      tabSize: 4,
    });
  }, []);

  const passedCount = useMemo(
    () => submission?.results?.filter((r) => r.passed).length ?? 0,
    [submission]
  );
  const totalCount = submission?.results?.length ?? 0;
  const allTestsPassed = passedCount === totalCount && totalCount > 0;
  const currentTestResult = submission?.results?.[testResultTab];

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-black text-gray-200 p-4">
      <div className="mx-auto max-w-[96rem] h-[calc(100vh-2rem)]">
        <PanelGroup direction={isMobile ? "vertical" : "horizontal"}>
            <Panel defaultSize={50} minSize={30}>
                {/* LEFT PANEL */}
                <div className="rounded-lg border border-zinc-800 bg-[#1e1e1e] flex flex-col h-full">
                    <div className="flex items-center overflow-x-auto p-2 border-b border-zinc-800 text-sm">
                        {['Description', 'Solution', 'Video', 'Comments'].map(tab => (
                            <button key={tab}
                                onClick={() => setDescriptionTab(tab.toLowerCase())}
                                className={`px-4 py-2 cursor-pointer flex-shrink-0 ${descriptionTab === tab.toLowerCase() ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}
                            >
                                {tab === 'Description' ? 'Problem Description' : tab}
                            </button>
                        ))}
                    </div>
                    <div className="p-6 overflow-y-auto flex-grow">
                        {descriptionTab === 'description' ? (
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <h1 className="text-2xl font-semibold break-words">{problem?.title}</h1>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-md hover:bg-gray-700"><FiLink size={16}/></button>
                                        <button className="p-2 rounded-md hover:bg-gray-700"><FiMaximize size={16}/></button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className="px-3 py-1 rounded-full bg-green-900 text-green-300 text-xs font-semibold">{problem?.difficulty || 'N/A'}</span>
                                    <span className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-xs font-semibold">{problem?.category}</span>
                                </div>
                                <div className="prose prose-invert max-w-none text-gray-300">
                                    <p className="leading-relaxed whitespace-pre-wrap break-words">{problem?.description}</p>
                                    {problem?.sample && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold mb-2 text-white">Example:</h3>
                                        <div className="space-y-4">
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Input:</div>
                                            <div className="rounded-md bg-[#2d2d2d] p-3 text-sm"><code className="font-mono">{problem.sample.input}</code></div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Output:</div>
                                            <div className="rounded-md bg-[#2d2d2d] p-3 text-sm"><code className="font-mono">{problem.sample.output}</code></div>
                                        </div>
                                        {problem.sample.reasoning && (
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Reasoning:</div>
                                                <div className="text-sm whitespace-pre-wrap break-words text-gray-400">{problem.sample.reasoning}</div>
                                            </div>
                                        )}
                                        </div>
                                    </div>
                                    )}
                                </div>

                                <div className="mt-10 pt-8 border-t border-zinc-800 space-y-8">
                                    <div>
                                        <button onClick={() => setIsLearnPanelOpen(prev => !prev)} className="px-4 py-2 text-sm border border-zinc-700 rounded-3xl hover:bg-zinc-800 transition" disabled={!problem?.aboutTopic}>
                                            Learn About topic
                                        </button>
                                        <AnimatePresence>
                                            {isLearnPanelOpen && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} style={{ overflow: "hidden" }}>
                                                    <LearnTopicPanel htmlContent={problem?.aboutTopic} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col items-start gap-1 text-sm">
                                            <span className="text-[var(--color-fg)] text-md">Contributors:</span>
                                            <a href="#" className="flex items-center gap-1.5 text-zinc-400 hover:text-white hover:underline">
                                                Moe Chabot <FiExternalLink size={12} />
                                            </a>
                                        </div>
                                        <button className="px-4 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-3xl hover:bg-zinc-700 transition">
                                            Contribute
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : <PlaceholderContent title={descriptionTab.charAt(0).toUpperCase() + descriptionTab.slice(1)} />}
                        
                        {descriptionTab === "description" && (
                            <div className="mt-12 text-center">
                                <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2 text-sm bg-[var(--color-bg)] border border-zinc-700 rounded-lg hover:bg-zinc-800 transition duration-500 cursor-pointer ">
                                    <span className="flex gap-2 items-center"><FaEdit /> Request Edit</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </Panel>

            <PanelResizeHandle className={`w-4 flex items-center justify-center group outline-none ${isMobile && 'h-4 w-full'}`}>
                <div className={`rounded-full bg-zinc-800 group-hover:bg-blue-500 transition-colors ${isMobile ? 'h-1.5 w-full' : 'w-1.5 h-full'}`} />
            </PanelResizeHandle>

            <Panel defaultSize={50} minSize={30}>
                {/* RIGHT PANEL */}
                <div className={`rounded-lg border border-zinc-800 bg-[#09090B] flex flex-col h-full overflow-hidden ${isEditorFullscreen ? "fixed py-4 px-6 inset-0 z-50 !h-screen !rounded-none" : ""}`}>
                    <div className="flex items-center justify-between p-2 border-b border-gray-800 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-medium p-2 rounded-md bg-[#21262d]">Notebook Mode</div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#21262d] border border-gray-700">
                                <div className="text-sm font-semibold">{lang === 'python' ? 'NumPy' : 'JavaScript'}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsEditorFullscreen(!isEditorFullscreen)} className="w-8 h-8 rounded-md bg-[#21262d] flex items-center justify-center">
                                {isEditorFullscreen ? <FiMinimize/> : <FiMaximize/>}
                            </button>
                        </div>
                    </div>
                    
                    <PanelGroup direction="vertical" className="flex-grow">
                        <Panel defaultSize={60} minSize={20}>
                            <Editor
                                height="100%" language={lang} value={code}
                                onChange={(value) => setCode(value ?? "")}
                                beforeMount={beforeMount} onMount={handleEditorMount}
                                theme="custom-dark"
                            />
                        </Panel>
                        <PanelResizeHandle className="h-2 w-full bg-[#161b22] flex items-center justify-center group outline-none">
                            <div className="w-full h-1 rounded-full bg-gray-700 group-hover:bg-blue-500 transition-colors"/>
                        </PanelResizeHandle>
                        <Panel defaultSize={40} minSize={20} className="flex flex-col">
                            <div className="p-3 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
                                <button onClick={handleRun} disabled={running} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-300 text-black font-semibold shadow-sm cursor-pointer disabled:bg-gray-500">
                                    <VscPlay size={18} />
                                    {running ? "Running..." : "Run Code"}
                                </button>
                                <div className="flex flex-wrap items-center gap-2">
                                    <button onClick={handleReset} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-1 border-zinc-800 cursor-pointer hover:bg-zinc-800"><FiRefreshCw /> Reset</button>
                                    <button onClick={handleSave} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-1 border-zinc-800 cursor-pointer hover:bg-zinc-800"><FiSave /> Save</button>
                                    <div className="relative">
                                        <button onClick={() => setIsSubmissionsOpen(prev => !prev)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-1 border-zinc-800 cursor-pointer hover:bg-zinc-800">
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
                                        <div className="flex items-center gap-3"><h3 className="font-semibold text-white">Test Results</h3><span className="text-sm text-gray-400">{passedCount}/{totalCount}</span></div>
                                        {submission && <span className={`font-semibold text-sm ${allTestsPassed ? 'text-green-500' : 'text-red-500'}`}>{submission.status?.toUpperCase()}</span>}
                                    </div>
                                    <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden mb-3">
                                        <div style={{ width: totalCount > 0 ? `${(passedCount / totalCount) * 100}%` : '0%'}} className={`h-full rounded-full transition-all duration-300 ${allTestsPassed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                    </div>
                                </div>
                                <div className="flex gap-2 px-4 border-b border-gray-800">
                                    {submission?.results?.map((r, i) => (
                                        <button key={i} onClick={() => setTestResultTab(i)} className={`flex items-center gap-2 py-2 px-3 text-sm ${testResultTab === i ? 'border-b-2 border-orange-500 text-white' : 'text-gray-400'}`}>
                                            {r.passed ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />} Test {i + 1}
                                        </button>
                                    ))}
                                </div>
                                {currentTestResult ? (
                                    <div className="p-4 space-y-4">
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Test Case</div>
                                            <div className="rounded-md bg-[#161b22] p-3 text-sm font-mono">{currentTestResult.testCase}</div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm text-gray-400 mb-1">Expected</div>
                                                <div className="rounded-md bg-[#161b22] p-3 text-sm font-mono">{currentTestResult.expectedOutput}</div>
                                            </div>
                                            <div className="relative">
                                                <div className="text-sm text-gray-400 mb-1">Your Output</div>
                                                <div className={`rounded-md bg-[#161b22] p-3 text-sm font-mono whitespace-pre-wrap ${!currentTestResult.passed && 'text-red-400'}`}>{currentTestResult.userOutput}</div>
                                                <span className={`absolute top-0 right-0 mt-1 mr-1 px-2 py-0.5 rounded-full text-xs font-semibold ${currentTestResult.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{currentTestResult.passed ? 'Passed' : 'Failed'}</span>
                                            </div>
                                        </div>
                                        <div className="pt-2">
                                            <button className="px-3 py-1.5 rounded-md text-sm bg-[#21262d] hover:bg-gray-700 border border-gray-700">⚡ Get Hint</button>
                                        </div>
                                    </div>
                                ) : ( <div className="p-4 text-sm text-gray-500">Run code to see test results.</div> )}
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