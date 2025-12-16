import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useBoardStore } from "../../store/useBoardStore";
import { getSocket } from "../../socket";

export default function CardModal({ cardId, onClose }) {

  const board = useBoardStore((s) => s.board);
  const card = useBoardStore(
    (s) => s.cards.find((c) => c._id === cardId)
  );
  const updateCard = useBoardStore((s) => s.updateCard);

  const [formData, setFormData] = useState({
    title: card?.title || "",
    description: card?.description || "",
    deadline: card?.deadline ? card.deadline.substring(0, 10) : "",
    isDone: card?.isDone || false,
  });

  const [selectedMemberId, setSelectedMemberId] = useState("");

  if (!card) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow">Loading...</div>
      </div>
    );
  }

  // ============================
  // DELETE CARD
  // ============================
  const deleteCard = async () => {
    if (!confirm("Delete this card? This action cannot be undone.")) return;
    try {
      await axiosClient.delete(`/cards/${cardId}`);
      // Socket event "card:deleted" will handle removal
      onClose();
    } catch (err) {
      console.error("DELETE CARD ERROR:", err);
    }
  };

  // ============================
  // UPDATE CARD
  // ============================
  const handleUpdateCard = async () => {
    await updateCard(cardId, {
      title: formData.title,
      description: formData.description,
      deadline: formData.deadline,
      isDone: formData.isDone,
    });
    onClose();
  };

  // ============================
  // ADD MEMBER
  // ============================
  const addMember = async () => {
    if (!selectedMemberId) return;
    try {
      await axiosClient.post(`/cards/${cardId}/members`, {
        userId: selectedMemberId,
      });
      // 🔥 EMIT SOCKET EVENT FOR REALTIME
      const socket = getSocket();
      if (socket) {
        socket.emit("card:member-added", {
          cardId,
          userId: selectedMemberId,
          boardId: board._id,
        });
      }
      setSelectedMemberId("");
    } catch (err) {
      console.error("Add member error:", err);
      alert(err.response?.data?.message || "Failed to add member");
    }
  };

  // ============================
  // REMOVE MEMBER
  // ============================
  const removeMember = async (userId) => {
    try {
      await axiosClient.delete(`/cards/${cardId}/members/${userId}`);
      // 🔥 EMIT SOCKET EVENT FOR REALTIME
      const socket = getSocket();
      if (socket) {
        socket.emit("card:member-removed", {
          cardId,
          userId,
          boardId: board._id,
        });
      }
    } catch (err) {
      console.error("Remove member error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[500px] rounded-lg shadow-lg p-6 relative">

        {/* CLOSE BUTTON */}
        <button
          className="absolute top-2 right-2 text-xl"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-2">Edit Card</h2>

        {/* TITLE */}
        <label className="text-sm">Title</label>
        <input
          className="border w-full p-2 rounded mb-3"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />

        {/* DESCRIPTION */}
        <label className="text-sm">Description</label>
        <textarea
          className="border w-full p-2 rounded mb-3"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />

        {/* DEADLINE */}
        <label className="text-sm">Deadline</label>
        <input
          type="date"
          className="border w-full p-2 rounded mb-3"
          value={formData.deadline}
          onChange={(e) => setFormData({...formData, deadline: e.target.value})}
        />

        {/* DONE CHECKBOX */}
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={formData.isDone}
            onChange={(e) => setFormData({...formData, isDone: e.target.checked})}
          />
          <span className="text-sm">Mark as done</span>
        </div>

        {/* CREATOR INFO */}
        <p className="text-xs text-gray-500 mb-3">
          Created by: <b>{card.createdBy?.username}</b>
        </p>

        {/* MEMBERS */}
        <h3 className="font-medium mb-1">Members ({card.members?.length || 0})</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {card.members?.length === 0 ? (
            <p className="text-gray-500 text-sm">No members assigned</p>
          ) : (
            card.members?.map((m) => (
              <div
                key={m._id}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 px-2 py-1 rounded"
              >
                <img
                  src={m.avatar || `https://ui-avatars.com/api/?name=${m.username}`}
                  alt=""
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm">{m.username}</span>
                <button
                  className="text-red-500 text-sm hover:text-red-700 ml-1"
                  onClick={() => removeMember(m._id)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* ADD MEMBER */}
        <div className="flex gap-2 mb-4">
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="border p-2 rounded flex-1"
          >
            <option value="">Select member to add...</option>
            {board?.members?.map((m) => {
              // Don't show members already in card
              const alreadyInCard = card?.members?.some(
                (cm) => String(cm._id) === String(m._id)
              );
              if (alreadyInCard) return null;
              return (
                <option key={m._id} value={m._id}>
                  {m.username}
                </option>
              );
            })}
          </select>
          <button
            className="bg-blue-600 text-white px-3 rounded disabled:bg-gray-400"
            onClick={addMember}
            disabled={!selectedMemberId}
          >
            Add
          </button>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex gap-2">
          <button
            className="flex-1 bg-green-600 text-white py-2 rounded"
            onClick={handleUpdateCard}
          >
            Save Changes
          </button>
          <button
            className="flex-1 bg-red-600 text-white py-2 rounded"
            onClick={deleteCard}
          >
            Delete Card
          </button>
        </div>
      </div>
    </div>
  );
}
