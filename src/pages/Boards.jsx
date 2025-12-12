import { useEffect, useState } from "react";
import { getMyBoards, createBoardApi } from "../api/board";
import { useAuthStore } from "../store/useAuthStore";

export default function Boards() {
  const { token } = useAuthStore();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBoard, setNewBoard] = useState("");

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const res = await getMyBoards(token);
      setBoards(res.data.boards);
    } catch (err) {
      console.log("Error:", err);
    }
    setLoading(false);
  };

  const createBoard = async () => {
    if (!newBoard.trim()) return;

    const res = await createBoardApi(newBoard, token);
    setBoards([...boards, res.data.board]);
    setNewBoard("");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Boards</h1>

      {/* Create Board Input */}
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded w-60"
          placeholder="New board title..."
          value={newBoard}
          onChange={(e) => setNewBoard(e.target.value)}
        />
        <button 
          onClick={createBoard}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create
        </button>
      </div>

      {/* Boards Grid */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {boards.map((b) => (
            <a
              key={b._id}
              href={`/boards/${b._id}`}
              className="bg-white p-4 rounded shadow hover:shadow-lg border"
            >
              <h3 className="text-lg font-semibold">{b.title}</h3>
              <p className="text-gray-500">{b.description}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
