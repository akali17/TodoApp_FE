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
  const [inviteLink, setInviteLink] = useState("");

  // Use useAuthStore hook to get user (will update when user changes)
  let user = useAuthStore((state) => state.user);
  const onlineUsers = useOnlineUsers();

  // Fallback: try to get user from localStorage if not in store
  if (!user) {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        user = JSON.parse(storedUser);
      }
    } catch (err) {
      console.error("Failed to parse stored user:", err);
    }
  }

  const isOnline = (userId) => onlineUsers.includes(userId);

  // Compare using String to handle both object and string IDs
  // Handle both _id and id fields from API
  const userID = user?._id || user?.id;
  const boardOwnerID = board.owner?._id || board.owner?.id || board.owner;
  const isOwner = userID && boardOwnerID && String(userID) === String(boardOwnerID);

  const sendEmailInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      setInvitingEmail(true);
      const res = await axiosClient.post(`/boards/${board._id}/invite`, { 
        email: inviteEmail 
      });
      setInviteMessage(res.data.message || "Invite sent!");
      if (res.data.inviteLink) {
        setInviteLink(res.data.inviteLink);
      }
      setInviteEmail("");
      // Don't auto-close if there's a link to show
      if (!res.data.inviteLink) {
        setTimeout(() => {
          setInviteMessage("");
          setInviteOpen(false);
        }, 2000);
      }
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
                setInviteLink("");
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

            {inviteLink && (
              <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded mb-4">
                <p className="text-sm text-gray-700 mb-2">Invite Link:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 text-xs p-2 border rounded bg-white"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      alert("Link copied!");
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Share this link if email delivery fails</p>
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
