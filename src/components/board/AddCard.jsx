import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useBoardStore } from "../../store/useBoardStore";

export default function AddCard({ columnId }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const { board, getFullBoard } = useBoardStore();

  const create = async () => {
    await axiosClient.post("/cards", {
      title,
      columnId,
      boardId: board._id,
    });

    await getFullBoard(board._id);
    setTitle("");
    setOpen(false);
  };

  return open ? (
    <div className="mt-2">
      <input
        className="border w-full p-2 rounded"
        placeholder="Card title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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
