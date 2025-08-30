import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { use, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import useDecipher from "../hooks/useDecipher";
import { Link } from "react-router-dom";
import useOnClickOutside from "../hooks/useOnClickOutside";

export default function DailyChallenge({ challenge }) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

  useOnClickOutside(cardRef, () => setExpanded(false));

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-150, 150], [10, -10]);
  const rotateY = useTransform(x, [-150, 150], [-10, 10]);

  const handleMouseMove = (event) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      x.set(mouseX - width / 2);
      y.set(mouseY - height / 2);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const decipherText = useDecipher(
    expanded ? "DAILY CHALLENGE" : "BREOS WHSCPPZSL"
  );

  return (
    <div
      className="flex flex-col items-center justify-center mb-6 mx-auto"
      // Apply perspective to the parent for the 3D effect
      style={{ perspective: "1000px" }}
    >
      {!expanded && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          onClick={() => setExpanded(true)}
          className="inline-flex items-center text-xl gap-3 px-6 py-2 rounded-full border-2 border-[var(--color-fg)] bg-[var(--color-bg)] text-[var(--color-fg)] shadow-lg shadow-black/30 cursor-pointer"
          type="button"
        >
          🎯 Daily Challenge
        </motion.button>
      )}

      <AnimatePresence transition={{ duration: 0.5 }}>
        {expanded && (
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            // Apply tilt styles and mouse move handlers
            style={{ rotateX, rotateY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            // whileTap={() => setExpanded(false)}
            className="w-full max-w-sm bg-[#111111] text-white rounded-3xl shadow-2xl shadow-black/50 p-10 border-2 border-white"
          >
            <h2 className="text-3xl font-bold tracking-widest mb-2 font-mono h-6">
              {decipherText}
            </h2>
            <div className="h-px w-16 bg-white/20 mb-6"></div>

            <h3 className="text-xl font-semibold mb-2 text-gray-100">
              {challenge?.question?.title}
            </h3>
            <p className="text-sm text-gray-400 mb-6">{`Problem ID: ${challenge?.question?.problemId}`}</p>
            <p className="text-sm text-gray-400 my-5">
              Enhance your coding skills with today's elegant challenge.
            </p>

            <Link to={`/problems/${challenge?.question?.id}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center items-center gap-3 px-4 py-3 rounded-full bg-white text-black font-semibold shadow-md cursor-pointer"
              >
                Solve It Now
                <FaArrowRight size={14} />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
