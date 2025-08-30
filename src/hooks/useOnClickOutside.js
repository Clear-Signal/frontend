import { useEffect } from "react";

/**
 * A custom hook that triggers a handler function when a click is detected
 * outside of a specified DOM element.
 * @param {React.RefObject} ref - A ref to the element to monitor.
 * @param {Function} handler - The function to call on an outside click.
 */
export default function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if the click is inside the ref's element or its children
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    // Add event listeners for both mouse and touch events
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    // Cleanup function to remove the listeners
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]); // Re-run the effect if the ref or handler changes
}