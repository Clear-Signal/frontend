import { useEffect, useRef } from "react";
import { FiX, FiExternalLink } from "react-icons/fi";

const collection = {
  id: "deep-learning",
  title: "Deep Learning",
  description:
    "Build deep learning fundamentals by implementing key concepts from scratch using Python and NumPy.",
  badgeUrl: "/badges/deep.png",
  progress: 0,
  externalUrl: "https://your-resource.example",
  sections: [
    {
      id: "linear-algebra",
      title: "Linear Algebra",
      progress: 0,
      problems: [
        { id: 1, title: "Matrix-Vector Dot Product" },
        { id: 2, title: "Transpose of a Matrix" },
        { id: 3, title: "Dot Product Calculator" },
      ],
    },
  ],
};

export default function CollectionModal({ isOpen, onClose, onOpenProblem }) {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const previouslyFocused = useRef(null);

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
    title,
    description,
    badgeUrl,
    progress = 0,
    externalUrl,
    sections = [],
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
                alt={`${title} badge`}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <div className="text-[var(--color-fg)] font-semibold">
                {(title || "C").slice(0, 2)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-[var(--color-fg)] leading-tight">
              {title}
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
            {sections.length === 0 ? (
              <div className="text-[var(--color-muted)]">No sections yet.</div>
            ) : (
              sections.map((section, si) => (
                <section
                  key={section.id || si}
                  className="bg-[var(--color-surface-2)] border border-[var(--color-gray)] rounded-lg overflow-hidden"
                >
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-gray)] bg-[var(--color-bg)]/60">
                    <div className="text-lg font-semibold">
                      {si + 1}. {section.title}
                    </div>
                    <div className="text-sm text-green-500">
                      {section.progress ?? 0}% Completed
                    </div>
                  </div>

                  <div className="px-4 py-4 space-y-3">
                    {!section.problems || section.problems.length === 0 ? (
                      <div className="text-[var(--color-fg)] px-3 py-6">
                        No problems in this section.
                      </div>
                    ) : (
                      section.problems.map((prob, pi) => (
                        <button
                          key={prob.id || pi}
                          onClick={() => onOpenProblem && onOpenProblem(prob)}
                          className="w-full text-left px-4 py-3 rounded-md bg-[transparent] border border-[var(--color-gray)] hover:bg-[var(--color-gray)]/50 transition flex items-center gap-3 cursor-pointer"
                          title={prob.title}
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
