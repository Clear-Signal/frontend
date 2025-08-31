// This component no longer needs any external libraries.
export default function LearnTopicPanel({ htmlContent }) {
  // Display a message if no content is provided from the backend.
  if (!htmlContent) {
    return (
      <div className="bg-[var(--color-bg-black)] text-gray-400 rounded-lg border border-zinc-800 mt-4 p-6">
        No learning content is available for this topic yet.
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-bg-black)] text-gray-200 rounded-lg border border-zinc-800 mt-4">
      {/* This div uses Tailwind's 'prose' classes to style the raw HTML.
        Your backend should provide a sanitized HTML string.
        For formulas, your backend could generate SVGs or use styled HTML tags.
      */}
      <div 
        className="prose prose-invert max-w-none p-6 sm:p-8 text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
}