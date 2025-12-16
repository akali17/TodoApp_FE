import { useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { useBoardStore } from "../../store/useBoardStore";
import CardItem from "./CardItem";
import AddCard from "./AddCard";
import axiosClient from "../../api/axiosClient";

export default function ColumnItem({ column, cards, index }) {
  const { updateColumn } = useBoardStore();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

  const saveTitle = async () => {
    if (!title.trim() || title === column.title) {
      setTitle(column.title);
      setEditing(false);
      return;
    }

    await updateColumn(column._id, title);
    setEditing(false);
  };

  const deleteColumn = async () => {
    if (!confirm(`Delete column "${column.title}"?`)) return;
    try {
      await axiosClient.delete(`/columns/${column._id}`);
      // Socket event "column:deleted" will handle removal
    } catch (err) {
      console.error("DELETE COLUMN ERROR:", err);
    }
  };

  return (
    <Draggable draggableId={column._id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="bg-white w-64 rounded-xl shadow-sm border p-3 flex flex-col min-h-[calc(100vh-200px)] h-fit flex-shrink-0"
        >
          {/* ===== COLUMN HEADER ===== */}
          <div
            {...provided.dragHandleProps}
            className="mb-3 font-semibold cursor-grab flex items-center justify-between flex-shrink-0"
          >
            {!editing ? (
              <div className="flex-1">
                <div
                  onClick={() => setEditing(true)}
                  className="hover:bg-gray-100 px-1 rounded cursor-pointer"
                >
                  {column.title}
                </div>
              </div>
            ) : (
              <input
                autoFocus
                className="border px-1 rounded flex-1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") {
                    setEditing(false);
                    setTitle(column.title);
                  }
                }}
              />
            )}
            <button
              onClick={deleteColumn}
              className="text-red-500 hover:text-red-700 text-sm ml-2"
              title="Delete column"
            >
              ✕
            </button>
          </div>

          {/* ===== CARDS ===== */}
          <Droppable droppableId={column._id} type="card">
            {(dropProvided) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className="flex flex-col gap-2 min-h-[40px] mb-2"
              >
                {cards.map((card, idx) => (
                  <CardItem key={card._id} card={card} index={idx} />
                ))}
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="flex-shrink-0">
            <AddCard columnId={column._id} />
          </div>
        </div>
      )}
    </Draggable>
  );
}
