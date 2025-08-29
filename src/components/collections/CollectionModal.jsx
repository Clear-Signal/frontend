import { useEffect, useRef } from "react";
import { FiX, FiExternalLink } from "react-icons/fi";
import useFetch from "../../hooks/useFetch";

export default function CollectionModal({ isOpen, onClose, onOpenProblem, collectionId }) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const previouslyFocused = useRef(null);

  const { data: collection, loading, error } = useFetch(`/api/general/collection/${collectionId}`);
  console.log(collection);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement;
    setTimeout(() => modalRef.current?.focus(), 50);

    function onKey(e) {
      if (e.key === "Escape") onClose && onClose();
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKey);
    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      // restore focus
      try {
        previouslyFocused.current?.focus();
      } catch {}
    };
  }, [isOpen, onClose]);

  if (!isOpen || !collection) return null;

  const {
    name,
    description,
    badgeUrl,
    progress = 0,
    externalUrl,
    topics = [],
  } = collection;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--color-bg)]/70 backdrop-blur-sm"
        onMouseDown={(e) => {
          // close when clicking outside modal content
          if (e.target === backdropRef.current) onClose && onClose();
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-4xl h-[80vh] rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl focus:outline-none"
      >
        {/* Header */}
        <header className="flex items-start gap-4 p-6 border-b border-[var(--color-border)]">
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center">
            {badgeUrl ? (
              <img
                src={badgeUrl}
                alt={`${name} badge`}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <div className="text-[var(--color-fg)] font-semibold">
                {(name || "C").slice(0, 2)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-[var(--color-fg)] leading-tight">
              {name}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-fg)] truncate">
              {description}
            </p>

            {/* progress bar */}
            <div className="mt-4">
              <div className="text-xs text-[var(--text-default)] mb-2">
                {progress}% Complete
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--color-bg)]/40 border border-[var(--color-border)] overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.max(0, Math.min(100, progress))}%`,
                    background: "var(--color-primary)",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="ml-4 flex flex-col items-end gap-3">
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded text-sm border border-[var(--color-gray)] bg-[var(--color-surface)] text-[var(--color-fg)]"
              >
                <FiExternalLink />
                Open in new tab
              </a>
            )}
            <button
              onClick={() => onClose && onClose()}
              aria-label="Close"
              className="p-2 rounded-full text-[var(--color-fg)] hover:text-[var(--color-fg)] cursor-pointer hover:bg-[var(--color-gray)]/40"
            >
              <FiX size={20} />
            </button>
          </div>
        </header>

        {/* Body - scrollable */}
        <div className="h-[calc(100%-150px)] overflow-y-auto p-6">
          <div className="space-y-6">
            {topics.length === 0 ? (
              <div className="text-[var(--color-muted)]">No topics yet.</div>
            ) : (
              topics.map((topic, ti) => (
                <section
                  key={topic._id || ti}
                  className="bg-[var(--color-surface-2)] border border-[var(--color-gray)] rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-gray)] bg-[var(--color-bg)]/60">
                    <div className="text-lg font-semibold">
                      {ti + 1}. {topic.name}
                    </div>
                    <div className="text-sm text-green-500">
                      {topic.progress ?? 0}% Completed
                    </div>
                  </div>

                  <div className="px-4 py-4 space-y-3">
                    {!topic.questions || topic.questions.length === 0 ? (
                      <div className="text-[var(--color-fg)] px-3 py-6">
                        No questions in this topic.
                      </div>
                    ) : (
                      topic.questions.map((prob, pi) => (
                        <button
                          key={prob._id || pi}
                          onClick={() => onOpenProblem && onOpenProblem(prob)}
                          className="w-full text-left px-4 py-3 rounded-md bg-[transparent] border border-[var(--color-gray)] hover:bg-[var(--color-gray)]/50 transition flex items-center gap-3 cursor-pointer"
                          name={prob.title}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[var(--color-fg)] truncate">
                              {prob.title}
                            </div>
                          </div>
                          <div className="text-xs text-[var(--color-fg)]">
                            Open
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
