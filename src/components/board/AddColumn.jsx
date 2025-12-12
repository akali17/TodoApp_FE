import { useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function AddColumn({ boardId, onCreated }) {
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);

  const create = async () => {
    await axiosClient.post("/columns", { boardId, title });
    setTitle("");
    setOpen(false);
    onCreated();
  };

  return open ? (
    <div className="bg-white w-64 p-3 rounded shadow">
      <input
        className="border w-full p-2 rounded"
        placeholder="Column title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={create} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">
        Add
      </button>
    </div>
  ) : (
    <button
      className="w-64 p-3 bg-white rounded shadow text-gray-500 hover:bg-gray-50"
      onClick={() => setOpen(true)}
    >
      + Add Column
    </button>
  );
}
