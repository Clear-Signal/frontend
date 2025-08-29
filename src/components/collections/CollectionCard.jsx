import { FiChevronRight, FiExternalLink } from "react-icons/fi";
import { initialsFromTitle } from "../../utils/helper";

export default function CollectionCard({ collection, onView, setOpenCollection }) {
  const { name, section, progress = 0, coverImageUrl, resource } = collection;
  return (
    <article
      className="group pt-2 relative rounded-xl border border-[var(--color-muted)] bg-zinc-900 overflow-hidden flex flex-col hover:scale-105 transition-transform duration-500 ease-in-out cursor-pointer"
      aria-labelledby={`col-${collection._id}-title`}
      onClick={() => setOpenCollection((prev) => (prev === collection._id ? null : collection._id))}
    >
      {/* top area */}
      <div className="p-6 flex items-start gap-4">
        {/* left: text */}
        <div className="flex-1 min-w-0">
          <h3 id={`col-${collection._id}-title`} className="text-xl font-semibold text-[var(--text-default)] truncate">
            {name}
          </h3>
          <p className="mt-2 text-sm text-[var(--text-default)]">{section} sections</p>

          <div className="mt-4 text-sm font-medium text-[var(--text-default)]">
            <span className="block"> {progress}% Completed</span>
            
          </div>
        </div>

        {/* right: badge */}
        <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full overflow-hidden bg-[var(--card-bg-2)] border-4 border-[var(--color-muted)]">
          {coverImageUrl ? (
            <img src={coverImageUrl} alt={`${name} badge`} className="w-16 h-16 object-contain" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[var(--card-bg-2)] flex items-center justify-center text-sm text-[var(--text-default)]">
              {initialsFromTitle(name)}
            </div>
          )}
        </div>
      </div>

      {/* bottom CTA row */}
      <div className="mt-auto border-t border-[var(--panel-border)] bg-[var(--color-bg-gray)] px-6 py-4 flex items-center justify-between">
        <div className=" w-full flex justify-between items-center gap-3">
          <button
            onClick={() => onView(collection)}
            className="text-sm text-[var(--text-gray)] focus:outline-none"
            aria-label={`View ${name} collection`}
          >
            View collection
          </button>

          {resource && (
            <a
              href={resource}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-[var(--text-muted)]/70 hover:bg-[var(--text-muted)] border border-[var(--panel-border)] text-[var(--text-default)] hover:text-[var(--text-default)]"
            >
              <FiExternalLink />
              Resource
            </a>
          )}
        </div>

        <button
          onClick={() => onView(collection)}
          className="p-2 rounded-full bg-[transparent] text-[var(--text-default)] hover:text-[var(--text-default)] focus:outline-none"
          aria-label={`Open ${name}`}
        >
          <FiChevronRight />
        </button>
      </div>
    </article>
  );
}
