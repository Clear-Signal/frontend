import React from "react";
import { FaMicrochip, FaBolt, FaEye, FaComments } from "react-icons/fa";
import { Link } from "react-router-dom";

const topics = [
  {
    icon: <FaMicrochip size={30} />,
    title: "Machine Learning Fundamentals",
    description: "Master core ML concepts and algorithms.",
    link: "/collections",
  },
  {
    icon: <FaBolt size={30} />,
    title: "Deep Neural Networks",
    description: "Explore advanced neural network architectures.",
    link: "/collections",
  },
  {
    icon: <FaEye size={30} />,
    title: "Computer Vision",
    description: "Unlock the power of visual data analysis.",
    link: "/collections",
  },
  {
    icon: <FaComments size={30} />,
    title: "Natural Language Processing",
    description: "Harness the potential of language in AI.",
    link: "/collections",
  },
];

const LearningCards = () => {
  return (
    <div className="bg-var(--color-bg) text-white py-12">
      <h2 className="text-center text-2xl font-bold mb-8">What Will You Learn?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto px-8">
        {topics.map((item, index) => (
          <div
            key={index}
            className="bg-zinc-900 rounded-xl p-6 shadow-md hover:shadow-lg transition"
          >
            <div className="flex justify-center items-center w-12 h-12 rounded-full bg-zinc-800 mb-4">
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-400 mb-4">{item.description}</p>
            <Link
              to={item.link}
              className="hover:underline flex items-center gap-1"
            >
              Learn more →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningCards;
