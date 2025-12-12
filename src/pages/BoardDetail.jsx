import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { DragDropContext, Droppable } from "@hello-pangea/dnd";

import { useBoardStore } from "../store/useBoardStore";
import ColumnItem from "../components/board/ColumnItem";
import AddColumn from "../components/board/AddColumn";
import CardModal from "../components/board/CardModal";
import BoardMembers from "../components/board/BoardMembers";

export default function BoardDetail() {
  const { id } = useParams();

  const {
    board,
    columns,
    cards,
    loading,
    getFullBoard,
    reorderColumns,
    moveCard,
  } = useBoardStore();

  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    getFullBoard(id);
  }, [id]);

  if (loading || !board)
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );

  // ===========================================
  // HANDLE DRAG END
  // ===========================================
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;

    // ===== MOVE COLUMN =====
    if (type === "column") {
      if (source.index === destination.index) return;

      const newOrder = Array.from(columns);
      const [removed] = newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, removed);

      reorderColumns(board._id, newOrder);
      return;
    }

    // ===== MOVE CARD =====
    if (type === "card") {
      await moveCard({
        cardId: draggableId,
        fromColumn: source.droppableId,
        toColumn: destination.droppableId,
        newPosition: destination.index,
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* ====================== HEADER ====================== */}
      <header className="p-4 bg-white shadow flex justify-between items-center">

        {/* BOARD TITLE */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{board.title}</h1>

          {/* Owner avatar */}
          <img
            src={board.owner?.avatar || "/default-avatar.png"}
            className="w-9 h-9 rounded-full border"
          />
        </div>

        {/* ================= BOARD MEMBERS UI ================= */}
        <BoardMembers board={board} />
      </header>

      {/* ====================== CONTENT ====================== */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="board-columns"
          direction="horizontal"
          type="column"
        >
          {(provided) => (
            <div
              className="flex gap-4 p-4 overflow-x-auto"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {columns.map((col, index) => (
                <ColumnItem
                  key={col._id}
                  column={col}
                  index={index}
                  cards={cards.filter((c) => c.column === col._id)}
                  onCardClick={setSelectedCard}
                />
              ))}

              {provided.placeholder}

              <AddColumn boardId={board._id} />
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* ====================== CARD MODAL ====================== */}
      {selectedCard && (
        <CardModal
          cardId={selectedCard._id}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
