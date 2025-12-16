import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { useBoardStore } from "../../store/useBoardStore";
import CardModal from "./CardModal";

export default function CardItem({ card, index }) {
  const [open, setOpen] = useState(false);
  const updateCard = useBoardStore((s) => s.updateCard);

  // =========================
  // TOGGLE DONE (NO MODAL)
  // =========================
  const toggleDone = async (e) => {
    e.stopPropagation(); // ❗ rất quan trọng (không mở modal)

    const newDone = !card.isDone;
    
    try {
      await updateCard(card._id, {
        isDone: newDone,
      });
      console.log("✅ Card done toggled:", newDone);
    } catch (err) {
      console.error("UPDATE DONE ERROR:", err);
    }
  };

  return (
    <>
      <Draggable draggableId={card._id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setOpen(true)}
            className={`rounded p-3 border shadow cursor-pointer transition
              ${card.isDone ? "bg-green-50 opacity-70" : "bg-white hover:bg-gray-50"}
            `}
          >
            {/* HEADER: DONE CHECKBOX + TITLE */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={card.isDone}
                onClick={toggleDone}
                onChange={() => {}}
                className="mt-1"
              />

              <h3
                className={`font-medium ${
                  card.isDone ? "line-through text-gray-500" : ""
                }`}
              >
                {card.title}
              </h3>
            </div>

            {/* DEADLINE */}
            {card.deadline && (
              <p className="text-xs text-gray-500 mt-2 ml-6">
                📅 {new Date(card.deadline).toLocaleDateString()}
              </p>
            )}

            {/* MEMBERS */}
            {card.members?.length > 0 && (
              <div className="flex items-center gap-1 mt-2 ml-6">
                {card.members.slice(0, 3).map((m, idx) => (
                  <img
                    key={m._id}
                    src={
                      m.avatar ||
                      `https://ui-avatars.com/api/?name=${m.username}`
                    }
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
                    title={m.username}
                  />
                ))}

                {card.members.length > 3 && (
                  <div 
                    className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600"
                    style={{ marginLeft: '-8px' }}
                    title={card.members.slice(3).map(m => m.username).join(', ')}
                  >
                    +{card.members.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Draggable>

      {/* CARD MODAL */}
      {open && (
        <CardModal cardId={card._id} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
