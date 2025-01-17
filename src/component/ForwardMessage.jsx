import React from 'react'
import { motion } from 'framer-motion';

const ForwardMessage = ({
    users,
    forwardTo,
    handleForwardTo,
    forwardMessage,
    setOpenForwardToggle,
    selectedToggle,
    handleForwardClick,
    filteredUsers,
    data
}) => (
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.9 }}
        className="absolute top-[10%] right-[110%] w-full p-2 bg-gray-200"
    >
        <div className="float-right text-red-500 hover:text-red-700 cursor-pointer">
            <button type="button" onClick={() => setOpenForwardToggle('')}>
                <p className="text-xl">✖</p>
            </button>
        </div>
        <div>
            <p className="font-bold">Forward To</p>
            <input
                className="border border-b-green-500 w-full rounded outline-none"
                type="text"
                value={forwardTo}
                onChange={handleForwardTo}
            />
            <div className="space-y-2">
                {users.length > 0 ? users.map((item, i) => (
                    <div
                        key={i}
                        className="p-2 cursor-pointer hover:text-white rounded bg-gray-100 hover:bg-blue-700 bg-opacity-50"
                        onClick={() => handleForwardClick(item)}
                    >
                        {item.username}
                        <span className={`ml-2 ${item.online ? 'text-green-500' : 'text-red-500'}`}>
                            ({item.online ? 'Online' : 'Offline'})
                        </span>
                    </div>
                )) : (
                    <p className="text-gray-700 bg-gray-100 border-t border-gray-300 py-6 p-3 text-xl">No users found.</p>
                )}
            </div>

            <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                    forwardMessage(filteredUsers[0]?.username, filteredUsers[0]?._id);
                    setOpenForwardToggle(false);
                }}
            >
                Forward Message
            </button>
        </div>
    </motion.div>
);


export default ForwardMessage