import { useState } from "react";
import { useBoardStore } from "../../store/useBoardStore";

export default function AddColumn({ boardId }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  const { createColumn } = useBoardStore();

  const create = async () => {
    if (!title.trim()) return;

    await createColumn(boardId, title);
    setTitle("");
    setOpen(false);
  };

  return open ? (
    <div className="bg-white w-64 p-3 rounded-xl shadow-sm border min-h-[calc(100vh-200px)] h-fit flex flex-col flex-shrink-0">
      <input
        autoFocus
        className="border-2 w-full p-2 rounded-lg focus:outline-none focus:border-blue-500"
        placeholder="Column title..."
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
      <div className="flex gap-2 mt-2">
        <button
          onClick={create}
          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
        >
          Add
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className="bg-gray-100 w-64 p-3 rounded-xl hover:bg-gray-200 transition border-2 border-dashed border-gray-300 min-h-[calc(100vh-200px)] h-fit flex items-center justify-center font-medium text-gray-600 flex-shrink-0"
    >
      + Add Column
    </button>
  );
}
