import React, { useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { Switch } from "antd";

const VideoAudio = ({ onBack }) => {
  const [videoQuality, setVideoQuality] = useState("auto");
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [autoAnswer, setAutoAnswer] = useState(false);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-700 bg-surface-800">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-700 text-white transition-colors"
        >
          <HiChevronLeft size="24" />
        </button>
        <h2 className="text-xl font-semibold text-white">Video & Audio</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-white font-medium">Video quality</h3>
            <p className="text-sm text-surface-400 mt-1">
              Choose the quality for video calls
            </p>
          </div>
          <select
            value={videoQuality}
            onChange={(e) => setVideoQuality(e.target.value)}
            className="bg-surface-700 text-white border border-surface-600 rounded-lg px-3 py-1"
          >
            <option value="auto">Auto</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-white font-medium">Noise cancellation</h3>
            <p className="text-sm text-surface-400 mt-1">
              Reduce background noise during calls
            </p>
          </div>
          <Switch checked={noiseCancellation} onChange={setNoiseCancellation} />
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <h3 className="text-white font-medium">Auto-answer calls</h3>
            <p className="text-sm text-surface-400 mt-1">
              Automatically answer incoming video/audio calls
            </p>
          </div>
          <Switch checked={autoAnswer} onChange={setAutoAnswer} />
        </div>
      </div>
    </div>
  );
};

export default VideoAudio;
