import { useEffect, useState } from "react";

// Custom Hook for the deciphering text animation
const useDecipher = (text, intervalSpeed = 50, scrambleSpeed = 30) => {
  const [displayText, setDisplayText] = useState('');
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  useEffect(() => {
    let mainInterval;
    let scrambleInterval;
    let iteration = 0;

    const startAnimation = () => {
      mainInterval = setInterval(() => {
        const newText = text
          .split("")
          .map((_letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");

        setDisplayText(newText);

        if (iteration >= text.length) {
          clearInterval(mainInterval);
          clearInterval(scrambleInterval);
        }

        iteration += 1 / 3;
      }, intervalSpeed);

      scrambleInterval = setInterval(() => {
        const scrambledText = displayText.split('').map((letter, index) => {
           if (text[index] !== letter) {
             return CHARS[Math.floor(Math.random() * CHARS.length)];
           }
           return letter;
        }).join('');
        setDisplayText(scrambledText);
      }, scrambleSpeed);
    };

    startAnimation();

    return () => {
      clearInterval(mainInterval);
      clearInterval(scrambleInterval);
    };
  }, [text, intervalSpeed, scrambleSpeed]);

  return displayText;
};

export default useDecipher;
