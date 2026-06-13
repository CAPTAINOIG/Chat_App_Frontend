import React, { useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { Switch } from "antd";

const Chats = ({ onBack }) => {
  const [chatBackup, setChatBackup] = useState(true);
  const [mediaAutoSave, setMediaAutoSave] = useState(false);

  return (
    <div className="w-full h-full">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-700 bg-surface-800">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-700 text-white transition-colors"
        >
          <HiChevronLeft size="24" />
        </button>
        <h2 className="text-xl font-semibold text-white">Chats</h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-white font-medium">Chat Backup</h3>
            <p className="text-sm text-surface-400 mt-1">Automatically backup chats</p>
          </div>
          <Switch checked={chatBackup} onChange={setChatBackup} />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-white font-medium">Save Media</h3>
            <p className="text-sm text-surface-400 mt-1">Auto-save photos/videos</p>
          </div>
          <Switch checked={mediaAutoSave} onChange={setMediaAutoSave} />
        </div>

        <button className="w-full py-3 mt-6 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors">
          Clear All Chats
        </button>
      </div>
    </div>
  );
};

export default Chats;
