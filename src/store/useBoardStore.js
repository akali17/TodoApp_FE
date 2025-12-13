import { useState } from "react";
import { useBoardStore } from "../../store/useBoardStore";

export default function BoardMembers({ board }) {
  const [open, setOpen] = useState(false);
  const onlineUsers = useBoardStore(state => state.onlineUsers);

  const isOnline = (userId) => onlineUsers.includes(userId);

  return (
    <>
      {/* AVATAR STACK */}
      <div className="flex items-center gap-2">
        {board.members.map((m) => (
          <div key={m._id} className="relative">
            <img
              src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}`}
              className="w-8 h-8 rounded-full border"
            />

            {/* ONLINE DOT */}
            {isOnline(m._id) && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
        ))}
      </div>

      {/* VIEW MEMBERS */}
      <button
        onClick={() => setOpen(true)}
        className="ml-3 px-3 py-1 bg-gray-300 rounded"
      >
        Members
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded p-6 relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">Members</h2>

            {board.members.map(m => (
              <div key={m._id} className="flex items-center gap-3 mb-2">
                <img
                  src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}`}
                  className="w-8 h-8 rounded-full"
                />
                <span>{m.username}</span>

                {isOnline(m._id) && (
                  <span className="text-xs text-green-600 ml-auto">Online</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
