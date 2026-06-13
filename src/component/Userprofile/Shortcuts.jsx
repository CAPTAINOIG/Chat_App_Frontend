import React from "react";
import { HiChevronLeft } from "react-icons/hi";

const Shortcuts = ({ onBack }) => {
  const shortcuts = [
    { keys: "Ctrl + N", action: "New Chat" },
    { keys: "Ctrl + F", action: "Search" },
    { keys: "Esc", action: "Close Menu" },
    { keys: "Ctrl + Shift + D", action: "Toggle Dark Mode" },
    { keys: "Enter", action: "Send Message" }
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
        <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {shortcuts.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 bg-surface-700/50 rounded-xl"
            >
              <span className="text-surface-200">{item.action}</span>
              <div className="flex gap-1">
                {item.keys.split(" + ").map((key, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-surface-600 text-white rounded text-sm font-mono"
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shortcuts;
