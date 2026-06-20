import React, { useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { Switch } from "antd";
import { useUserStore } from "../../store/user";
import socketService from "../../services/socket.service";

const General = ({ onBack }) => {
  const showOnline = useUserStore((state)=> state.showOnline);
  const setShowOnline = useUserStore((state)=> state.setShowOnline);
  const theme = useUserStore((state) => state.theme)
  const setTheme = useUserStore((state) => state.setTheme)

  const handleShowOnlineToggle = (status) => {
    setShowOnline(status);
    socketService.updateShowOnline(status);
  };

  // const [theme, setTheme] = useState("dark");
  const [enterKey, setEnterKey] = useState(false);
      

  const generalSettings = [
    {
      title: "Theme",
      description: "Choose a theme",
      value: theme,
      options: ["light", "dark", "system"],
      onChange: setTheme
    },
    {
      title: "Enter key sends",
      description: "Send message when pressing Enter",
      toggle: enterKey,
      onChange: setEnterKey
    },
    {
      title: "Show online status",
      description: "Let others see when you're online",
      toggle: showOnline,
      onChange: handleShowOnlineToggle
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
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">General</h2>
      </div>

      <div className="p-6 space-y-6">
        {generalSettings.map((setting, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2"
          >
            <div>
              <h3 className="text-surface-900 dark:text-white font-medium">{setting.title}</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                {setting.description}
              </p>
            </div>

            {setting.toggle !== undefined ? (
              <Switch
                checked={setting.toggle}
                onChange={setting.onChange}
                className="bg-surface-600"
              />
            ) : (
              <select
                value={setting.value}
                onChange={(e) => setting.onChange(e.target.value)}
                className="bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-white border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-1"
              >
                {setting.options.map((opt, i) => (
                  <option key={i} value={opt} className="capitalize">
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default General;
