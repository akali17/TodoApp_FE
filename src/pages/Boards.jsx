import { useEffect, useState } from "react";
import { getMyBoards, createBoardApi } from "../api/board";
import { useAuthStore } from "../store/useAuthStore";
import PageContainer from "../components/common/PageContainer";
import BoardModal from "../components/common/BoardModal";

export default function Boards() {
  const { token } = useAuthStore();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBoard, setNewBoard] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [editingBoard, setEditingBoard] = useState(null);

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

    const res = await createBoardApi(newBoard, newBoardDesc, token);
    setBoards([...boards, res.data.board]);
    setNewBoard("");
    setNewBoardDesc("");
  };

  return (
    <PageContainer title="Your Boards">

        {/* Create Board Input */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 max-w-lg">
            <input
              className="border-2 rounded-xl p-3 w-full focus:outline-none focus:border-blue-500 bg-white shadow-sm mb-2"
              placeholder="New board title..."
              value={newBoard}
              onChange={(e) => setNewBoard(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && createBoard()}
            />
            <textarea
              className="border-2 rounded-xl p-3 w-full focus:outline-none focus:border-blue-500 bg-white shadow-sm"
              placeholder="Board description (optional)..."
              value={newBoardDesc}
              onChange={(e) => setNewBoardDesc(e.target.value)}
              rows={2}
            />
          </div>
          <button 
            onClick={createBoard}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition font-semibold shadow h-fit"
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
              <div key={b._id}>
                <a
                  href={`/boards/${b._id}`}
                  className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-lg transition border border-gray-200 hover:border-blue-300 group block"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-700">{b.title}</h3>
                  <p className="text-gray-600 text-sm">{b.description || "No description"}</p>
                </a>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingBoard(b);
                  }}
                  className="mt-2 w-full text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                >
                  ✏️ Edit
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* EDIT BOARD MODAL */}
        {editingBoard && (
          <BoardModal
            board={editingBoard}
            onClose={() => setEditingBoard(null)}
            onUpdate={(updatedBoard) => {
              setBoards(boards.map(b => b._id === updatedBoard._id ? updatedBoard : b));
            }}
            onDeleted={(deletedId) => {
              setBoards(boards.filter(b => b._id !== deletedId));
            }}
            onLeft={(leftId) => {
              setBoards(boards.filter(b => b._id !== leftId));
            }}
          />
        )}
    </PageContainer>
  );
}
