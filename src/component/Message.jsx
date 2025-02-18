import React, { useEffect, useRef } from 'react'
import ForwardMessage from './ForwardMessage';
import { BsThreeDotsVertical } from "react-icons/bs";
import { motion } from 'framer-motion';


const Message = ({
    msg,
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
    displayUsers,
    newData,
    users,
}) => {
        // const dropdownRef = useRef(null)
        // useEffect(() => {
        //     const handleClickOutside = (event) => {
        //         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        //             setOpenToggle(false);
        //         }
        //     };
        //     document.addEventListener("mousedown", handleClickOutside);
        //     return () => {
        //         document.removeEventListener("mousedown", handleClickOutside);
        //     };
        // }, []);
        return (
    <div
        // ref={(el) => {
        //     if (el) {
        //         messageRefs.current[msg._id] = el;
        //     }
        // }}
        className={`flex group ${msg.senderId === userId ? 'justify-end' : 'justify-start'} p-2`}
    >
        <div className={`p-2 mb-5 rounded relative max-w-[70%] min-w-[30%] ${msg.senderId === userId ? 'bg-blue-200 text-blue-800 ' : 'bg-gray-200 text-gray-800'}`}  style={{
              borderBottomLeftRadius: msg.senderId === userId ? "20px" : "5px",
              borderBottomRightRadius: msg.senderId === userId ? "5px" : "20px",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
            }}>
            <div className="flex gap-1 itHems-center px-2">
                <strong>{msg.senderId === userId ? 'You' : selectedUser.username}:</strong>
                <p>{msg.content}</p>
                <em className="text-sm text-gray-500">
                {msg.timestamp && new Date(msg?.timestamp).toLocaleTimeString()}
            </em>
            </div>

            {msg.replyTo && (
                <div
                    onClick={() => scrollToMessage(msg?._id)}
                    className="reply-info p-2 border-l-4 border-blue-500 bg-gray-100 text-sm mb-2"
                >
                    <span className="text-gray-600">Replying to:</span> <span>{msg?.replyTo}</span>
                </div>
            )}

            {!openForwardToggle && (
                <div onClick={() => handleToggle(msg?.messageId)} className="group cursor-pointer">
                    <span
                        className={`${msg.senderId === userId
                                ? 'absolute top-[5%] left-[-14%] p-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 hidden group-hover:flex'
                                : 'absolute top-[10%] right-[-14%] p-2 bg-blue-200 rounded-full cursor-pointer hover:bg-blue-300 hidden group-hover:flex'
                            }`}
                    >
                        <BsThreeDotsVertical className="text-xl" />
                    </span>
                </div>
            )}

            {openToggle && selectedMsg === msg?.messageId && (
                <motion.div id='message-container'
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.9 }}
                    className={`${msg.senderId === userId
                            ? 'absolute top-[0%] left-[-64%] w-1/2 p-2 z-10 bg-gray-200'
                            : 'absolute top-[0%] right-[-64%] w-1/2 p-2 z-10 bg-blue-200'
                        }`}
                >
                    {data?.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-300 rounded-full"
                            onClick={() => handleAction(item?.text, msg.content, msg?.messageId, msg?.receiverId, msg?.senderId)}
                        >
                            {item?.icon}
                            <span>{item?.text}</span>
                        </div>
                    ))}
                </motion.div>
            )}

            {openForwardToggle && selectedToggle === msg?.messageId && (
                <ForwardMessage
                    users={users}
                    forwardTo={forwardTo}
                    handleForwardTo={handleForwardTo}
                    forwardMessage={forwardMessage}
                    setOpenForwardToggle={setOpenForwardToggle}
                    selectedToggle={selectedToggle}
                    handleForwardClick={handleForwardClick}
                    filteredUsers={filteredUsers}
                    setFilteredUsers={setFilteredUsers}
                    setForwardTo={setForwardTo}
                    data={data}
                    displayUsers={displayUsers}
                />
            )}
        </div>
    </div>
)};


export default Message