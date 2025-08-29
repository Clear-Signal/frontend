import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../stores/authStore";

/*
  Admin Dashboard — Hierarchical CRUD
  - Single-file React component (Tailwind CSS) for managing Collections -> Topics -> Problems
  - Features:
    * Left: collapsible tree (collections -> topics -> problems)
    * Middle: detail / lists and quick actions
    * Right: create / edit forms (context-aware)
    * Create, Update, Delete for all three entities
    * Responsive: collapses to vertical layout on small screens
    * Uses same dark theme variables as your Navbar
  - Expected backend endpoints (adjust if needed):
    GET  /api/collections
    POST /api/collections
    PUT  /api/collections/:id
    DELETE /api/collections/:id

    GET  /api/collections/:id/topics
    GET  /api/topics/:id/problems
    POST /api/topics
    PUT  /api/topics/:id
    DELETE /api/topics/:id

    POST /api/problems
    PUT  /api/problems/:id
    DELETE /api/problems/:id

  - Auth: uses AuthContext.token as Bearer if available
*/

export default function AdminDashboard() {
  const { token } = useContext(AuthContext) || {};
  const [loading, setLoading] = useState(false);

  // Hierarchy data
  const [collections, setCollections] = useState([]); // each collection may have topics
  const [expandedCollections, setExpandedCollections] = useState(new Set());
  const [expandedTopics, setExpandedTopics] = useState(new Set());

  // Selection state
  const [selected, setSelected] = useState({ type: null, data: null });
  // type: 'collection' | 'topic' | 'problem'

  // temporary form states
  const emptyCollection = { name: "", description: "", coverImageUrl: "", section: 0, isPremium: false };
  const emptyTopic = { name: "", description: "" };
  const emptyProblem = {
    title: "",
    description: "",
    difficulty: "Easy",
    category: "Array",
    status: "Draft",
    constraints: "",
    sample: { input: "", output: "", reasoning: "" },
    testCases: [{ input: "", expectedOutput: "" }],
    explanation: "",
    languages: ["JavaScript"],
  };

  const [form, setForm] = useState({});

  const categories = [
    "Linear Algebra","Machine Learning","Deep Learning","NLP","Statics","Probability",
    "Array","String","Dynamic Programming","Graph","Tree","Math","Greedy","Sorting","Hashing",
  ];
  const languagesList = ["JavaScript","Python","C++","Java","C#","Go","Rust"];

  // helper: api fetch with token
  async function apiFetch(url, opts = {}) {
    const headers = opts.headers || {};
    if (!headers["Content-Type"] && !(opts.body instanceof FormData)) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, { ...opts, headers });
    if (!res.ok) {
      const text = await res.text().catch(() => null);
      throw new Error(text || res.statusText || "Request failed");
    }
    // try json
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  // initial load
  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    setLoading(true);
    try {
      const data = await apiFetch("/api/collections");
      // Ensure each collection has a `topics` array (lazy loaded)
      const shaped = (data || []).map((c) => ({ ...c, topics: c.topics || null }));
      setCollections(shaped);
    } catch (err) {
      console.error(err);
      alert("Failed to load collections: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadTopicsFor(collectionId) {
    // mark loading on that collection by setting topics to [] temporarily
    setCollections((prev) => prev.map((c) => (c._id === collectionId ? { ...c, topics: c.topics === null ? [] : c.topics } : c)));
    try {
      const topics = await apiFetch(`/api/collections/${collectionId}/topics`);
      setCollections((prev) => prev.map((c) => (c._id === collectionId ? { ...c, topics: topics || [] } : c)));
    } catch (e) {
      console.error(e);
      alert("Failed to load topics: " + e.message);
    }
  }

  async function loadProblemsFor(topicId) {
    // find owner collection and mark topic as loading
    setCollections((prev) => prev.map((c) => ({ ...c, topics: c.topics ? c.topics.map(t => t._id === topicId ? { ...t, problems: t.problems === undefined ? [] : t.problems } : t) : c.topics })));
    try {
      const problems = await apiFetch(`/api/topics/${topicId}/problems`);
      setCollections((prev) => prev.map((c) => ({
        ...c,
        topics: c.topics ? c.topics.map((t) => (t._id === topicId ? { ...t, problems: problems || [] } : t)) : c.topics,
      })));
    } catch (e) {
      console.error(e);
      alert("Failed to load problems: " + e.message);
    }
  }

  // expand toggle helpers
  function toggleCollection(cId) {
    const next = new Set(expandedCollections);
    if (next.has(cId)) next.delete(cId);
    else next.add(cId);
    setExpandedCollections(next);
    // lazy load topics
    if (!next.has(cId)) return; // closed
    const col = collections.find((c) => c._id === cId);
    if (col && (col.topics === null || col.topics === undefined)) loadTopicsFor(cId);
  }

  function toggleTopic(tId) {
    const next = new Set(expandedTopics);
    if (next.has(tId)) next.delete(tId);
    else next.add(tId);
    setExpandedTopics(next);
    if (!next.has(tId)) return;
    // lazy load problems
    // find if problems exists
    const found = collections.some((c) => c.topics && c.topics.some((t) => t._id === tId && t.problems !== undefined));
    if (!found) loadProblemsFor(tId);
  }

  // selection
  function selectEntity(type, data) {
    setSelected({ type, data });
    // set form based on type
    if (type === "collection") setForm({ ...emptyCollection, ...data });
    if (type === "topic") setForm({ ...emptyTopic, ...data });
    if (type === "problem") setForm({ ...emptyProblem, ...data });
    // ensure corresponding expansions
    if (type === "collection") {
      setExpandedCollections((s) => new Set(s).add(data._id));
      if (data.topics === null || data.topics === undefined) loadTopicsFor(data._id);
    }
    if (type === "topic") {
      setExpandedCollections((s) => {
        const next = new Set(s);
        // ensure parent expanded
        const parent = collections.find((c) => c._id === data.collectionId);
        if (parent) next.add(parent._id);
        return next;
      });
      setExpandedTopics((s) => new Set(s).add(data._id));
      if (!data.problems) loadProblemsFor(data._id);
    }
  }

  // CRUD operations
  // Collections
  async function createCollection(payload) {
    try {
      setLoading(true);
      const created = await apiFetch("/api/collections", { method: "POST", body: JSON.stringify(payload) });
      setCollections((s) => [{ ...created, topics: null }, ...s]);
      alert("Collection created");
    } catch (e) {
      alert("Create collection failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateCollection(id, payload) {
    try {
      setLoading(true);
      const updated = await apiFetch(`/api/collections/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      setCollections((s) => s.map((c) => (c._id === id ? { ...c, ...updated } : c)));
      alert("Collection updated");
    } catch (e) {
      alert("Update failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCollection(id) {
    if (!confirm("Delete collection and all its topics/problems? This cannot be undone.")) return;
    try {
      setLoading(true);
      await apiFetch(`/api/collections/${id}`, { method: "DELETE" });
      setCollections((s) => s.filter((c) => c._id !== id));
      setSelected({ type: null, data: null });
    } catch (e) {
      alert("Delete failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  // Topics
  async function createTopic(payload) {
    try {
      setLoading(true);
      const created = await apiFetch("/api/topics", { method: "POST", body: JSON.stringify(payload) });
      setCollections((s) => s.map((c) => (c._id === payload.collectionId ? { ...c, topics: [created, ...(c.topics || [])] } : c)));
      alert("Topic created");
    } catch (e) {
      alert("Create topic failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateTopic(id, payload) {
    try {
      setLoading(true);
      const updated = await apiFetch(`/api/topics/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      setCollections((s) => s.map((c) => ({ ...c, topics: c.topics ? c.topics.map(t => t._id === id ? { ...t, ...updated } : t) : c.topics })));
      alert("Topic updated");
    } catch (e) {
      alert("Update topic failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTopic(id) {
    if (!confirm("Delete topic and its problems? This cannot be undone.")) return;
    try {
      setLoading(true);
      await apiFetch(`/api/topics/${id}`, { method: "DELETE" });
      setCollections((s) => s.map((c) => ({ ...c, topics: c.topics ? c.topics.filter((t) => t._id !== id) : c.topics })));
      setSelected({ type: null, data: null });
    } catch (e) {
      alert("Delete topic failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  // Problems
  async function createProblem(payload) {
    try {
      setLoading(true);
      const created = await apiFetch("/api/problems", { method: "POST", body: JSON.stringify(payload) });
      // attach to topic
      setCollections((s) => s.map((c) => ({
        ...c,
        topics: c.topics ? c.topics.map((t) => (t._id === payload.topicId ? { ...t, problems: [created, ...(t.problems || [])] } : t)) : c.topics,
      })));
      alert("Problem created (ID: " + (created.problemId || created._id) + ")");
    } catch (e) {
      alert("Create problem failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProblem(id, payload) {
    try {
      setLoading(true);
      const updated = await apiFetch(`/api/problems/${id}`, { method: "PUT", body: JSON.stringify(payload) });
      setCollections((s) => s.map((c) => ({
        ...c,
        topics: c.topics ? c.topics.map((t) => ({
          ...t,
          problems: t.problems ? t.problems.map((p) => (p._id === id ? { ...p, ...updated } : p)) : t.problems,
        })) : c.topics,
      })));
      alert("Problem updated");
    } catch (e) {
      alert("Update problem failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProblem(id, topicId) {
    if (!confirm("Delete problem? This cannot be undone.")) return;
    try {
      setLoading(true);
      await apiFetch(`/api/problems/${id}`, { method: "DELETE" });
      setCollections((s) => s.map((c) => ({
        ...c,
        topics: c.topics ? c.topics.map((t) => (t._id === topicId ? { ...t, problems: t.problems ? t.problems.filter(p => p._id !== id) : t.problems } : t)) : c.topics,
      })));
      setSelected({ type: null, data: null });
    } catch (e) {
      alert("Delete problem failed: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  // submit handler for form (create/update based on selected.type)
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form) return;
    try {
      if (selected.type === "collection") {
        if (form._id) await updateCollection(form._id, form);
        else await createCollection(form);
      } else if (selected.type === "topic") {
        if (!form.collectionId) return alert("Topic must belong to a collection");
        if (form._id) await updateTopic(form._id, form);
        else await createTopic(form);
      } else if (selected.type === "problem") {
        if (!form.collectionId || !form.topicId) return alert("Problem must belong to collection & topic");
        if (form._id) await updateProblem(form._id, form);
        else await createProblem(form);
      }
      // reload brief lists so UI stays fresh (we could be smarter but reload top-level)
      await loadCollections();
      setSelected({ type: null, data: null });
      setForm({});
    } catch (e) {
      console.error(e);
    }
  }

  // quick create helpers (for when user wants to add child from tree)
  function beginCreate(type, parent) {
    if (type === "collection") {
      setSelected({ type: "collection", data: null });
      setForm(emptyCollection);
    }
    if (type === "topic") {
      setSelected({ type: "topic", data: null });
      setForm({ ...emptyTopic, collectionId: parent._id });
      // ensure parent expanded
      setExpandedCollections((s) => new Set(s).add(parent._id));
    }
    if (type === "problem") {
      setSelected({ type: "problem", data: null });
      setForm({ ...emptyProblem, collectionId: parent.collectionId || parent._id, topicId: parent._id });
      // ensure parent expanded
      if (parent.collectionId) setExpandedCollections((s) => new Set(s).add(parent.collectionId));
      setExpandedTopics((s) => new Set(s).add(parent._id));
    }
  }

  // UI small helpers
  function smallBtn(text, onClick, extra = "") {
    return (
      <button onClick={onClick} className={`px-2 py-1 text-xs rounded ${extra} border border-[var(--panel-border)]`}>
        {text}
      </button>
    );
  }

  // render
  return (
    <div className="min-h-screen p-4 md:p-6 bg-[var(--color-bg-black)] text-[var(--text-default)]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Admin Dashboard — Hierarchical Editor</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => { loadCollections(); }} className="px-3 py-1 rounded-md border border-[var(--panel-border)]">Refresh</button>
            <button onClick={() => beginCreate("collection")} className="px-3 py-1 rounded-md bg-[var(--text-default)] text-[var(--bg-page)]">New Collection</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* LEFT: Tree */}
          <div className="col-span-1 bg-[var(--card-bg)] border border-[var(--panel-border)] rounded-lg p-3 overflow-auto max-h-[70vh]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Collections</h3>
              <div className="text-xs text-[var(--text-muted)]">{collections.length}</div>
            </div>

            {loading && collections.length === 0 ? (
              <div className="text-sm text-[var(--text-muted)]">Loading...</div>
            ) : (
              <div className="space-y-2">
                {collections.map((c) => (
                  <div key={c._id} className="rounded-md">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleCollection(c._id)} className="p-1 rounded hover:bg-[var(--bg-page)]/5">
                        {expandedCollections.has(c._id) ? "▾" : "▸"}
                      </button>
                      <div className={`flex-1 cursor-pointer px-2 py-1 rounded ${selected.type === 'collection' && selected.data?._id === c._id ? 'bg-[var(--bg-page)]/10' : 'hover:bg-[var(--bg-page)]/5'}`} onClick={() => selectEntity('collection', c)}>
                        <div className="flex items-center justify-between">
                          <div className="truncate font-semibold">{c.name}</div>
                          <div className="text-xs text-[var(--text-muted)]">{c.isPremium ? 'P' : ''}</div>
                        </div>
                        <div className="text-xs text-[var(--text-muted)] truncate">{c.description}</div>
                      </div>
                      <div className="flex gap-1">
                        <button title="Add topic" onClick={() => beginCreate('topic', c)} className="px-2 py-1 text-xs rounded border border-[var(--panel-border)]">+T</button>
                        <button title="Edit" onClick={() => selectEntity('collection', c)} className="px-2 py-1 text-xs rounded border border-[var(--panel-border)]">Edit</button>
                      </div>
                    </div>

                    {expandedCollections.has(c._id) && (
                      <div className="ml-6 mt-2 space-y-2">
                        {!c.topics ? (
                          <div className="text-xs text-[var(--text-muted)]">Loading topics...</div>
                        ) : c.topics.length === 0 ? (
                          <div className="text-xs text-[var(--text-muted)]">No topics</div>
                        ) : (
                          c.topics.map((t) => (
                            <div key={t._id} className="flex items-start gap-2">
                              <button onClick={() => toggleTopic(t._id)} className="p-1 rounded hover:bg-[var(--bg-page)]/5">{expandedTopics.has(t._id) ? '▾' : '▸'}</button>
                              <div className={`flex-1 px-2 py-1 rounded cursor-pointer ${selected.type === 'topic' && selected.data?._id === t._id ? 'bg-[var(--bg-page)]/10' : 'hover:bg-[var(--bg-page)]/5'}`} onClick={() => selectEntity('topic', t)}>
                                <div className="flex items-center justify-between">
                                  <div className="truncate font-medium">{t.name}</div>
                                  <div className="text-xs text-[var(--text-muted)]">{new Date(t.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="text-xs text-[var(--text-muted)] truncate">{t.description}</div>
                              </div>
                              <div className="flex gap-1">
                                <button title="Add problem" onClick={() => beginCreate('problem', t)} className="px-2 py-1 text-xs rounded border border-[var(--panel-border)]">+P</button>
                                <button title="Edit topic" onClick={() => selectEntity('topic', t)} className="px-2 py-1 text-xs rounded border border-[var(--panel-border)]">Edit</button>
                              </div>

                              {expandedTopics.has(t._id) && (
                                <div className="w-full mt-1 ml-8">
                                  {t.problems === undefined ? (
                                    <div className="text-xs text-[var(--text-muted)]">Loading problems...</div>
                                  ) : t.problems.length === 0 ? (
                                    <div className="text-xs text-[var(--text-muted)]">No problems</div>
                                  ) : (
                                    t.problems.map((p) => (
                                      <div key={p._id} className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${selected.type === 'problem' && selected.data?._id === p._id ? 'bg-[var(--bg-page)]/10' : 'hover:bg-[var(--bg-page)]/5'}`} onClick={() => selectEntity('problem', p)}>
                                        <div className="flex-1 truncate text-sm">{p.title}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{p.difficulty}</div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MIDDLE: List / quick actions or details */}
          <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--panel-border)] rounded-lg p-4 overflow-auto max-h-[70vh]">
            {!selected.type ? (
              <div>
                <h3 className="font-medium mb-2">Select an item on the left to view details or create a new one</h3>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => beginCreate('collection')} className="px-3 py-1 rounded-md border border-[var(--panel-border)]">Create Collection</button>
                  <button onClick={() => { const c = collections[0]; if (c) beginCreate('topic', c); else alert('Create a collection first'); }} className="px-3 py-1 rounded-md border border-[var(--panel-border)]">Create Topic (first collection)</button>
                </div>
              </div>
            ) : selected.type === 'collection' ? (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selected.data?.name}</h3>
                    <div className="text-sm text-[var(--text-muted)]">{selected.data?.description}</div>
                    <div className="mt-2 text-xs text-[var(--text-muted)]">Section: {selected.data?.section} • Premium: {selected.data?.isPremium ? 'Yes' : 'No'}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => selectEntity('collection', selected.data)} className="px-3 py-1 rounded-md border border-[var(--panel-border)]">Edit</button>
                    <button onClick={() => deleteCollection(selected.data._id)} className="px-3 py-1 rounded-md bg-red-600 text-white">Delete</button>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Topics</h4>
                  <div className="grid gap-2">
                    {selected.data.topics && selected.data.topics.length > 0 ? selected.data.topics.map(t => (
                      <div key={t._id} className="flex items-center justify-between px-3 py-2 rounded border border-[var(--panel-border)]">
                        <div>
                          <div className="font-medium">{t.name}</div>
                          <div className="text-xs text-[var(--text-muted)]">{t.description}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => selectEntity('topic', t)} className="px-2 py-1 text-xs rounded border border-[var(--panel-border)]">Open</button>
                          <button onClick={() => deleteTopic(t._id)} className="px-2 py-1 text-xs rounded bg-red-600 text-white">Delete</button>
                        </div>
                      </div>
                    )) : <div className="text-sm text-[var(--text-muted)]">No topics</div>}
                  </div>
                </div>
              </div>
            ) : selected.type === 'topic' ? (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{selected.data?.name}</h3>
                    <div className="text-sm text-[var(--text-muted)]">{selected.data?.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => selectEntity('topic', selected.data)} className="px-3 py-1 rounded-md border border-[var(--panel-border)]">Edit</button>
                    <button onClick={() => deleteTopic(selected.data._id)} className="px-3 py-1 rounded-md bg-red-600 text-white">Delete</button>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Problems</h4>
                  <div className="space-y-2">
                    {selected.data.problems && selected.data.problems.length > 0 ? selected.data.problems.map(p => (
                      <div key={p._id} className="flex items-center justify-between px-3 py-2 rounded border border-[var(--panel-border)]">
                        <div className="truncate">
                          <div className="font-medium truncate">{p.title}</div>
                          <div className="text-xs text-[var(--text-muted)] truncate">{p.description?.slice(0, 120)}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => selectEntity('problem', p)} className="px-2 py-1 text-xs rounded border border-[var(--panel-border)]">Open</button>
                          <button onClick={() => deleteProblem(p._id, selected.data._id)} className="px-2 py-1 text-xs rounded bg-red-600 text-white">Delete</button>
                        </div>
                      </div>
                    )) : <div className="text-sm text-[var(--text-muted)]">No problems</div>}
                  </div>
                  <div className="mt-3">
                    <button onClick={() => beginCreate('problem', selected.data)} className="px-3 py-1 rounded-md bg-[var(--text-default)] text-[var(--bg-page)]">New Problem</button>
                  </div>
                </div>
              </div>
            ) : (
              // problem detail
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="max-w-[70%]">
                    <h3 className="text-xl font-semibold">{selected.data?.title}</h3>
                    <div className="text-sm text-[var(--text-muted)]">Category: {selected.data?.category} • Difficulty: {selected.data?.difficulty}</div>
                    <div className="mt-3 text-sm whitespace-pre-wrap">{selected.data?.description}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => selectEntity('problem', selected.data)} className="px-3 py-1 rounded-md border border-[var(--panel-border)]">Edit</button>
                    <button onClick={() => deleteProblem(selected.data._id, selected.data.topicId)} className="px-3 py-1 rounded-md bg-red-600 text-white">Delete</button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Sample I/O</h4>
                    <pre className="bg-[var(--bg-page)]/5 p-2 rounded mt-2 text-sm overflow-auto">Input:
{selected.data?.sample?.input}

Output:
{selected.data?.sample?.output}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium">Test Cases</h4>
                    <div className="mt-2 space-y-2">
                      {selected.data?.testCases?.map((t, i) => (
                        <div key={i} className="text-sm border border-[var(--panel-border)] rounded p-2">
                          <div><strong>Input:</strong> <span className="break-words">{t.input}</span></div>
                          <div><strong>Expected:</strong> <span className="break-words">{t.expectedOutput}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium">Explanation</h4>
                  <div className="mt-2 text-sm whitespace-pre-wrap">{selected.data?.explanation}</div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Form panel (create / edit for currently selected type) */}
          <div className="col-span-1 bg-[var(--card-bg)] border border-[var(--panel-border)] rounded-lg p-4 overflow-auto max-h-[70vh]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{selected.type ? `${selected.type[0].toUpperCase() + selected.type.slice(1)} Form` : 'Quick Create'}</h3>
              {selected.type && form._id && <div className="text-xs text-[var(--text-muted)]">Editing</div>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Collection form */}
              {(!selected.type || selected.type === 'collection') && (
                <div className={`${selected.type === 'collection' ? '' : ''}`}>
                  <label className="text-xs">Name</label>
                  <input value={form.name || ''} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Name" className="w-full px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />
                  <label className="text-xs">Description</label>
                  <textarea value={form.description || ''} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />

                  {/* collection-only fields */}
                  <div className="flex gap-2 items-center mt-2">
                    <input type="text" placeholder="Cover image URL" value={form.coverImageUrl || ''} onChange={(e) => setForm((s) => ({ ...s, coverImageUrl: e.target.value }))} className="flex-1 px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />
                    <input type="number" placeholder="Section" value={form.section || 0} onChange={(e) => setForm((s) => ({ ...s, section: Number(e.target.value) }))} className="w-20 px-2 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={!!form.isPremium} onChange={(e) => setForm((s) => ({ ...s, isPremium: e.target.checked }))} />
                      <span className="text-xs">Premium</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Topic form */}
              {(selected.type === 'topic' || (!selected.type && form.collectionId)) && (
                <div>
                  <label className="text-xs">Topic Name</label>
                  <input value={form.name || ''} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} placeholder="Topic name" className="w-full px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />
                </div>
              )}

              {/* Problem form */}
              {(selected.type === 'problem' || (!selected.type && form.topicId)) && (
                <div>
                  <label className="text-xs">Title</label>
                  <input value={form.title || ''} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="Problem title" className="w-full px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />

                  <label className="text-xs">Description</label>
                  <textarea value={form.description || ''} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} rows={5} className="w-full px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />

                  <div className="flex gap-2 mt-2">
                    <select value={form.difficulty || 'Easy'} onChange={(e) => setForm((s) => ({ ...s, difficulty: e.target.value }))} className="px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]">
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>

                    <select value={form.category || categories[0]} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} className="px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]">
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>

                    <input value={form.constraints || ''} onChange={(e) => setForm((s) => ({ ...s, constraints: e.target.value }))} placeholder="Constraints" className="flex-1 px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-medium">Sample I/O</h4>
                    <input value={form.sample?.input || ''} onChange={(e) => setForm((s) => ({ ...s, sample: { ...(s.sample || {}), input: e.target.value } }))} placeholder="Sample input" className="w-full px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)] mb-2" />
                    <input value={form.sample?.output || ''} onChange={(e) => setForm((s) => ({ ...s, sample: { ...(s.sample || {}), output: e.target.value } }))} placeholder="Sample output" className="w-full px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)] mb-2" />
                    <textarea value={form.sample?.reasoning || ''} onChange={(e) => setForm((s) => ({ ...s, sample: { ...(s.sample || {}), reasoning: e.target.value } }))} rows={2} placeholder="Sample reasoning" className="w-full px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-medium">Test Cases</h4>
                    <div className="space-y-2 mt-2">
                      {(form.testCases || []).map((t, i) => (
                        <div key={i} className="flex gap-2">
                          <input value={t.input} onChange={(e) => { const copy = [...(form.testCases||[])]; copy[i].input = e.target.value; setForm(s=>({...s, testCases: copy})); }} placeholder="Input" className="flex-1 px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />
                          <input value={t.expectedOutput} onChange={(e) => { const copy = [...(form.testCases||[])]; copy[i].expectedOutput = e.target.value; setForm(s=>({...s, testCases: copy})); }} placeholder="Expected output" className="flex-1 px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />
                          <button type="button" onClick={()=>{ const copy = (form.testCases||[]).filter((_,ii)=>ii!==i); setForm(s=>({...s, testCases: copy})); }} className="px-2 py-1 rounded bg-red-600 text-white">Remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <button type="button" onClick={()=>setForm(s=>({...s, testCases: [...(s.testCases||[]), {input:'', expectedOutput:''}]}))} className="px-3 py-1 rounded-md bg-[var(--text-default)] text-[var(--bg-page)]">Add Test Case</button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="text-sm font-medium">Languages</h4>
                    <div className="flex gap-2 flex-wrap mt-2">
                      {languagesList.map(lang => {
                        const checked = (form.languages||[]).includes(lang);
                        return (
                          <label key={lang} className={`px-2 py-1 rounded-md border ${checked ? 'bg-[var(--text-default)] text-[var(--bg-page)]' : 'bg-[var(--bg-page)]/5'}`}>
                            <input type="checkbox" checked={checked} onChange={(e)=>setForm(s=>({...s, languages: e.target.checked ? Array.from(new Set([...(s.languages||[]), lang])) : (s.languages||[]).filter(x=>x!==lang)}))} className="mr-2" />
                            {lang}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-xs">Explanation / Editorial</label>
                    <textarea value={form.explanation || ''} onChange={(e)=>setForm(s=>({...s, explanation: e.target.value}))} rows={4} className="w-full px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]" />
                  </div>
                </div>
              )}

              {/* relationship selects (collection/topic) for topic & problem create */}
              {(selected.type === 'topic' || (!selected.type && form.collectionId)) && (
                <div>
                  <label className="text-xs">Parent Collection</label>
                  <select value={form.collectionId || ''} onChange={(e)=>setForm(s=>({...s, collectionId: e.target.value}))} className="w-full px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]">
                    <option value="">-- select collection --</option>
                    {collections.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              {(selected.type === 'problem' || (!selected.type && form.topicId)) && (
                <div>
                  <label className="text-xs">Parent Topic</label>
                  <select value={form.topicId || ''} onChange={(e)=>setForm(s=>({...s, topicId: e.target.value}))} className="w-full px-3 py-2 rounded-md bg-[var(--bg-page)]/5 border border-[var(--panel-border)]">
                    <option value="">-- select topic --</option>
                    {collections.flatMap(c => (c.topics||[]).map(t => <option key={t._id} value={t._id}>{c.name} / {t.name}</option>))}
                  </select>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button type="submit" className="px-4 py-2 rounded-md bg-green-600 text-white">{form._id ? 'Update' : 'Create'}</button>
                <button type="button" onClick={()=>{ setSelected({type:null,data:null}); setForm({}); }} className="px-4 py-2 rounded-md border border-[var(--panel-border)]">Cancel</button>
              </div>
            </form>

          </div>
        </div>

        <div className="mt-4 text-xs text-[var(--text-muted)]">Notes: This component assumes the REST endpoints listed at the top. If your server differs (e.g. uses different URIs or expects multipart/form-data for images) adjust <code>apiFetch</code> calls accordingly.</div>
      </div>
    </div>
  );
}
