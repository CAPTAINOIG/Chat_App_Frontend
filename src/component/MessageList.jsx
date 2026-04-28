import React from "react";
import Message from "./Message";

const MessageList = ({
  messages,
  userId,
  selectedUser,
  messageRefs,
  openToggle,
  setOpenToggle,
  selectedMsg,
  handleToggle,
  data,
  handleAction,
  openForwardToggle,
  selectedToggle,
  forwardTo,
  handleForwardTo,
  forwardMessage,
  setOpenForwardToggle,
  scrollToMessage,
  handleForwardClick,
  filteredUsers,
  setFilteredUsers,
  setForwardTo,
  users,
}) => {
  return (
    <div className="space-y-2 py-[12%]" id="scroll">
      {messages.length > 0 ? (
        messages.map((msg, index) => (
          <Message
            key={msg.messageId || index}
            msg={msg}
            userId={userId}
            selectedUser={selectedUser}
            messageRefs={messageRefs}
            openToggle={openToggle}
            setOpenToggle={setOpenToggle}
            selectedMsg={selectedMsg}
            handleToggle={handleToggle}
            data={data}
            handleAction={handleAction}
            openForwardToggle={openForwardToggle}
            selectedToggle={selectedToggle}
            forwardTo={forwardTo}
            handleForwardTo={handleForwardTo}
            handleForwardClick={handleForwardClick}
            forwardMessage={forwardMessage}
            setOpenForwardToggle={setOpenForwardToggle}
            users={users}
            scrollToMessage={scrollToMessage}
            filteredUsers={filteredUsers}
            setFilteredUsers={setFilteredUsers}
            setForwardTo={setForwardTo}
          />
        ))
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-surface-400 text-center">
            No messages yet. Start the conversation!
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
