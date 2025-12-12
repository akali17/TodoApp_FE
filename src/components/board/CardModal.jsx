import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";

export default function CardModal({ cardId, onClose }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isDone, setIsDone] = useState(false);

  const [memberEmail, setMemberEmail] = useState("");

  // ============================
  // LOAD CARD DETAIL
  // ============================
  const fetchCard = async () => {
    try {
      const res = await axiosClient.get(`/cards/${cardId}`);
      const data = res.data;

      setCard(data);

      setTitle(data.title);
      setDescription(data.description || "");
      setDeadline(data.deadline ? data.deadline.substring(0, 10) : "");
      setIsDone(data.isDone);
    } catch (err) {
      console.error("LOAD CARD ERROR:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCard();
  }, [cardId]);

  if (loading || !card) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow">Loading...</div>
      </div>
    );
  }

  // ============================
  // UPDATE CARD
  // ============================
  const updateCard = async () => {
    await axiosClient.put(`/cards/${cardId}`, {
      title,
      description,
      deadline,
      isDone,
    });

    fetchCard();
  };

  // ============================
  // ADD MEMBER
  // ============================
  const addMember = async () => {
    if (!memberEmail.trim()) return;
    await axiosClient.post(`/cards/${cardId}/add-member`, {
      email: memberEmail,
    });
    setMemberEmail("");
    fetchCard();
  };

  // ============================
  // REMOVE MEMBER
  // ============================
  const removeMember = async (userId) => {
    await axiosClient.delete(`/cards/${cardId}/remove-member/${userId}`);
    fetchCard();
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

        {/* TITLE */}
        <h2 className="text-xl font-semibold mb-2">Edit Card</h2>

        <label className="text-sm">Title</label>
        <input
          className="border w-full p-2 rounded mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* DESCRIPTION */}
        <label className="text-sm">Description</label>
        <textarea
          className="border w-full p-2 rounded mb-3"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* DEADLINE */}
        <label className="text-sm">Deadline</label>
        <input
          type="date"
          className="border w-full p-2 rounded mb-3"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        {/* DONE CHECKBOX */}
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={isDone}
            onChange={(e) => setIsDone(e.target.checked)}
          />
          <span className="text-sm">Mark as done</span>
        </div>

        {/* CREATOR INFO */}
        <p className="text-xs text-gray-500 mb-3">
          Created by: <b>{card.createdBy?.username}</b>
        </p>

        {/* MEMBERS */}
        <h3 className="font-medium mb-1">Members</h3>

        <div className="flex flex-wrap gap-2 mb-3">
          {card.members?.map((m) => (
            <div
              key={m._id}
              className="flex items-center gap-2 bg-gray-200 px-2 py-1 rounded"
            >
              <img
                src={m.avatar || "/default-avatar.png"}
                alt=""
                className="w-6 h-6 rounded-full"
              />
              <span>{m.username}</span>

              {/* REMOVE */}
              <button
                className="text-red-500 text-sm"
                onClick={() => removeMember(m._id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ADD MEMBER */}
        <div className="flex gap-2 mb-4">
          <input
            className="border p-2 rounded flex-1"
            placeholder="Add member by email..."
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white px-3 rounded"
            onClick={addMember}
          >
            Add
          </button>
        </div>

        {/* SAVE BUTTON */}
        <button
          className="bg-green-600 text-white w-full py-2 rounded"
          onClick={updateCard}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
