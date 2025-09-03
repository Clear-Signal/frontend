import React from "react";
import { FaLightbulb, FaBriefcase, FaLayerGroup, FaAlignLeft, FaUsers, FaChartLine } from "react-icons/fa";

const features = [
  {
    icon: <FaLightbulb size={26} />,
    title: "Constantly updating problems",
    description: "Our open-source community is always updating problems.",
  },
  {
    icon: <FaBriefcase size={26} />,
    title: "Problems made by professionals",
    description: "Machine Learning scientists and engineers are the ones who make the problems.",
  },
  {
    icon: <FaLayerGroup size={26} />,
    title: "Choice of learning",
    description: "Learn Linear Algebra, Machine Learning, Deep Learning, NLP and Computer Vision.",
  },
  {
    icon: <FaAlignLeft size={26} />,
    title: "Free to use",
    description: "Practice as much as you want to, all problems are free to practice.",
  },
  {
    icon: <FaUsers size={26} />,
    title: "Community Support",
    description: "Connect with peers and mentors for guidance and collaboration.",
  },
  {
    icon: <FaChartLine size={26} />,
    title: "Designed for career growth",
    description: "Our problems are designed to help you grow in your career.",
  },
];

const WhyClearSignal = () => {
  return (
    <section className="bg-[var(--color-bg-black)] text-white py-12">
      <h2 className="text-center text-2xl font-bold mb-10">Why Pixel Bank?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto px-8">
        {features.map((item, index) => (
          <div
            key={index}
            className="p-6 py-12 rounded-3xl border border-[var(--color-fg)] shadow hover:bg-gradient-to-br hover:from-[var(--color-gray)]/50 hover:to-[var(--color-bg-black)] hover:scale-105 transition duration-700 cursor-pointer"
          >
            <div className="ml-3 flex items-center mb-8 text-fg">{item.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-sm text-gray-400">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyClearSignal;
