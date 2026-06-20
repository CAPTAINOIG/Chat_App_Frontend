import React from "react";
import { HiChevronLeft } from "react-icons/hi";
import { FaCodeBranch, FaShieldAlt, FaEnvelope } from "react-icons/fa";

const Info = ({ onBack }) => {
  const infoItems = [
    { icon: <FaCodeBranch />, title: "Version", value: "1.0.0" },
    { icon: <FaShieldAlt />, title: "Privacy Policy", value: "Read our policy" },
    { icon: <FaEnvelope />, title: "Contact Us", value: "support@example.com" },
  ];

  return (
    <div className="w-full h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white transition-colors"
        >
          <HiChevronLeft size="24" />
        </button>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Info</h2>
      </div>

      <div className="p-6 space-y-2">
        {infoItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          >
            <span className="text-xl text-primary-400">{item.icon}</span>
            <div className="flex-1">
              <p className="text-surface-600 dark:text-surface-200 text-sm">{item.title}</p>
            </div>
            <p className="text-surface-600 dark:text-surface-400 text-sm">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Info;
