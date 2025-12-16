import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import useOnlineUsers from "../../hooks/useOnlineUsers";
import { useAuthStore } from "../../store/useAuthStore";

export default function BoardMembers({ board }) {
  const [open, setOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitingEmail, setInvitingEmail] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");

  // Use useAuthStore hook to get user (will update when user changes)
  const user = useAuthStore((state) => state.user);
  const onlineUsers = useOnlineUsers();

  const isOnline = (userId) => onlineUsers.includes(userId);

  // Compare using String to handle both object and string IDs
  const isOwner = String(user?._id) === String(board.owner?._id || board.owner);

  const sendEmailInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      setInvitingEmail(true);
      const res = await axiosClient.post(`/boards/${board._id}/invite`, { 
        email: inviteEmail 
      });
      setInviteMessage(res.data.message || "Invite sent!");
      setInviteEmail("");
      setTimeout(() => {
        setInviteMessage("");
        setInviteOpen(false);
      }, 2000);
    } catch (err) {
      console.error("Invite error:", err);
      alert(err.response?.data?.message || "Failed to send invite");
    } finally {
      setInvitingEmail(false);
    }
  };

  const removeMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await axiosClient.post(`/boards/${board._id}/remove-member`, { userId });
    } catch (err) {
      console.error("Remove member error:", err);
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  return (
    <>
      {/* ===== HEADER MEMBERS ===== */}
      <div className="flex items-center gap-2">

        {/* ➕ ADD MEMBER BUTTON */}
        <button
          onClick={() => setInviteOpen(true)}
          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
          title="Add member"
        >
          +
        </button>

        {/* AVATARS */}
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => setOpen(true)}
        >
          {board.members?.slice(0, 5).map((m) => (
            <div key={m._id} className="relative">
              <img
                src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}`}
                className="w-8 h-8 rounded-full border"
              />

              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border
                ${isOnline(m._id) ? "bg-green-500" : "bg-gray-400"}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ===== MEMBERS LIST MODAL ===== */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded p-6 relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">
              Board Members ({board.members.length})
            </h2>

            {board.members.map((m) => {
              const isBoardOwner = String(m._id) === String(board.owner?._id || board.owner);
              return (
                <div
                  key={m._id}
                  className="flex items-center gap-3 mb-2 p-2 rounded hover:bg-gray-50"
                >
                  <img
                    src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}`}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{m.username}</span>
                      {isBoardOwner && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Owner</span>
                      )}
                    </div>
                  </div>

                  <span className={`text-xs ${isOnline(m._id)
                    ? "text-green-600"
                    : "text-gray-400"}`}>
                    {isOnline(m._id) ? "Online" : "Offline"}
                  </span>

                  {/* Remove button - only for owner and not for board owner */}
                  {isOwner && !isBoardOwner && (
                    <button
                      onClick={() => removeMember(m._id)}
                      className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                      title="Remove member"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== INVITE MODAL ===== */}
      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded p-6 relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => {
                setInviteOpen(false);
                setInviteMessage("");
              }}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">Invite Member</h2>

            {inviteMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-4">
                ✅ {inviteMessage}
              </div>
            )}

            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inviteEmail.trim() && !invitingEmail) {
                  sendEmailInvite();
                }
              }}
              className="border p-2 rounded w-full mb-4"
            />
            <p className="text-sm text-gray-600 mb-4">
              They will receive a confirmation email and can join the board by clicking the link.
            </p>
            <button
              onClick={sendEmailInvite}
              disabled={!inviteEmail.trim() || invitingEmail}
              className="bg-blue-600 text-white w-full py-2 rounded disabled:bg-gray-400 hover:bg-blue-700"
            >
              {invitingEmail ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
