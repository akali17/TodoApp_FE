import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import CardModal from "./CardModal";

export default function CardItem({ card, index }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Draggable draggableId={card._id} index={index}>
        {(provided) => (
          <div
            onClick={() => setOpen(true)}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className="bg-white shadow rounded p-3 cursor-pointer hover:bg-gray-50 border"
          >
            {/* TITLE */}
            <h3 className="font-medium">{card.title}</h3>

            {/* DEADLINE */}
            {card.deadline && (
              <p className="text-xs text-gray-500 mt-1">
                Deadline: {new Date(card.deadline).toLocaleDateString()}
              </p>
            )}

            {/* MEMBERS */}
            {card.members?.length > 0 && (
              <div className="flex mt-2">
                {card.members.slice(0, 3).map((m) => (
                  <img
                    key={m._id}
                    src={m.avatar || "https://ui-avatars.com/api/?name=" + m.username}
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

      {open && <CardModal cardId={card._id} onClose={() => setOpen(false)} />}
    </>
  );
}
