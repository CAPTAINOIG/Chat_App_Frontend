import React from "react";
import { HiChevronLeft } from "react-icons/hi";
import { FaLock, FaUserEdit, FaTrashAlt } from "react-icons/fa";

const Accounts = ({ onBack }) => {
  const accountOptions = [
    {
      icon: <FaUserEdit />,
      title: "Edit Profile",
      description: "Change your name, about, and profile picture"
    },
    {
      icon: <FaLock />,
      title: "Privacy",
      description: "Control who can see your info"
    },
    {
      icon: <FaTrashAlt />,
      title: "Delete Account",
      description: "Permanently delete your account"
    }
  ];

  return (
    <div className="w-full h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white transition-colors"
        >
          <HiChevronLeft size="24" />
        </button>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Account</h2>
      </div>

      <div className="p-6 space-y-2">
        {accountOptions.map((option, index) => (
          <button
            key={index}
            className="w-full flex items-start gap-4 px-4 py-4 text-left rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          >
            <span className="text-xl text-primary-400 mt-1">
              {option.icon}
            </span>
            <div>
              <h3 className="text-surface-900 dark:text-white font-medium">{option.title}</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Accounts;
