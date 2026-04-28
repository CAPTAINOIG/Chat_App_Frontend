import React from 'react';
import ProfilePic from './ProfilePic';

const ChatHeader = ({ selectedUser, image, setImage }) => {
  return (
    <div className="flex items-center justify-between fixed w-full z-10 px-5 py-4 bg-surface-800/95 backdrop-blur-sm border-b border-surface-700 shadow-lg">
      <div className="flex items-center">
        <div className="ms-16">
          <p className="text-surface-50 font-semibold text-lg">
            Chatting with {selectedUser.username}
          </p>
          <p
            className={`ml-0 text-sm ${
              selectedUser.online ? "text-accent-400" : "text-red-400"
            }`}
          >
            ({selectedUser.online ? "Online" : "Offline"})
          </p>
        </div>
        <div className="z-50 absolute">
          <ProfilePic
            selectedUser={selectedUser}
            image={image}
            setImage={setImage}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;