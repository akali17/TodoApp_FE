import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useBoardStore } from "../../store/useBoardStore";

export default function AddCard({ columnId }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const { createCard } = useBoardStore();

  const create = async () => {
    if (!title.trim()) return;
    
    await createCard(columnId, title);
    setTitle("");
    setOpen(false);
  };

  return open ? (
    <div className="mt-2">
      <input
        autoFocus
        className="border w-full p-2 rounded"
        placeholder="Card title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") create();
          if (e.key === "Escape") {
            setOpen(false);
            setTitle("");
          }
        }}
      />
      <button
        onClick={create}
        className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
      >
        Add Card
      </button>
    </div>
  ) : (
    <button
      className="text-sm text-blue-600 mt-2"
      onClick={() => setOpen(true)}
    >
      + Add Card
    </button>
  );
}
