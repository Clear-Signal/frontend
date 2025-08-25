// ProblemSolverWithMonaco.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { FiPlay, FiRefreshCw, FiSave, FiExternalLink } from "react-icons/fi";

// SAMPLE_PROBLEM: Confusion Matrix & F1 Score
export const SAMPLE_PROBLEM = {
  id: "confusion-f1",
  title: "Confusion Matrix & F1 Score",
  difficulty: "Medium",
  category: "Evaluation Metrics",
  description: `
Given two arrays: ground-truth labels (y_true) and predicted labels (y_pred), and a specified positive label,
compute the confusion matrix counts (TP, FP, FN, TN) for the positive label, then compute precision, recall and F1 score.

Rules:
- TP: true == positive_label && pred == positive_label
- FP: true != positive_label && pred == positive_label
- FN: true == positive_label && pred != positive_label
- TN: true != positive_label && pred != positive_label

Precision = TP / (TP + FP) if TP+FP > 0 else 0.0
Recall    = TP / (TP + FN) if TP+FN > 0 else 0.0
F1        = 2 * precision * recall / (precision + recall) if precision+recall > 0 else 0.0

Return an object with numeric fields: { tp, fp, fn, tn, precision, recall, f1 }.
Round precision, recall and f1 to 4 decimal places in the output.
  `.trim(),
  inputFormat: `Three values:
- y_true: array (list) of labels (numbers or strings)
- y_pred: array (list) of labels (numbers or strings)
- positive_label: label value treated as positive (number or string)
Both arrays have equal length (n >= 1).`,
  outputFormat: `An object/dictionary with:
{
  tp: int,
  fp: int,
  fn: int,
  tn: int,
  precision: float (rounded to 4 decimals),
  recall: float (rounded to 4 decimals),
  f1: float (rounded to 4 decimals)
}`,
  exampleIn: `y_true = [1, 0, 1, 1, 0, 1]
y_pred = [1, 0, 0, 1, 0, 1]
positive_label = 1`,
  exampleOut: `{
  "tp": 3,
  "fp": 0,
  "fn": 1,
  "tn": 2,
  "precision": 1.0,
  "recall": 0.75,
  "f1": 0.8571
}`,
  reasoning: `Count per-class outcomes using the positive label; compute precision/recall with safe divisions (0 if denominator zero).`,
  // starter templates
  templatePython: `def confusion_f1(y_true: list, y_pred: list, positive_label) -> dict:
    """
    Return a dict: { tp, fp, fn, tn, precision, recall, f1 }
    Round precision, recall and f1 to 4 decimal places.
    """
    # implement here
    pass
`,
  templateJS: `// y_true: array, y_pred: array, positive_label: value
function confusionF1(y_true, y_pred, positive_label) {
  // return object: { tp, fp, fn, tn, precision, recall, f1 }
  // implement here
  return null;
}`,
  // tests for your harness (the runner used earlier expects input and expected)
  tests: [
    // 1 - normal mixed case
    {
      input: {
        y_true: [1, 0, 1, 1, 0, 1],
        y_pred: [1, 0, 0, 1, 0, 1],
        positive_label: 1,
      },
      expected: {
        tp: 3,
        fp: 0,
        fn: 1,
        tn: 2,
        precision: 1.0,
        recall: 0.75,
        f1: 0.8571,
      },
    },
    // 2 - all predicted positive (no true positives)
    {
      input: { y_true: [0, 0, 0, 0], y_pred: [1, 1, 1, 1], positive_label: 1 },
      expected: {
        tp: 0,
        fp: 4,
        fn: 0,
        tn: 0,
        precision: 0.0,
        recall: 0.0,
        f1: 0.0,
      },
    },
    // 3 - perfect prediction
    {
      input: { y_true: [1, 1, 1], y_pred: [1, 1, 1], positive_label: 1 },
      expected: {
        tp: 3,
        fp: 0,
        fn: 0,
        tn: 0,
        precision: 1.0,
        recall: 1.0,
        f1: 1.0,
      },
    },
    // 4 - string labels
    {
      input: {
        y_true: ["spam", "ham", "spam", "ham"],
        y_pred: ["spam", "spam", "ham", "ham"],
        positive_label: "spam",
      },
      expected: {
        tp: 1,
        fp: 1,
        fn: 1,
        tn: 1,
        precision: 0.5,
        recall: 0.5,
        f1: 0.5,
      },
    },
    // 5 - positive label not present
    {
      input: { y_true: [0, 0, 0], y_pred: [0, 0, 0], positive_label: 1 },
      expected: {
        tp: 0,
        fp: 0,
        fn: 0,
        tn: 3,
        precision: 0.0,
        recall: 0.0,
        f1: 0.0,
      },
    },
  ],
};

export default function ProblemSolver() {
  const [tab, setTab] = useState("desc"); // desc | solution | video | comments
  const [lang, setLang] = useState("python"); // python | js
  const [notebookMode, setNotebookMode] = useState(false);
  const [pyodide, setPyodide] = useState(null);
  const [loadingPyodide, setLoadingPyodide] = useState(false);
  const [code, setCode] = useState(SAMPLE_PROBLEM.templatePython);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  // Monaco editor refs
  const monacoEditorRef = useRef(null);
  const monacoInstanceRef = useRef(null);

  // Load pyodide lazily when switching to python
  useEffect(() => {
    setCode(
      lang === "python"
        ? SAMPLE_PROBLEM.templatePython
        : SAMPLE_PROBLEM.templateJS
    );
    if (lang === "python" && !pyodide && !loadingPyodide) {
      loadPyodideAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  async function loadPyodideAsync() {
    setLoadingPyodide(true);
    try {
      const pyodideModule = await import(
        "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
      );
      const py = await pyodideModule.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
      });
      setPyodide(py);
      setOutput((o) => o + "\n[Pyodide loaded — Python execution available]\n");
    } catch (err) {
      setOutput(
        (o) => o + `\n[Failed to load Pyodide: ${err.message || err}]\n`
      );
    } finally {
      setLoadingPyodide(false);
    }
  }

  // ======= Execution helpers (unchanged / slightly adapted) =======
  function runJS(userCode) {
    try {
      const harness = `
        "use strict";
        ${userCode}
        const tests = ${JSON.stringify(SAMPLE_PROBLEM.tests)};
        const results = [];
        for (let t of tests) {
          try {
            const out = matrixDotVector(t.input.a, t.input.b);
            results.push({ ok: JSON.stringify(out) === JSON.stringify(t.expected), got: out, expected: t.expected });
          } catch (e) {
            results.push({ ok: false, error: String(e) });
          }
        }
        return JSON.stringify({ results });
      `;
      const fn = new Function(harness);
      const resJson = fn();
      return { success: true, output: JSON.parse(resJson) };
    } catch (err) {
      return { success: false, error: err.toString() };
    }
  }

  async function runPython(userCode) {
    if (!pyodide) {
      return { success: false, error: "Pyodide not loaded" };
    }
    const testsPy = JSON.stringify(SAMPLE_PROBLEM.tests);
    const full = `
${userCode}

import json, traceback
tests = json.loads(r'''${testsPy}''')
results = []
for t in tests:
    try:
        a = t["input"]["a"]
        b = t["input"]["b"]
        out = matrix_dot_vector(a, b)
        ok = out == t["expected"]
        results.append({"ok": ok, "got": out, "expected": t["expected"]})
    except Exception as e:
        results.append({"ok": False, "error": traceback.format_exc()})
json.dumps({"results": results})
`.trim();

    try {
      const pyResult = await pyodide.runPythonAsync(full);
      const parsed = JSON.parse(pyResult);
      return { success: true, output: parsed };
    } catch (err) {
      return { success: false, error: err.toString() };
    }
  }

  // ======= Run / Reset / Save actions =======
  async function handleRun() {
    setOutput("");
    setRunning(true);

    if (lang === "js") {
      const res = runJS(code);
      if (res.success) setOutput(JSON.stringify(res.output, null, 2));
      else setOutput("Error: " + (res.error || "Unknown"));
      setRunning(false);
      return;
    }

    if (lang === "python") {
      if (!pyodide) {
        setOutput("Loading Python runtime... (please wait)");
        await loadPyodideAsync();
      }
      const res = await runPython(code);
      if (res.success) setOutput(JSON.stringify(res.output, null, 2));
      else setOutput("Error: " + (res.error || "Unknown"));
      setRunning(false);
      return;
    }

    setOutput("Unsupported language");
    setRunning(false);
  }

  function handleReset() {
    setCode(
      lang === "python"
        ? SAMPLE_PROBLEM.templatePython
        : SAMPLE_PROBLEM.templateJS
    );
    setOutput("");
    // update Monaco value manually if editor mounted
    if (monacoEditorRef.current)
      monacoEditorRef.current.setValue(
        lang === "python"
          ? SAMPLE_PROBLEM.templatePython
          : SAMPLE_PROBLEM.templateJS
      );
  }

  function handleSave() {
    try {
      const key = `snippet_${SAMPLE_PROBLEM.id}_${lang}`;
      localStorage.setItem(key, code);
      setOutput((o) => o + `\n[Saved to ${key}]\n`);
    } catch (e) {
      setOutput((o) => o + `\n[Save failed: ${e}]\n`);
    }
  }

  useEffect(() => {
    const key = `snippet_${SAMPLE_PROBLEM.id}_${lang}`;
    const saved = localStorage.getItem(key);
    if (saved) setCode(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // ======= Monaco theme & mount hooks =======
  const beforeMount = useCallback((monaco) => {
    // read CSS variables to create theme colours
    const style = getComputedStyle(document.documentElement);
    const bg =
      style.getPropertyValue("--bg-page")?.trim() ||
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

    // define a custom theme that uses your CSS variables (fallback to hex)
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

    // set some TypeScript/JS defaults if needed
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
    // (no return value)
  }, []);

  const handleEditorMount = useCallback((editor, monaco) => {
    monacoEditorRef.current = editor;
    monacoInstanceRef.current = monaco;
    // apply our theme
    monaco.editor.setTheme("clearSignalDark");
    // set some editor-level options programmatically if desired
    editor.updateOptions({
      fontFamily: `"JetBrains Mono", "Fira Code", monospace`,
      fontSize: 13,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      automaticLayout: true,
      wordWrap: "off",
      tabSize: 2,
    });

    // If you want to bind Cmd/Ctrl+Enter to run:
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });
    // set initial value (monaco will manage it via value prop too)
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // update monaco value when `code` state changes externally (e.g., reset)
  useEffect(() => {
    if (monacoEditorRef.current) {
      const current = monacoEditorRef.current.getValue();
      if (current !== code) monacoEditorRef.current.setValue(code);
    }
  }, [code]);

  // UI: HeaderBadge component (unchanged)
  const HeaderBadge = () => (
    <div className="inline-flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-[var(--color-bg)] flex items-center justify-center border border-[var(--color-gray)]">
        <div className="text-[var(--color-fg)] font-bold">DL</div>
      </div>
      <div>
        <div className="text-lg font-semibold">{SAMPLE_PROBLEM.title}</div>
        <div className="text-xs text-[var(--color-fg)]">
          {SAMPLE_PROBLEM.difficulty} · {SAMPLE_PROBLEM.category}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] p-4">
      <div className="mx-5">
        <div className="flex items-center justify-between mb-4">
          <HeaderBadge />
          <div className="flex items-center gap-2 flex-wrap">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notebookMode}
                onChange={() => setNotebookMode((s) => !s)}
              />
              <span className="text-[var(--color-fg)]">Notebook Mode</span>
            </label>

            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-gray)] rounded px-2 py-1"
            >
              <option value="python">Python</option>
              <option value="js">JavaScript</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="md:max-h-screen overflow-scroll rounded-2xl border border-[var(--color-gray)] bg-[var(--color-bg)]/10 p-6">
            <div className="flex gap-4 mb-4 border-b border-[var(--color-gray)] pb-3 overflow-auto">
              <button
                onClick={() => setTab("desc")}
                className={`pb-2 ${
                  tab === "desc"
                    ? "border-b-2 border-[var(--color-primary)]"
                    : "text-[var(--color-fg)]"
                } cursor-pointer`}
              >
                Description
              </button>
              <button
                onClick={() => setTab("solution")}
                className={`pb-2 ${
                  tab === "solution"
                    ? "border-b-2 border-[var(--color-primary)]"
                    : "text-[var(--color-fg)]"
                } cursor-pointer`}
              >
                Solution
              </button>
              <button
                onClick={() => setTab("video")}
                className={`pb-2 ${
                  tab === "video"
                    ? "border-b-2 border-[var(--color-primary)]"
                    : "text-[var(--color-fg)]"
                } cursor-pointer`}
              >
                Video
              </button>
              <button
                onClick={() => setTab("comments")}
                className={`pb-2 ${
                  tab === "comments"
                    ? "border-b-2 border-[var(--color-primary)]"
                    : "text-[var(--color-fg)]"
                } cursor-pointer`}
              >
                Comments
              </button>
            </div>

            <div className="prose prose-invert max-w-none">
              {tab === "desc" && (
                <>
                  <h2 className="text-2xl font-bold">{SAMPLE_PROBLEM.title}</h2>
                  <p className="mt-2 text-[var(--color-fg)] whitespace-pre-wrap">
                    {SAMPLE_PROBLEM.description}
                  </p>
                  <div className="mt-6">
                    <h4 className="font-semibold">Example:</h4>
                    <div className="mt-2 text-sm text-[var(--color-fg)]">
                      Input:
                    </div>
                    <pre className="mt-2 p-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-gray)] text-sm">
                      {SAMPLE_PROBLEM.exampleIn}
                    </pre>
                    <div className="mt-3 text-sm text-[var(--color-fg)]">
                      Output:
                    </div>
                    <pre className="mt-2 p-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-gray)] text-sm">
                      {SAMPLE_PROBLEM.exampleOut}
                    </pre>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold">Reasoning:</h4>
                    <p className="mt-2 text-[var(--color-fg)]">
                      {SAMPLE_PROBLEM.reasoning}
                    </p>
                  </div>
                </>
              )}

              {tab === "solution" && (
                <>
                  <h3 className="text-lg font-semibold">Hints / Solution</h3>
                  <p className="text-[var(--color-fg)] mt-2">
                    Compute dot product row-wise. Check dimensions first.
                  </p>
                </>
              )}

              {tab === "video" && (
                <>
                  <h3 className="text-lg font-semibold">Video</h3>
                  <p className="text-[var(--color-fg)] mt-2">
                    (Video placeholder)
                  </p>
                </>
              )}

              {tab === "comments" && (
                <>
                  <h3 className="text-lg font-semibold">Comments</h3>
                  <p className="text-[var(--color-fg)] mt-2">
                    No comments yet.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="max-h-screen rounded-2xl border border-[var(--color-gray)] bg-[var(--color-bg)]/10 p-4 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="text-sm text-[var(--color-fg)]">
                Editor ({lang.toUpperCase()})
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const w = window.open();
                    w.document.body.innerText = code;
                  }}
                  title="Open in new tab"
                  className="p-1 rounded border border-[var(--color-gray)]"
                >
                  <FiExternalLink />
                </button>
                <button
                  onClick={() => {
                    setCode((c) => c + "\n# Note: appended snippet");
                  }}
                  className="p-1 rounded border border-[var(--color-gray)]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-[320px]">
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
                  wordWrap: "off",
                }}
              />
            </div>

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <button
                onClick={handleRun}
                disabled={running}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-[var(--color-bg)] rounded cursor-pointer"
              >
                <FiPlay /> {running ? "Running..." : "Run Code"}
              </button>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3 py-2 border border-[var(--color-gray)] rounded cursor-pointer"
              >
                <FiRefreshCw /> Reset
              </button>

              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-3 py-2 border border-[var(--color-gray)] rounded cursor-pointer"
              >
                <FiSave /> Save
              </button>

              <div className="ml-auto text-sm text-[var(--color-fg)]">
                Notebook: {notebookMode ? "On" : "Off"}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm text-[var(--color-fg)] mb-2">Output</div>
              <pre className="max-h-36 overflow-auto p-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-gray)] text-sm whitespace-pre-wrap">
                {output || "No output yet."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
