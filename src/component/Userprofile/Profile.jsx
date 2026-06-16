import React from 'react';

const Profile = ({
  data,
  viewImage,
  setViewImage,
  image,
  user,
  selectedUser,
  setProfile,
  profile
}) => {
  
  return (
    <div className="w-full h-full">
      <div
        onClick={() => setViewImage(image || user)}
        className="w-full h-64 bg-gray-700 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
      >
        <img
          src={image || user}
          alt="Profile"
          className="w-40 h-40 rounded-full border-4 border-white/20 shadow-lg object-cover"
        />
      </div>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-white mb-1">
          {selectedUser?.username}
        </h2>
        <p className="text-sm text-surface-300 mb-6">
          {selectedUser?.number || "Not provided"}
        </p>
        <div className="border-b border-surface-700 pb-4 mb-6">
          <p className="text-xs text-surface-400 uppercase tracking-wider mb-2">About</p>
          <p className="text-surface-200 text-sm">
            {selectedUser?.aboutMe || "Hey there! I'm using this app."}
          </p>
        </div>
        <div className="space-y-1">
          {data?.map((item, index) => (
            <button
              key={index}
              onClick={() => setProfile(item.text.toLowerCase())}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left hover:bg-surface-700 transition-colors"
            >
              <span className="text-2xl text-surface-300">{item.icon}</span>
              <span className="text-surface-100 font-medium">{item.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Image Modal */}
      {viewImage && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100]"
          onClick={() => setViewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={viewImage}
              alt="Full-size Profile"
              className="w-full h-full object-contain rounded-xl"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewImage(null);
              }}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-surface-800 hover:bg-surface-700 text-white rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
