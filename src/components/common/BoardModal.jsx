import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/useAuthStore";

export default function BoardModal({ board, onClose, onUpdate, onLeft, onDeleted }) {
  const [formData, setFormData] = useState({
    title: board?.title || "",
    description: board?.description || "",
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  // Extract current user ID - note: user has 'id' not '_id'
  const currentUserId = user?.id;
  const ownerId = (board?.owner && typeof board.owner === "object" && board.owner._id)
    ? board.owner._id
    : board?.owner;

  const isOwner = currentUserId && ownerId && String(ownerId).trim() === String(currentUserId).trim();

  // Debug: log owner detection
  console.log("🔍 BoardModal owner check:", {
    user,
    currentUserId,
    ownerId,
    isOwner,
    boardOwnerObj: board?.owner,
  });

  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosClient.put(`/boards/${board._id}`, {
        title: formData.title,
        description: formData.description,
      });
      onUpdate(res.data);
      onClose();
    } catch (err) {
      console.error("Update board error:", err);
      alert(err.response?.data?.message || "Failed to update board");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveBoard = async () => {
    if (!user || isOwner) return; // owner cannot leave
    const confirm = window.confirm(`Leave board "${board.title}"?`);
    if (!confirm) return;
    try {
      setLoading(true);
      await axiosClient.post(`/boards/${board._id}/leave`);
      if (typeof onLeft === "function") onLeft(board._id);
      onClose();
    } catch (err) {
      console.error("Leave board error:", err);
      alert(err.response?.data?.message || "Failed to leave board");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!isOwner) return;
    const confirm = window.confirm(
      `Delete board "${board.title}"? This action cannot be undone.`
    );
    if (!confirm) return;

    try {
      setLoading(true);
      await axiosClient.delete(`/boards/${board._id}`);
      if (typeof onDeleted === "function") onDeleted(board._id);
      onClose();
    } catch (err) {
      console.error("Delete board error:", err);
      alert(err.response?.data?.message || "Failed to delete board");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[450px] rounded-lg shadow-lg p-6 relative">
        {/* CLOSE BUTTON */}
        <button
          className="absolute top-2 right-2 text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Edit Board</h2>

        {/* TITLE */}
        <label className="text-sm font-medium">Title</label>
        <input
          className="border w-full p-2 rounded mb-3"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Board title"
        />

        {/* DESCRIPTION */}
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="border w-full p-2 rounded mb-4"
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Board description (optional)"
        />

        {/* BUTTONS */}
        <div className="flex gap-2 justify-between items-center">
          <div className="flex gap-2">
            {user && !isOwner && (
              <button
                onClick={handleLeaveBoard}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                disabled={loading}
                title="Leave this board"
              >
                Leave Board
              </button>
            )}

            {/* Delete Board - visible to all, but only owner can use */}
            <button
              onClick={handleDeleteBoard}
              disabled={loading || !isOwner}
              className={`px-4 py-2 text-white rounded ${
                isOwner
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              title={isOwner ? "Delete this board" : "Only owner can delete"}
            >
              Delete Board
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
