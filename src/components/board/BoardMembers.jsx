import { useState } from "react";
import useOnlineUsers from "../../hooks/useOnlineUsers";
import axiosClient from "../../api/axiosClient";

export default function BoardMembers({ board }) {
  const [open, setOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");

  const onlineUsers = useOnlineUsers(board._id);

  const inviteMember = async () => {
    if (!email.trim()) return;
    await axiosClient.post(`/boards/${board._id}/add-member`, { email });
    setEmail("");
    setInviteOpen(false);
  };

  const isOnline = (userId) =>
    onlineUsers.some((u) => u.userId === userId);

  return (
    <>
      {/* ===== AVATAR STACK ===== */}
      <div className="flex items-center gap-2">
        {board.members?.slice(0, 5).map((m) => (
          <div key={m._id} className="relative -ml-2">
            <img
              src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}`}
              className="w-8 h-8 rounded-full border"
              title={m.username}
            />

            {/* ONLINE DOT */}
            {isOnline(m._id) && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
        ))}

        <button
          onClick={() => setInviteOpen(true)}
          className="ml-3 px-3 py-1 bg-blue-600 text-white rounded"
        >
          + Invite
        </button>

        <button
          onClick={() => setOpen(true)}
          className="px-3 py-1 bg-gray-300 rounded"
        >
          View Members
        </button>
      </div>

      {/* ===== MEMBERS MODAL ===== */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded p-6 relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">Board Members</h2>

            {board.members.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}`}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{m.username}</span>
                </div>

                {isOnline(m._id) ? (
                  <span className="text-green-600 text-xs">● Online</span>
                ) : (
                  <span className="text-gray-400 text-xs">Offline</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== INVITE MODAL ===== */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[350px] rounded p-6 relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setInviteOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">Invite Member</h2>

            <input
              className="border p-2 rounded w-full mb-4"
              placeholder="Enter email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              onClick={inviteMember}
              className="bg-blue-600 text-white w-full py-2 rounded"
            >
              Invite
            </button>
          </div>
        </div>
      )}
    </>
  );
}
