import React, { useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { Switch } from "antd";

const Settings = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [sound, setSound] = useState(true);

  return (
    <div className="w-full h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-900 dark:text-white transition-colors"
        >
          <HiChevronLeft size="24" />
        </button>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Settings</h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-surface-900 dark:text-white font-medium">Notifications</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Enable app notifications</p>
          </div>
          <Switch checked={notifications} onChange={setNotifications} />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-surface-900 dark:text-white font-medium">Read Receipts</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Show when you've read messages</p>
          </div>
          <Switch checked={readReceipts} onChange={setReadReceipts} />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-surface-900 dark:text-white font-medium">Sound Effects</h3>
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">Play sounds for new messages</p>
          </div>
          <Switch checked={sound} onChange={setSound} />
        </div>
      </div>
    </div>
  );
};

export default Settings;
