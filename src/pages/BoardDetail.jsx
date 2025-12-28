import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { getSocket, waitForSocket } from "../socket";
import { showToast } from "../utils/toast";

import { useBoardStore } from "../store/useBoardStore";
import { useAuthStore } from "../store/useAuthStore";
import ColumnItem from "../components/board/ColumnItem";
import AddColumn from "../components/board/AddColumn";
import ActivityPanel from "../components/board/ActivityPanel";
import BoardMembers from "../components/board/BoardMembers";
import PageContainer from "../components/common/PageContainer";

export default function BoardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    board,
    columns,
    cards,
    activity,
    loading,
    getFullBoard,
    reorderColumns,
    moveCard,
    reorderCardsInColumn,
    updateBoardTitle,
  } = useBoardStore();

  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");

 useEffect(() => {
  getFullBoard(id);

  // Wait for socket to be initialized
  const setupSocket = async () => {
    const socket = await waitForSocket(5000);
    
    if (!socket) {
      console.error("❌ Socket not initialized after 5s timeout!");
      return;
    }

    console.log("✅ Socket ready - Joining board room:", `board:${id}`);
    socket.emit("join-board", `board:${id}`);
    
    // Initialize socket listeners
    useBoardStore.getState().initBoardSocket(socket);

    // Listen for being removed from board
    const handleMemberRemoved = ({ userId, boardId }) => {
      if (user && String(userId) === String(user._id)) {
        // Current user was removed
        const boardTitle = board?.title || 'this board';
        showToast(`You have been removed from board "${boardTitle}"`, 'warning', 5000);
        setTimeout(() => {
          navigate("/boards");
        }, 1000);
      }
    };

    socket.on("member:removed", handleMemberRemoved);

    return () => {
      socket.off("member:removed", handleMemberRemoved);
    };
  };

  setupSocket();

  return () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      console.log("🔌 Leaving board room:", `board:${id}`);
      socket.emit("leave-board", `board:${id}`);
    }
  };
}, [id, getFullBoard, user, board?.title, navigate]);


  if (loading || !board) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  const saveTitle = async () => {
    if (!title.trim() || title === board.title) {
      setTitle(board.title);
      setEditingTitle(false);
      return;
    }

    await updateBoardTitle(board._id, title);
    setEditingTitle(false);
  };

  const handleDragEnd = (result) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;

    console.log("🔄 DRAG END:", { type, source: source.index, destination: destination.index, draggableId });

    if (type === "column" && source.index !== destination.index) {
      const newCols = Array.from(columns);
      const [moved] = newCols.splice(source.index, 1);
      newCols.splice(destination.index, 0, moved);
      console.log("📤 Reordering columns...", newCols.map(c => c._id));
      reorderColumns(board._id, newCols);
    }

    if (type === "card") {
      // Check if it's moved to a different column or just reordered within same column
      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        console.log("✅ No change in card position");
        return;
      }

      if (source.droppableId === destination.droppableId) {
        // Reorder within same column
        console.log("📤 Reordering card in column...", { columnId: destination.droppableId, cardId: draggableId });
        const columnCards = cards.filter(c => String(c.column) === destination.droppableId).sort((a, b) => a.order - b.order);
        const movedCard = columnCards[source.index];
        
        // Move the card in array
        const newCards = [...columnCards];
        newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, movedCard);
        
        const orderedIds = newCards.map(c => c._id);
        reorderCardsInColumn(destination.droppableId, orderedIds);
      } else {
        // Move to different column
        console.log("📤 Moving card to different column...", { cardId: draggableId, toColumn: destination.droppableId, newOrder: destination.index });
        moveCard({
          cardId: draggableId,
          toColumn: destination.droppableId,
          newOrder: destination.index
        });
      }
    }
  };
  

  return (
    <PageContainer title="">
      {/* BOARD HEADER */}
      <header className="bg-white rounded-xl shadow-sm border p-4 mb-4 flex items-center justify-between">
        {!editingTitle ? (
          <h1
            className="text-xl font-semibold cursor-pointer hover:bg-gray-100 px-2 rounded"
            onClick={() => setEditingTitle(true)}
          >
            {board.title}
          </h1>
        ) : (
          <input
            autoFocus
            className="border-2 px-3 py-2 rounded-lg text-xl focus:outline-none focus:border-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") {
                setEditingTitle(false);
                setTitle(board.title);
              }
            }}
          />
        )}

        <BoardMembers board={board} />
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden gap-4">
        {/* COLUMNS AREA WITH SCROLL */}
        <div className="flex-1 overflow-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="board-columns" direction="horizontal" type="column">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-6 p-2 md:p-4 h-full"
                >
                  {columns.map((col, index) => (
                    <ColumnItem
                      key={col._id}
                      column={col}
                      index={index}
                      cards={cards
                        .filter((c) => c.column === col._id)
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                      }
                    />
                  ))}

                  {provided.placeholder}
                  <AddColumn boardId={board._id} />
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* ACTIVITY PANEL - FIXED */}
        <div className="flex-shrink-0 flex">
          <ActivityPanel activity={activity} />
        </div>
      </div>
    </PageContainer>
  );
}
