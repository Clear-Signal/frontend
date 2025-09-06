import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";

export default function CollectionCarousel() {
  const navigate = useNavigate();

  // Using hook exactly as you asked:
  const {
    data: collections,
    loading,
    error,
  } = useFetch(`/api/general/collection`);

  // support both shapes: either `collections` is the full response object or directly an array
  const colls = Array.isArray(collections)
    ? collections
    : collections?.data ?? [];

    const items = colls.slice(0, 6);

  // small helper for progress percentage (handles zero totalQuestions)
  const pct = (solvedCount = 0, totalQuestions = 0) =>
    totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

  return (
    <div className="w-full p-4">
      {/* horizontal scroll list */}
      <div className="overflow-hidden py-2 -mx-4 px-4">
        <div className="flex gap-6 items-stretch">
          {/* Loading skeletons */}
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[220px] w-[220px] bg-transparent">
                <div className="rounded-md p-4 dark:bg-[#0f1113] bg-white border border-zinc-300 dark:border-zinc-800">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-md dark:bg-zinc-800 bg-white animate-pulse" />
                    <div className="h-4 w-32 bg-zinc-700 rounded animate-pulse" />
                    <div className="h-2 w-full bg-zinc-800 rounded mt-3 animate-pulse" />
                    <div className="text-xs dark:text-gray-500 text-gray-700 mt-2">
                      0/0 completed
                    </div>
                  </div>
                </div>
              </div>
            ))}

          {/* Error state */}
          {!loading && error && (
            <div className="min-w-[300px] p-4 bg-[#0f1113] border border-red-700 rounded text-red-300">
              Error loading collections.
              <div className="text-sm text-gray-400 mt-2">
                {String(error?.message ?? error)}
              </div>
            </div>
          )}

          {/* Data items */}
          {!loading &&
            !error &&
            items.map((c) => {
              const solved = c?.solvedCount ?? 0;
              const total = c?.totalQuestions ?? 0;
              const percent = pct(solved, total);
              const progressWidth = `${percent}%`;

              return (
                <article
                  key={c._id}
                  role="button"
                  onClick={() => navigate(`/collections/${c._id}`)}
                  className="min-w-30 cursor-pointer"
                  title={c?.description}
                >
                  <div className="rounded-md p-4  ">
                    <div className="flex flex-col items-center gap-3">
                      <img src={c?.coverImageUrl} alt="" className="w-20 h-20 rounded-full" />

                      <div className="text-sm font-semibold dark:text-gray-100 text-gray-500 text-center leading-tight">
                        <div className="w-full">{c?.name}</div>
                      </div>

                      {/* thin rounded progress bar (matches screenshot) */}
                      <div className="w-full mt-2">
                        <div className="h-2 dark:bg-[#23262a] bg-zinc-300 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              percent >= 100 ? "bg-green-500" : "dark:bg-white bg-zinc-500"
                            }`}
                            style={{ width: progressWidth }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-2 text-center">
                          {total > 0
                            ? `${solved}/${total} completed`
                            : `0/${Math.max(1, total)} completed`}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>

      <div className="flex w-full items-center justify-end mb-3">
        <div>
          <button
            onClick={() => navigate("/collections")}
            className="text-sm dark:text-white text-black underline cursor-pointer"
            aria-label="View all collections"
          >
            View all collections
          </button>
        </div>
      </div>

      {/* fallback: empty */}
      {!loading && !error && items.length === 0 && (
        <div className="mt-4 text-sm text-gray-400">
          No collections available.
        </div>
      )}
    </div>
  );
}
