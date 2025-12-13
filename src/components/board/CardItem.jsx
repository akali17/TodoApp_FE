import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import axiosClient from "../../api/axiosClient";
import CardModal from "./CardModal";

export default function CardItem({ card, index }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(card.isDone);

  // =========================
  // TOGGLE DONE (NO MODAL)
  // =========================
  const toggleDone = async (e) => {
    e.stopPropagation(); // ❗ rất quan trọng (không mở modal)

    const newDone = !done;
    setDone(newDone); // optimistic UI

    try {
      await axiosClient.put(`/cards/${card._id}`, {
        isDone: newDone,
      });
    } catch (err) {
      console.error("UPDATE DONE ERROR:", err);
      setDone(!newDone); // rollback nếu lỗi
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
              ${done ? "bg-green-50 opacity-70" : "bg-white hover:bg-gray-50"}
            `}
          >
            {/* HEADER: DONE CHECKBOX + TITLE */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={done}
                onClick={toggleDone}
                onChange={() => {}}
                className="mt-1"
              />

              <h3
                className={`font-medium ${
                  done ? "line-through text-gray-500" : ""
                }`}
              >
                {card.title}
              </h3>
            </div>

            {/* DEADLINE */}
            {card.deadline && (
              <p className="text-xs text-gray-500 mt-1 ml-6">
                📅 {new Date(card.deadline).toLocaleDateString()}
              </p>
            )}

            {/* MEMBERS */}
            {card.members?.length > 0 && (
              <div className="flex mt-2 ml-6">
                {card.members.slice(0, 3).map((m) => (
                  <img
                    key={m._id}
                    src={
                      m.avatar ||
                      `https://ui-avatars.com/api/?name=${m.username}`
                    }
                    className="w-6 h-6 rounded-full border -ml-1"
                    title={m.username}
                  />
                ))}

                {card.members.length > 3 && (
                  <span className="text-xs text-gray-600 ml-1">
                    +{card.members.length - 3}
                  </span>
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
