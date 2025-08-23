import { FiChevronRight, FiExternalLink } from "react-icons/fi";
import { initialsFromTitle } from "../utils/helper";

export default function CollectionCard({ collection, onView, setOpenCollection }) {
  const { title, sections, progress = 0, badgeUrl, resource } = collection;
  return (
    <article
      className="group relative rounded-xl border border-[var(--color-gray)] bg-[var(--color-muted)] overflow-hidden flex flex-col hover:scale-105 transition-transform duration-250 ease-in-out cursor-pointer"
      aria-labelledby={`col-${collection.id}-title`}
      onClick={() => setOpenCollection((prev) => (prev === collection ? null : collection))}
    >
      {/* top area */}
      <div className="p-6 flex items-start gap-4">
        {/* left: text */}
        <div className="flex-1 min-w-0">
          <h3 id={`col-${collection.id}-title`} className="text-xl font-semibold text-[var(--color-fg)] truncate">
            {title}
          </h3>
          <p className="mt-2 text-sm text-[var(--color-fg)]">{sections} sections</p>

          <div className="mt-4 text-sm font-medium text-[var(--color-fg)]">
            <span className="block"> {progress}% Completed</span>
            {/* progress bar */}
            <div className="mt-2 h-2 w-full rounded-full bg-[var(--color-bg)]/20 border border-[var(--color-border)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%`, background: "var(--color-primary)" }}
                aria-hidden
              />
            </div>
          </div>
        </div>

        {/* right: badge */}
        <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full overflow-hidden bg-[var(--color-bg)] border border-[var(--color-border)]">
          {badgeUrl ? (
            <img src={badgeUrl} alt={`${title} badge`} className="w-16 h-16 object-contain" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-sm text-[var(--color-fg)] border border-[var(--color-border)]">
              {initialsFromTitle(title)}
            </div>
          )}
        </div>
      </div>

      {/* bottom CTA row */}
      <div className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg)]/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onView(collection)}
            className="text-sm text-[var(--color-fg)] hover:text-[var(--color-fg)] focus:outline-none"
            aria-label={`View ${title} collection`}
          >
            View collection
          </button>

          {resource && (
            <a
              href={resource}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-[var(--color-bg)]/80 border border-[var(--color-border)] text-[var(--color-fg)] hover:text-[var(--color-fg)]"
            >
              <FiExternalLink />
              Resource
            </a>
          )}
        </div>

        <button
          onClick={() => onView(collection)}
          className="p-2 rounded-full bg-[transparent] border border-[var(--color-border)] text-[var(--color-fg)] hover:text-[var(--color-fg)] focus:outline-none"
          aria-label={`Open ${title}`}
        >
          <FiChevronRight />
        </button>
      </div>
    </article>
  );
}