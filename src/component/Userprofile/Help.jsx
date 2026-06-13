import React from "react";
import { HiChevronLeft } from "react-icons/hi";
import { FaQuestionCircle, FaBook, FaExclamationTriangle } from "react-icons/fa";

const Help = ({ onBack }) => {
  const helpItems = [
    {
      icon: <FaQuestionCircle />,
      title: "FAQ",
      description: "Frequently asked questions"
    },
    {
      icon: <FaBook />,
      title: "Help Center",
      description: "Browse our help articles"
    },
    {
      icon: <FaExclamationTriangle />,
      title: "Report a Problem",
      description: "Let us know about an issue"
    }
  ];

  return (
    <div className="w-full h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-700 bg-surface-800">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-700 text-white transition-colors"
        >
          <HiChevronLeft size="24" />
        </button>
        <h2 className="text-xl font-semibold text-white">Help</h2>
      </div>

      <div className="p-6 space-y-2">
        {helpItems.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-start gap-4 px-4 py-4 text-left rounded-xl hover:bg-surface-700 transition-colors"
          >
            <span className="text-xl text-primary-400 mt-1">{item.icon}</span>
            <div>
              <h3 className="text-white font-medium">{item.title}</h3>
              <p className="text-sm text-surface-400 mt-1">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Help;
