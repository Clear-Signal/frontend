import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <section className="bg-[var(--color-bg)] text-[var(--color-fg)] min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        {/* Big 404 */}
        <h1 className="text-9xl font-extrabold text-[var(--color-primary)] drop-shadow-md">
          404
        </h1>

        {/* Subtitle */}
        <h2 className="mt-4 text-3xl sm:text-4xl font-semibold">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mt-4 text-lg text-[var(--color-muted)] max-w-md mx-auto">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-[var(--color-bg)] font-medium shadow-md hover:opacity-90 transition"
          >
            Go Home
          </Link>
          <Link
            to="/problems"
            className="px-6 py-3 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] font-medium hover:bg-[var(--color-primary)] hover:text-[var(--color-bg)] transition"
          >
            Explore Problems
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PageNotFound;
