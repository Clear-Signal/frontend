// ProblemSolverWithMonaco.jsx
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Editor from "@monaco-editor/react";
import { FiRefreshCw, FiSave, FiClock } from "react-icons/fi";
import { BsFillLightningChargeFill } from "react-icons/bs";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";

export default function ProblemSolver() {
  const [tab, setTab] = useState("desc"); // desc | solution | video | comments
  const [lang, setLang] = useState("python"); // python | js
  const [code, setCode] = useState(null);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  const params = useParams();
  const problemId = params.id;

  const {
    data: problem,
    loading,
    error,
  } = useFetch(`/api/general/problems/${problemId}`);
  console.log(problem?.starterCode?.python);
  // submission state (parsed judge response)
  const [submission, setSubmission] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);

  // Monaco editor refs
  const monacoEditorRef = useRef(null);
  const monacoInstanceRef = useRef(null);

  // Load saved snippet or default comment when problemId or lang changes
  useEffect(() => {
    if (!problem) return; // wait until problem is loaded
    const key = `snippet_${problemId || "unknown"}_${lang}`;
    const saved = localStorage.getItem(key);
    if (saved) setCode(saved);
    else
      setCode(
        lang === "python"
          ? problem.starterCode?.python
          : "// write your solution here\n"
      );

    // clear previous submission when switching problem/lang
    setSubmission(null);
    setSubmissionError(null);
    setOutput("");
  }, [lang, problemId]);

  // ======= Run action: send to backend judge endpoint =======
  async function handleRun() {
    setOutput("");
    setRunning(true);
    setSubmission(null);
    setSubmissionError(null);

    try {
      const body = { problemId, code, language: lang || "python" };
      const res = await axios.post(
        `${import.meta.env.VITE_APP_URL}/api/user/code/submit`,
        body,
        {
          withCredentials: true,
        }
      );

      if (res.status !== 200 && res.status !== 201) {
        const txt =
          res.data?.message || res.statusText || "Judge request failed";
        throw new Error(txt);
      }

      const json = res.data;
      setOutput(JSON.stringify(json, null, 2));
      setSubmission(json);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        String(err) ||
        "Unknown error";
      setSubmissionError(msg);
      setOutput("Error: " + msg);
    } finally {
      setRunning(false);
    }
  }

  function handleReset() {
    const key = `snippet_${problemId || "unknown"}_${lang}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setCode(saved);
      setOutput((o) => o + `\n[Restored saved snippet from ${key}]\n`);
    } else {
      setCode(
        lang === "python"
          ? "# write your solution here\n"
          : "// write your solution here\n"
      );
      setOutput("");
    }
    if (monacoEditorRef.current) {
      monacoEditorRef.current.setValue(
        saved ??
          (lang === "python"
            ? "# write your solution here\n"
            : "// write your solution here\n")
      );
    }
  }

  function handleSave() {
    try {
      const key = `snippet_${problemId || "unknown"}_${lang}`;
      localStorage.setItem(key, code);
      setOutput((o) => o + `\n[Saved to ${key}]\n`);
    } catch (e) {
      setOutput((o) => o + `\n[Save failed: ${e}]\n`);
    }
  }

  // ======= Monaco theme & mount hooks (unchanged) =======
  const beforeMount = useCallback((monaco) => {
    const style = getComputedStyle(document.documentElement);
    const bg =
      style.getPropertyValue("--color-surface")?.trim() ||
      style.getPropertyValue("--color-bg-hex")?.trim() ||
      "#000102";
    const fg =
      style.getPropertyValue("--text-default")?.trim() ||
      style.getPropertyValue("--color-fg-hex")?.trim() ||
      "#eaf2ff";
    const gutter =
      style.getPropertyValue("--panel-border")?.trim() ||
      "rgba(234,242,255,0.06)";
    const selection =
      style.getPropertyValue("--brand")?.trim() ||
      style.getPropertyValue("--color-primary-hex")?.trim() ||
      "#e1c34b";
    const accent =
      style.getPropertyValue("--accent")?.trim() ||
      style.getPropertyValue("--color-accent-hex")?.trim() ||
      "#ff8950";
    const editorBackground = bg;

    monaco.editor.defineTheme("clearSignalDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        {
          token: "",
          background: editorBackground.replace(/\s/g, ""),
          foreground: fg.replace(/\s/g, ""),
        },
        { token: "keyword", foreground: selection.replace("#", "") },
        { token: "number", foreground: accent.replace("#", "") },
      ],
      colors: {
        "editor.background": editorBackground,
        "editor.foreground": fg,
        "editorLineNumber.foreground": gutter,
        "editorLineNumber.activeForeground": fg,
        "editorCursor.foreground": selection,
        "editor.selectionBackground": selection + "55",
        "editor.inactiveSelectionBackground": selection + "22",
        "editorIndentGuide.background": "rgba(255,255,255,0.02)",
        "editorIndentGuide.activeBackground": "rgba(255,255,255,0.04)",
        "editorLineNumber.background": editorBackground,
        "editorWidget.background": "rgba(10,10,10,0.75)",
      },
    });

    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }, []);

  const handleEditorMount = useCallback((editor, monaco) => {
    monacoEditorRef.current = editor;
    monacoInstanceRef.current = monaco;
    monaco.editor.setTheme("clearSignalDark");
    editor.updateOptions({
      fontFamily: `"JetBrains Mono", "Fira Code", monospace`,
      fontSize: 13,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      automaticLayout: true,
      wordWrap: "on",
      tabSize: 2,
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // update monaco value when `code` state changes externally
  useEffect(() => {
    if (monacoEditorRef.current) {
      const current = monacoEditorRef.current.getValue();
      if (current !== code) monacoEditorRef.current.setValue(code);
    }
  }, [code]);

  // helper for rendering status badge
  function StatusBadge({ status }) {
    const s = (status || "").toLowerCase();
    if (s === "passed" || s === "success") {
      return (
        <span className="px-3 py-1 rounded-full bg-green-500 text-black text-xs font-semibold">
          {status}
        </span>
      );
    }
    if (s === "failed") {
      return (
        <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-semibold">
          {status}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-gray-600 text-white text-xs font-semibold">
        {status || "unknown"}
      </span>
    );
  }

  // derived metrics for test results
  const passedCount = useMemo(() => {
    if (!submission?.results) return 0;
    return submission.results.filter((r) => r.passed).length;
  }, [submission]);

  const totalCount = submission?.results?.length ?? 0;
  const passPercent =
    totalCount === 0 ? 0 : Math.round((passedCount / totalCount) * 100);

  // small helper for rendering test tab label state
  function TabIndicator({ passed }) {
    return (
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold ${
          passed ? "bg-green-500 text-black" : "bg-red-600 text-white"
        }`}
      >
        {passed ? "✓" : "✕"}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex bg-[#1e1e1e] w-full items-center justify-center min-h-screen text-4xl text-[var(--text-default)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-black)] text-[var(--color-fg)] p-6">
      <div className="mx-auto max-w-8xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Problem details - dark card with tabs on top */}
          <div className="rounded-2xl border border-[var(--panel-border)] bg-[#1e1e1e] p-6 shadow-sm min-h-[520px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {/* small left icon */}
                <div className="w-9 h-9 rounded-md bg-[var(--bg-page)]/5 flex items-center justify-center text-[var(--color-primary)]">
                  📘
                </div>
                <div>
                  <div className="text-sm text-[var(--text-muted)]">
                    Problem Description
                  </div>
                  <h1 className="text-2xl font-semibold mt-1 break-words">
                    {problem?.title || "Loading..."}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-page)]/5 border border-[var(--panel-border)] text-sm">
                  <span className="px-2 py-0.5 rounded-full bg-green-600 text-black text-xs font-semibold">
                    Easy
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[var(--bg-page)]/10 text-xs">
                    {problem?.category || "Uncategorized"}
                  </span>
                </div>
                {/* expand/share icons placeholders */}
                <button className="w-9 h-9 rounded-md bg-[var(--bg-page)]/5 flex items-center justify-center">
                  ⤢
                </button>
                <button className="w-9 h-9 rounded-md bg-[var(--bg-page)]/5 flex items-center justify-center">
                  🔗
                </button>
              </div>
            </div>

            {/* description body */}
            <div className="prose prose-invert text-[var(--color-fg)]">
              <p className="leading-relaxed whitespace-pre-wrap break-words">
                {problem?.description || ""}
              </p>

              {problem?.sample && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Example:</h3>

                  <div className="mb-3">
                    <div className="text-sm text-[var(--text-muted)] mb-1">
                      Input:
                    </div>
                    <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--bg-page)]/3 p-4 text-sm whitespace-pre-wrap break-words">
                      <code className="text-sm">{problem.sample.input}</code>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm text-[var(--text-muted)] mb-1">
                      Output:
                    </div>
                    <div className="rounded-lg border border-[var(--panel-border)] bg-[var(--bg-page)]/3 p-4 text-sm whitespace-pre-wrap break-words">
                      <code className="text-sm">{problem.sample.output}</code>
                    </div>
                  </div>

                  {problem.sample.reasoning && (
                    <div className="mb-1">
                      <div className="text-sm text-[var(--text-muted)] mb-1">
                        Reasoning:
                      </div>
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {problem.sample.reasoning}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">Notes</h4>
                <p className="text-sm text-[var(--text-muted)]">
                  The judge runs on the backend. Click <strong>Run Code</strong>{" "}
                  to submit your solution; results will appear on the right.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Editor + toolbar + results */}
          <div className="flex flex-col rounded-2xl border border-[var(--panel-border)] bg-[var(--color-bg)] overflow-hidden min-h-[520px]">
            {/* toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-[var(--panel-border)]">
              <div className="flex items-center gap-3">
                {/* notebook toggle look */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[var(--bg-page)]/5 px-3 py-1 rounded-full">
                    <div className="w-9 h-9 rounded-md bg-[var(--bg-page)]/10 flex items-center justify-center">
                      📝
                    </div>
                    <div className="text-sm">Notebook Mode</div>
                  </div>
                </div>
                {/* language select pill */}
                <div className="ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-page)]/5 border border-[var(--panel-border)]">
                  <div className="text-xs font-semibold">
                    {lang === "python" ? "Python" : "JavaScript"}
                  </div>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="bg-transparent text-sm ml-2 outline-none"
                  >
                    <option value="python">Python</option>
                    <option value="js">JavaScript</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="w-9 h-9 rounded-md bg-[var(--bg-page)]/5 flex items-center justify-center">
                  ☀️
                </button>
                <button className="w-9 h-9 rounded-md bg-[var(--bg-page)]/5 flex items-center justify-center">
                  −
                </button>
                <button className="w-9 h-9 rounded-md bg-[var(--bg-page)]/5 flex items-center justify-center">
                  +
                </button>
                <button className="w-9 h-9 rounded-md bg-[var(--bg-page)]/5 flex items-center justify-center">
                  ⌨️
                </button>
              </div>
            </div>

            {/* editor */}
            <div className="flex-1 min-h-[360px]">
              {code === null ? (
                <Editor
                  height="100%"
                  defaultLanguage={lang === "python" ? "python" : "javascript"}
                  language={lang === "python" ? "python" : "javascript"}
                  value={code}
                  onChange={(value) => setCode(value ?? "")}
                  beforeMount={beforeMount}
                  onMount={handleEditorMount}
                  theme="clearSignalDark"
                  options={{
                    minimap: { enabled: false },
                    fontFamily: `"JetBrains Mono", "Fira Code", monospace`,
                    fontSize: 13,
                    lineNumbers: "on",
                    tabSize: 2,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    mouseWheelZoom: true,
                  }}
                />
              ):(
                <div className="flex items-center justify-center h-40 text-gray-500">
                  Loading editor...
                </div>
              )}
            </div>

            {/* action row */}
            <div className="p-4 border-t border-[var(--panel-border)] flex items-center justify-between gap-3">
              <div>
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white text-black font-semibold shadow-sm"
                >
                  <BsFillLightningChargeFill />{" "}
                  {running ? "Running..." : "Run Code"}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--panel-border)]"
                >
                  <FiRefreshCw /> Reset
                </button>

                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--panel-border)]"
                >
                  <FiSave /> Save Code
                </button>

                <button
                  onClick={() => {}}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--panel-border)]"
                >
                  <FiClock /> Submissions{" "}
                  <span className="ml-2 inline-block bg-[var(--bg-page)]/10 px-2 py-0.5 rounded-full text-xs">
                    3
                  </span>
                </button>
              </div>
            </div>

            {/* Test Results area (bottom) */}
            <div className="border-t m-5 border-[var(--panel-border)] bg-[var(--color-bg-gray)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-green-500" />
                  <div className="font-semibold">Test Results</div>
                  <div className="text-sm text-[var(--text-default)]">
                    {totalCount ? `${passedCount}/${totalCount}` : "0/0"}
                  </div>
                </div>
                <div className="text-sm text-[var(--text-default)]">
                  {submission?.status ? submission.status.toUpperCase() : ""}
                </div>
              </div>

              {/* progress bar */}
              <div className="h-1 rounded bg-[rgba(255,255,255,0.06)] overflow-hidden mb-3">
                <div
                  className={`h-full ${
                    passPercent === 100
                      ? "bg-green-500"
                      : "bg-[var(--color-primary)]/60"
                  }`}
                  style={{
                    width: `${passPercent}%`,
                    transition: "width 300ms ease",
                  }}
                />
              </div>

              {/* test tabs */}
              <div className="flex gap-3 bg-[#1e1e1e] border-b border-[var(--panel-border)] mb-3 overflow-auto">
                {submission?.results?.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setTab(`test-${i}`)}
                    className={`py-1 px-3 ${
                      tab === `test-${i}`
                        ? "bg-zinc-700 border-b-2 border-[var(--color-success)]"
                        : "text-[var(--text-default)]/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <TabIndicator passed={r.passed} />
                      <span>Test {i + 1}</span>
                    </div>
                  </button>
                ))}

                {/* fallback when no tests */}
                {!submission?.results?.length && (
                  <>
                    <div className="py-2 px-3 text-[var(--text-muted)]">
                      No tests
                    </div>
                  </>
                )}
              </div>

              {/* currently selected test details */}
              {submission?.results && submission.results.length > 0 ? (
                (() => {
                  // determine which tab index to show
                  const match = tab.startsWith("test-")
                    ? Number(tab.split("-")[1])
                    : 0;
                  const idx = Number.isFinite(match)
                    ? Math.max(
                        0,
                        Math.min(match, submission.results.length - 1)
                      )
                    : 0;
                  const result = submission.results[idx];

                  return (
                    <div className="pt-3">
                      <div className="text-sm text-[var(--text-default)] mb-2">
                        Test Case
                      </div>
                      <div className="rounded-lg border border-[var(--panel-border)] bg-zinc-700 p-3 text-sm whitespace-pre-wrap break-words mb-4">
                        <code>{result.testCase}</code>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-[var(--text-default)] mb-1">
                            Expected
                          </div>
                          <div className="rounded-lg border border-[var(--panel-border)] bg-zinc-700 p-3 text-sm whitespace-pre-wrap break-words">
                            <code>{result.expectedOutput}</code>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-[var(--text-default)] mb-1">
                              Your Output
                            </div>
                            <div>
                              {result.passed ? (
                                <span className="px-3 py-1 rounded-full bg-green-500 text-black text-sm font-semibold">
                                  Passed
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-red-600 text-white text-sm font-semibold">
                                  Failed
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="rounded-lg border border-[var(--panel-border)] bg-zinc-700 p-3 text-sm whitespace-pre-wrap break-words">
                            <code>{result.userOutput}</code>
                          </div>
                        </div>
                      </div>

                      {/* optional hint button */}
                      <div className="mt-4">
                        <button className="px-4 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]">
                          ⚡ Get Hint
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-sm text-[var(--text-muted)]">
                  Run your code to see test results here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
