import { useEffect } from "react";
import { IoMdClose } from "react-icons/io";

function NotificationModal({ message, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal content */}
      <div className="relative bg-white dark:bg-zinc-800 w-full max-w-md mx-4 rounded-2xl shadow-xl p-6 transform transition-all scale-100 animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <IoMdClose className="w-6 h-6 cursor-pointer" />
        </button>

        {/* Message */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Notification
          </h2>
          <p className="mt-3 text-gray-700 dark:text-gray-300">{message}</p>
        </div>

        {/* Footer button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-zinc-600 text-white font-medium hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-400 transition-all cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;
