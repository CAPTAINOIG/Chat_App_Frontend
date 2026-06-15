import React, { useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { Switch } from "antd";

const Chats = ({ onBack }) => {
  const [autoSaveMedia, setAutoSaveMedia] = useState(false);
  const [chatBackup, setChatBackup] = useState(true);

  return (
    <div className="w-full h-full flex flex-col">
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
            <h3 className="text-white font-medium">Auto-save media</h3>
            <p className="text-sm text-surface-400 mt-1">
              Automatically save incoming photos and videos
            </p>
          </div>
          <Switch checked={autoSaveMedia} onChange={setAutoSaveMedia} />
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-white font-medium">Chat backup</h3>
            <p className="text-sm text-surface-400 mt-1">
              Automatically backup your chats
            </p>
          </div>
          <Switch checked={chatBackup} onChange={setChatBackup} />
        </div>
        <button className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors mt-4">
          Clear all chats
        </button>
      </div>
    </div>
  );
};

export default Chats;
