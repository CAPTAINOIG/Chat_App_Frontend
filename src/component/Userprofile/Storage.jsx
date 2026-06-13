import React from "react";
import { HiChevronLeft } from "react-icons/hi";
import { FaPhotoVideo, FaFileAudio, FaFileAlt } from "react-icons/fa";

const Storage = ({ onBack }) => {
  const storageStats = [
    { icon: <FaPhotoVideo />, title: "Photos & Videos", size: "2.4 GB", count: "156" },
    { icon: <FaFileAudio />, title: "Voice Messages", size: "850 MB", count: "42" },
    { icon: <FaFileAlt />, title: "Documents", size: "300 MB", count: "18" }
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
        <h2 className="text-xl font-semibold text-white">Storage</h2>
      </div>

      <div className="p-6 space-y-2">
        {storageStats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-surface-700 transition-colors"
          >
            <span className="text-2xl text-primary-400">{stat.icon}</span>
            <div className="flex-1">
              <h3 className="text-white font-medium">{stat.title}</h3>
              <p className="text-sm text-surface-400 mt-1">
                {stat.count} items • {stat.size}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Storage;
