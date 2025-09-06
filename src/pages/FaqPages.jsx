import React from "react";

const faqs = [
  {
    question: "WHAT IS PIXELBANK?",
    answer:
      "PIXELBANK is an open-source machine learning challenge platform designed to help users improve their skills in algorithm development and AI applications. With a range of problems covering fundamental and advanced topics, it's a space for everyone, from beginners to experts, to deepen their understanding and practical skills in machine learning.",
  },
  {
    question: "WHO IS PIXELBANK FOR?",
    answer:
      "PIXELBANK is for anyone interested in machine learning, whether you're a student, a data science professional, or an AI enthusiast. Our platform welcomes users from all educational backgrounds and experience levels.",
  },
  {
    question: "HOW DOES PIXELBANK WORK?",
    answer:
      "Our platform offers a variety of problems that test different aspects of machine learning. Users can learn through solving real-world problems, and progressively tackle more challenging tasks. Each problem includes explanations, starter code, learn sections, and test cases to help users succeed.",
  },
  {
    question: "IS PIXELBANK FREE TO USE?",
    answer:
      'Yes, PIXELBANK is currently free to use, and we open-source all problems at our GitHub repository.',
  },
  {
    question: "CAN I CONTRIBUTE TO PIXELBANK?",
    answer:
      "Absolutely! We encourage open-source contributions. If you're interested in creating or improving problems, you can check out our GitHub repository. Additionally, we're always looking to expand our question base, so feel free to reach out if you'd like to collaborate.",
  },
  {
    question: "HOW CAN I STAY UPDATED ON NEW FEATURES AND CONTENT?",
    answer:
      "Follow us on Twitter for updates, or join our Discord community. You can also keep an eye on our GitHub page to see our latest open-source developments.",
  },
  {
    question: "HOW CAN I GET IN TOUCH WITH SUPPORT?",
    answer:
      "For support or inquiries, you can reach us via email at info@pixelbank.com, or join our Discord server to connect with the community and moderators.",
  },
  {
    question: "IS PIXELBANK THE LEETCODE FOR MACHINE LEARNING?",
    answer:
      "Not quite. While both platforms offer coding challenges, PIXELBANK is specifically designed to teach real machine learning skills rather than just algorithmic problem-solving. Our focus is on helping users build a deep understanding of machine learning concepts, from the math to the code, through hands-on problems that mirror real-world applications. Deep-ML is more than a question bank—it's an open-source, community-driven platform where users can learn, collaborate, and develop practical ML skills that are directly applicable to careers in data science and AI.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-black text-white py-16 px-6 md:px-20">
      <h1 className="text-4xl font-extrabold text-center mb-2">FAQS</h1>
      <p className="text-center text-gray-400 mb-12">
        All you need to know about PIXELBANK
      </p>

      <div className="space-y-6 max-w-10xl mx-auto">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-neutral-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-xl font-bold mb-2">{faq.question}</h2>
            <p className="text-gray-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
