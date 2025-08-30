import { useEffect, useRef, useState, useCallback, useMemo, useContext } from "react";
import Editor from "@monaco-editor/react";
import { FiRefreshCw, FiSave, FiClock, FiMaximize, FiMinimize, FiLink } from "react-icons/fi";
import { FaCheck, FaTimes } from "react-icons/fa";
import { VscPlay } from "react-icons/vsc";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import axios from "axios";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import LoadingScreen from "../components/LoadingScreen";
import { AuthContext } from "../stores/authStore";

// Placeholder content for the new tabs
const PlaceholderContent = ({ title }) => (
  <div className="flex items-center justify-center h-full text-gray-500">
    <div className="text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p>Content for this section is not yet available.</p>
    </div>
  </div>
);

export default function ProblemSolver() {
  const [descriptionTab, setDescriptionTab] = useState("description"); // For left panel
  const [testResultTab, setTestResultTab] = useState(0);
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState(null);
  const [running, setRunning] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);

  const {user} = useContext(AuthContext);
  const navigate = useNavigate();

  const params = useParams();
  const problemId = params.id;

  const { data: problem, loading } = useFetch(`/api/general/problems/${problemId}`);
  const monacoEditorRef = useRef(null);

  useEffect(() => {
    if (!problem) return;
    const key = `snippet_${problemId || "unknown"}_${lang}`;
    const saved = localStorage.getItem(key);
    setCode(saved ?? problem.starterCode?.python ?? "// Start coding here\n");
    setSubmission(null);
  }, [lang, problemId, problem]);
  
  // Fullscreen escape listener
  useEffect(() => {
    const handleEsc = (event) => {
       if (event.key === 'Escape') {
        setIsEditorFullscreen(false);
       }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);


  async function handleRun() {
    if(!user) {
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
      if (res.status >= 400) throw new Error(res.data?.message || "Judge request failed");
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
        await axios.post(`${import.meta.env.VITE_APP_URL}/api/user/code/save`, {
          problemId,
          code,
          language: lang,
        }, { withCredentials: true });
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

  const passedCount = useMemo(() => submission?.results?.filter((r) => r.passed).length ?? 0, [submission]);
  const totalCount = submission?.results?.length ?? 0;
  const allTestsPassed = passedCount === totalCount && totalCount > 0;
  const currentTestResult = submission?.results?.[testResultTab];

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 p-4">
      <div className="mx-auto px-2 max-w-8xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT PANEL */}
          <div className="rounded-lg border border-zinc-800 bg-[#1e1e1e] flex flex-col h-[calc(100vh-2rem)]">
            <div className="flex items-center not-sm:overflow-scroll p-2 border-b border-zinc-800 text-sm">
                {['Description', 'Solution', 'Video', 'Comments'].map(tab => (
                    <button key={tab}
                        onClick={() => setDescriptionTab(tab.toLowerCase())}
                        className={`px-4 py-2 cursor-pointer ${descriptionTab === tab.toLowerCase() ? 'border-b-2 border-white text-white' : 'text-gray-400'}`}
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
                        <span className="px-3 py-1 rounded-full bg-green-900 text-green-300 text-xs font-semibold">Easy</span>
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
                                <div className="rounded-md bg-[#1e1e1e] border-1 border-gray-400 p-3 text-sm"><code className="font-mono">{problem.sample.input}</code></div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-400 mb-1">Output:</div>
                                <div className="rounded-md bg-[#1e1e1e] border border-gray-400 p-3 text-sm"><code className="font-mono">{problem.sample.output}</code></div>
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
                 </>
              ) : <PlaceholderContent title={descriptionTab.charAt(0).toUpperCase() + descriptionTab.slice(1)} />}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className={`rounded-lg border border-gray-800 bg-[#18181b] flex flex-col h-[calc(100vh-2rem)] overflow-hidden ${isEditorFullscreen ? 'fixed py-4 px-6 inset-0 z-50 !h-screen !rounded-none' : ''}`}>
            {/* Toolbar */}
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
                      height="100%"
                      language={lang}
                      value={code}
                      onChange={(value) => setCode(value ?? "")}
                      beforeMount={beforeMount}
                      onMount={handleEditorMount}
                      theme="custom-dark"
                  />
              </Panel>
              <PanelResizeHandle className="h-2 w-full bg-[#161b22] flex items-center justify-center group outline-none">
                 <div className="w-8 h-1 rounded-full bg-gray-700 group-hover:bg-orange-500 transition-colors"/>
              </PanelResizeHandle>
              <Panel defaultSize={40} minSize={20} className="flex flex-col">
                {/* Action Row */}
                <div className="p-3 border-b border-gray-800 flex items-center justify-between flex-wrap gap-2">
                  <button onClick={handleRun} disabled={running} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white font-semibold shadow-sm hover:bg-green-500 disabled:bg-gray-500 cursor-pointer">
                    <VscPlay size={18} />
                    {running ? "Running..." : "Run Code"}
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                     <button onClick={handleReset} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#21262d] cursor-pointer hover:bg-gray-700"><FiRefreshCw /> Reset</button>
                     <button onClick={handleSave} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#21262d] cursor-pointer hover:bg-gray-700"><FiSave /> Save</button>
                     <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[#21262d] cursor-pointer hover:bg-gray-700">
                        <FiClock /> Submissions <span className="ml-1 bg-gray-600 px-2 py-0.5 rounded-full text-xs">3</span>
                     </button>
                  </div>
                </div>
                {/* Test Results */}
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
        </div>
      </div>
    </div>
  );
}