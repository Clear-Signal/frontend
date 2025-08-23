import { useEffect, useRef, useState } from "react";
import { FiPlay, FiRefreshCw, FiSave, FiX, FiExternalLink } from "react-icons/fi";

/**
 * ProblemSolver - a responsive problem solving page with runnable code
 *
 * Notes:
 *  - Python execution uses Pyodide loaded from CDN (dynamic import).
 *  - JS execution uses Function() sandbox (not secure for untrusted code).
 *  - Replace example problem content & test harness with your own backend tests if needed.
 */

const SAMPLE_PROBLEM = {
  id: "matrix-dot",
  title: "Matrix-Vector Dot Product",
  difficulty: "Easy",
  category: "Linear Algebra",
  description: `Write a Python function that computes the dot product of a matrix and a vector.
The function should return a list representing the resulting vector if the operation is valid,
or -1 if the matrix and vector dimensions are incompatible. A matrix (a list of lists)
can be dotted with a vector (a list) only if the number of columns in the matrix equals the length of the vector.`.trim(),
  exampleIn: `a = [[1, 2], [2, 4]]\nb = [1, 2]`,
  exampleOut: `[5, 10]`,
  reasoning: `Multiply each row of the matrix by the vector and sum.`,
  // code templates for Python and JS
  templatePython: `def matrix_dot_vector(a: list[list[int|float]], b: list[int|float]) -> list | int:
    """
    Return a list where each element is the dot product of a row of 'a' with 'b'.
    If the number of columns in 'a' does not match len(b), return -1.
    """
    pass
`,
  templateJS: `// Implement matrixDotVector(a, b)
// a: array of arrays, b: array
// return array result or -1 if incompatible
function matrixDotVector(a, b) {
  // ...
  return  null;
}`,
  // example tests - you can expand to multiple tests or pull from server
  tests: [
    {
      input: { a: [[1, 2], [2, 4]], b: [1, 2] },
      expected: [5, 10],
    },
    {
      input: { a: [[1, 2, 3]], b: [1, 2] },
      expected: -1,
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
  const [savedSnippets] = useState({}); // placeholder if you add save
  const editorRef = useRef(null);

  // if user switches language, use template for that language
  useEffect(() => {
    setCode(lang === "python" ? SAMPLE_PROBLEM.templatePython : SAMPLE_PROBLEM.templateJS);
    // load pyodide lazily only when language is python
    if (lang === "python" && !pyodide && !loadingPyodide) {
      loadPyodideAsync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // dynamic import and initialization of pyodide
  async function loadPyodideAsync() {
    setLoadingPyodide(true);
    try {
      // dynamic import of pyodide
      const pyodideModule = await import("https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js");
      const py = await pyodideModule.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/",
      });
      setPyodide(py);
      setOutput((o) => o + "\n[Pyodide loaded — Python execution available]\n");
    } catch (err) {
      setOutput((o) => o + `\n[Failed to load Pyodide: ${err.message || err}]\n`);
    } finally {
      setLoadingPyodide(false);
    }
  }

  // helper: run JS code with simple harness
  function runJS(userCode) {
    // careful: Function executes in page context; for untrusted code you must sandbox (e.g. Web Worker)
    // We wrap code and run tests, return JSON string with results.
    try {
      const harness = `
        "use strict";
        ${userCode}
        // run tests
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
      const resJson = fn(); // might throw
      return { success: true, output: JSON.parse(resJson) };
    } catch (err) {
      return { success: false, error: err.toString() };
    }
  }

  // helper: run Python code with pyodide and harness
  async function runPython(userCode) {
    if (!pyodide) {
      return { success: false, error: "Pyodide not loaded" };
    }

    // Build a python script that:
    // - defines user's code (matrix_dot_vector)
    // - runs tests and returns a JSON string as the last expression
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
# return result
json.dumps({"results": results})
`.trim();

    try {
      const pyResult = await pyodide.runPythonAsync(full);
      // pyResult will be a JS string (json)
      const parsed = JSON.parse(pyResult);
      return { success: true, output: parsed };
    } catch (err) {
      return { success: false, error: err.toString() };
    }
  }

  // run code action
  async function handleRun() {
    setOutput("");
    setRunning(true);

    if (lang === "js") {
      const res = runJS(code);
      if (res.success) {
        setOutput(JSON.stringify(res.output, null, 2));
      } else {
        setOutput("Error: " + (res.error || "Unknown"));
      }
      setRunning(false);
      return;
    }

    // python
    if (lang === "python") {
      if (!pyodide) {
        setOutput("Loading Python runtime... (please wait)");
        await loadPyodideAsync();
        // after load, continue
      }
      const res = await runPython(code);
      if (res.success) {
        setOutput(JSON.stringify(res.output, null, 2));
      } else {
        setOutput("Error: " + (res.error || "Unknown"));
      }
      setRunning(false);
      return;
    }

    setOutput("Unsupported language");
    setRunning(false);
  }

  function handleReset() {
    setCode(lang === "python" ? SAMPLE_PROBLEM.templatePython : SAMPLE_PROBLEM.templateJS);
    setOutput("");
  }

  function handleSave() {
    // simple client-side save to localStorage
    try {
      const key = `snippet_${SAMPLE_PROBLEM.id}_${lang}`;
      localStorage.setItem(key, code);
      setOutput((o) => o + `\n[Saved to ${key}]\n`);
    } catch (e) {
      setOutput((o) => o + `\n[Save failed: ${e}]\n`);
    }
  }

  // load saved snippet on mount (if present)
  useEffect(() => {
    const key = `snippet_${SAMPLE_PROBLEM.id}_${lang}`;
    const saved = localStorage.getItem(key);
    if (saved) setCode(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // small UI helpers
  const HeaderBadge = () => (
    <div className="inline-flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-[var(--color-bg)] flex items-center justify-center border border-[var(--color-gray)]">
        <div className="text-[var(--color-fg)] font-bold">DL</div>
      </div>
      <div>
        <div className="text-lg font-semibold">{SAMPLE_PROBLEM.title}</div>
        <div className="text-xs text-[var(--color-fg)]">{SAMPLE_PROBLEM.difficulty} · {SAMPLE_PROBLEM.category}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] p-4">
      <div className="mx-5">
        {/* top toolbar */}
        <div className="flex items-center justify-between mb-4">
          <HeaderBadge />
          <div className="flex items-center gap-2 flex-wrap">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={notebookMode} onChange={() => setNotebookMode((s) => !s)} />
              <span className="text-[var(--color-fg)]">Notebook Mode</span>
            </label>

            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-[var(--color-bg)] border border-[var(--color-gray)] rounded px-2 py-1">
              <option value="python">Python</option>
              <option value="js">JavaScript</option>
            </select>
          </div>
        </div>

        {/* main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* left column - description */}
          <div className="rounded-2xl border border-[var(--color-gray)] bg-[var(--color-muted)] p-6">
            {/* tabs */}
            <div className="flex gap-4 mb-4 border-b border-[var(--color-gray)] pb-3 not-sm:overflow-scroll">
              <button onClick={() => setTab("desc")} className={`pb-2 ${tab === "desc" ? "border-b-2 border-[var(--color-primary)]" : "text-[var(--color-fg)]"} cursor-pointer`}>Description</button>
              <button onClick={() => setTab("solution")} className={`pb-2 ${tab === "solution" ? "border-b-2 border-[var(--color-primary)]" : "text-[var(--color-fg)]"} cursor-pointer`}>Solution</button>
              <button onClick={() => setTab("video")} className={`pb-2 ${tab === "video" ? "border-b-2 border-[var(--color-primary)]" : "text-[var(--color-fg)]"} cursor-pointer`}>Video</button>
              <button onClick={() => setTab("comments")} className={`pb-2 ${tab === "comments" ? "border-b-2 border-[var(--color-primary)]" : "text-[var(--color-fg)]"} cursor-pointer`}>Comments</button>
            </div>

            {/* content */}
            <div className="prose prose-invert max-w-none">
              {tab === "desc" && (
                <>
                  <h2 className="text-2xl font-bold">{SAMPLE_PROBLEM.title}</h2>
                  <p className="mt-2 text-[var(--color-fg)] whitespace-pre-wrap">{SAMPLE_PROBLEM.description}</p>

                  <div className="mt-6">
                    <h4 className="font-semibold">Example:</h4>
                    <div className="mt-2 text-sm text-[var(--color-fg)]">Input:</div>
                    <pre className="mt-2 p-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-gray)] text-sm">{SAMPLE_PROBLEM.exampleIn}</pre>

                    <div className="mt-3 text-sm text-[var(--color-fg)]">Output:</div>
                    <pre className="mt-2 p-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-gray)] text-sm">{SAMPLE_PROBLEM.exampleOut}</pre>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold">Reasoning:</h4>
                    <p className="mt-2 text-[var(--color-fg)]">{SAMPLE_PROBLEM.reasoning}</p>
                  </div>
                </>
              )}

              {tab === "solution" && (
                <>
                  <h3 className="text-lg font-semibold">Hints / Solution</h3>
                  <p className="text-[var(--color-fg)] mt-2">You can compute dot product by iterating rows and summing element-wise products. For Python, use list comprehensions or loops. Check dimension compatibility first.</p>
                </>
              )}

              {tab === "video" && (
                <>
                  <h3 className="text-lg font-semibold">Video</h3>
                  <p className="text-[var(--color-fg)] mt-2">(Video placeholder — embed your tutorial here)</p>
                </>
              )}

              {tab === "comments" && (
                <>
                  <h3 className="text-lg font-semibold">Comments</h3>
                  <p className="text-[var(--color-fg)] mt-2">No comments yet.</p>
                </>
              )}
            </div>
          </div>

          {/* right column - editor & run */}
          <div className="rounded-2xl border border-[var(--color-gray)] bg-[var(--color-muted)] p-4 flex flex-col">
            {/* editor area */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="text-sm text-[var(--color-fg)]">Editor ({lang.toUpperCase()})</div>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  // open editor in new tab with content (data URL)
                  const html = `<pre>${encodeURIComponent(code)}</pre>`;
                  const w = window.open();
                  w.document.body.innerText = code;
                }} title="Open in new tab" className="p-1 rounded border border-[var(--color-gray)]">
                  <FiExternalLink />
                </button>
                <button onClick={() => { setCode((c)=>c+"\n# Note: appended snippet"); }} className="p-1 rounded border border-[var(--color-gray)]">+</button>
              </div>
            </div>

            <textarea
              ref={editorRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 min-h-[320px] p-4 rounded bg-[var(--color-elevated)] border border-[var(--color-gray)] font-mono text-sm resize-none focus:outline-none"
            />

            {/* controls */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <button
                onClick={handleRun}
                disabled={running}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand)] text-[var(--color-bg)] rounded cursor-pointer"
              >
                <FiPlay /> {running ? "Running..." : "Run Code"}
              </button>

              <button onClick={handleReset} className="inline-flex items-center gap-2 px-3 py-2 border border-[var(--color-gray)] rounded cursor-pointer">
                <FiRefreshCw /> Reset
              </button>

              <button onClick={handleSave} className="inline-flex items-center gap-2 px-3 py-2 border border-[var(--color-gray)] rounded cursor-pointer">
                <FiSave /> Save
              </button>

              <div className="ml-auto text-sm text-[var(--color-fg)]">Notebook: {notebookMode ? "On" : "Off"}</div>
            </div>

            {/* output */}
            <div className="mt-4">
              <div className="text-sm text-[var(--color-fg)] mb-2">Output</div>
              <pre className="max-h-36 overflow-auto p-3 rounded bg-[var(--color-surface-2)] border border-[var(--color-gray)] text-sm whitespace-pre-wrap">{output || "No output yet."}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}