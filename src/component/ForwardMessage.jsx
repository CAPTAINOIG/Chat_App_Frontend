import React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ForwardMessage = ({
  users,
  forwardTo,
  handleForwardTo,
  forwardMessage,
  setOpenForwardToggle,
  handleForwardClick,
  filteredUsers,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="absolute top-[10%] right-[110%] w-full p-3 bg-surface-800 border border-surface-600 rounded-lg shadow-lg"
  >
    <div className="float-right text-red-400 hover:text-red-300 cursor-pointer">
      <button type="button" onClick={() => setOpenForwardToggle("")}>
        <p className="text-xl">✖</p>
      </button>
    </div>
    <div>
      <p className="font-bold text-surface-50 mb-2">Forward To</p>
      <input
        className="border border-surface-600 bg-surface-900 text-surface-50 w-full rounded-lg px-3 py-2 outline-none focus:border-primary-500 transition-colors"
        type="text"
        value={forwardTo}
        onChange={handleForwardTo}
        placeholder="Search users..."
      />
      <div className="space-y-2 mt-3 max-h-60 overflow-y-auto">
        {(forwardTo ? filteredUsers : users).length > 0 ? (
          (forwardTo ? filteredUsers : users).map((item, i) => (
            <div
              key={i}
              className="p-2 cursor-pointer hover:text-white rounded-lg bg-surface-900 hover:bg-primary-600 transition-colors"
              onClick={() => handleForwardClick(item)}
            >
              {item.username}
              <span
                className={`ml-2 ${
                  item.online ? "text-accent-400" : "text-red-400"
                }`}
              >
                ({item.online ? "Online" : "Offline"})
              </span>
            </div>
          ))
        ) : (
          <p className="text-surface-400 bg-surface-900 border border-surface-700 rounded-lg py-6 p-3 text-center">
            No users found.
          </p>
        )}
      </div>

      <button
        className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-500 transition-colors w-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => {
          if (filteredUsers.length > 0) {
            forwardMessage(filteredUsers[0]?.username, filteredUsers[0]?._id);
          } else {
            toast.error("Please select a user");
          }
        }}
        disabled={filteredUsers.length === 0}
      >
        Forward Message
      </button>
    </div>
  </motion.div>
);

export default ForwardMessage;
