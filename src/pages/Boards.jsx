import { useEffect, useState } from "react";
import { getMyBoards, createBoardApi } from "../api/board";
import { useAuthStore } from "../store/useAuthStore";
import PageContainer from "../components/common/PageContainer";

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
    <PageContainer title="Your Boards">

        {/* Create Board Input */}
        <div className="flex gap-2 mb-6">
          <input
            className="border-2 rounded-xl p-3 flex-1 max-w-lg focus:outline-none focus:border-blue-500 bg-white shadow-sm"
            placeholder="New board title..."
            value={newBoard}
            onChange={(e) => setNewBoard(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && createBoard()}
          />
          <button 
            onClick={createBoard}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow"
          >
            + Create
          </button>
        </div>

        {/* Boards Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading boards...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No boards yet. Create your first board!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((b) => (
              <a
                key={b._id}
                href={`/boards/${b._id}`}
                className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-200 hover:border-blue-300 group"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700">{b.title}</h3>
                <p className="text-gray-600 text-sm">{b.description || "No description"}</p>
              </a>
            ))}
          </div>
        )}
    </PageContainer>
  );
}
