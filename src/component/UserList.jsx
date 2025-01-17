import React from 'react'

const UserList = ({ users, handleUserClick }) => (
    <div className="md:w-1/4 w-full p-4 border-b md:border-b-0 md:border-r border-gray-300 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900 bg-gray-100 border-t rounded-sm p-1 border-gray-300">Users</h2>
        <div className="space-y-2">
            {users.map((item, i) => (
                <div
                    key={i}
                    className="p-2 cursor-pointer hover:bg-gray-200 rounded bg-gray-100 bg-opacity-50"
                    onClick={() => handleUserClick(item)}
                >
                    {item.username}
                    <span className={`ml-2 ${item.online ? 'text-green-500' : 'text-red-500'}`}>
                        ({item.online ? 'Online' : 'Offline'})
                    </span>
                </div>
            ))}
        </div>
    </div>
);


export default UserList