import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";

import { useBoardStore } from "../store/useBoardStore";
import ColumnItem from "../components/board/ColumnItem";
import AddColumn from "../components/board/AddColumn";
import CardModal from "../components/board/CardModal";
import BoardMembers from "../components/board/BoardMembers";
import ActivityPanel from "../components/board/ActivityPanel";

export default function BoardDetail() {
  const { id } = useParams();
  const {
    board,
    columns,
    cards,
    loading,
    getFullBoard,
    reorderColumns,
    moveCard
  } = useBoardStore();

  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    getFullBoard(id);
  }, [id]);

  if (loading || !board) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const handleDragEnd = async ({ source, destination, draggableId, type }) => {
    if (!destination) return;

    if (type === "column") {
      const newCols = Array.from(columns);
      const [removed] = newCols.splice(source.index, 1);
      newCols.splice(destination.index, 0, removed);
      reorderColumns(board._id, newCols);
      return;
    }

    if (type === "card") {
      await moveCard({
        cardId: draggableId,
        fromColumn: source.droppableId,
        toColumn: destination.droppableId,
        newPosition: destination.index
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* HEADER */}
      <header className="p-4 bg-white shadow flex justify-between items-center">
        <h1 className="text-xl font-semibold">{board.title}</h1>
        <BoardMembers board={board} />
      </header>

      {/* CONTENT */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable
          droppableId="columns"
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
                  cards={cards.filter(c => c.column === col._id)}
                  onCardClick={setSelectedCard}
                />
              ))}
              {provided.placeholder}
              <AddColumn boardId={board._id} />
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* ACTIVITY */}
      <ActivityPanel boardId={board._id} />

      {selectedCard && (
        <CardModal
          cardId={selectedCard._id}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
