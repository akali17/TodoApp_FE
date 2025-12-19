import { useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function BoardModal({ board, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: board?.title || "",
    description: board?.description || "",
  });
  const [loading, setLoading] = useState(false);

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
        <div className="flex gap-2 justify-end">
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
  );
}
