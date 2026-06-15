import React, { useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { Switch } from "antd";

const Notifications = ({ onBack }) => {
  const [messageSound, setMessageSound] = useState(true);
  const [groupAlerts, setGroupAlerts] = useState(true);
  const [inAppPreview, setInAppPreview] = useState(true);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-700 bg-surface-800">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-700 text-white transition-colors"
        >
          <HiChevronLeft size="24" />
        </button>
        <h2 className="text-xl font-semibold text-white">Notifications</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-white font-medium">Message sound</h3>
            <p className="text-sm text-surface-400 mt-1">
              Play a sound when you receive a new message
            </p>
          </div>
          <Switch checked={messageSound} onChange={setMessageSound} />
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-white font-medium">Group notifications</h3>
            <p className="text-sm text-surface-400 mt-1">
              Get notified of new messages in groups
            </p>
          </div>
          <Switch checked={groupAlerts} onChange={setGroupAlerts} />
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-white font-medium">In-app preview</h3>
            <p className="text-sm text-surface-400 mt-1">
              Show message previews within the app
            </p>
          </div>
          <Switch checked={inAppPreview} onChange={setInAppPreview} />
        </div>
      </div>
    </div>
  );
};

export default Notifications;
