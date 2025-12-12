import { Draggable, Droppable } from "@hello-pangea/dnd";
import CardItem from "./CardItem";
import AddCard from "./AddCard";

export default function ColumnItem({ column, cards, index }) {
  return (
    <Draggable draggableId={column._id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="bg-white w-72 rounded shadow p-3 flex flex-col"
        >
          {/* ===== COLUMN HEADER (draggable) ===== */}
          <div
            {...provided.dragHandleProps}
            className="font-semibold mb-3 cursor-grab active:cursor-grabbing"
          >
            {column.title}
          </div>

          {/* ===== DROPPABLE LIST FOR CARDS ===== */}
          <Droppable droppableId={column._id} type="card">
            {(dropProvided) => (
              <div
                {...dropProvided.droppableProps}
                ref={dropProvided.innerRef}
                className="flex flex-col gap-2 min-h-[40px]"
              >
                {cards.map((card, cardIndex) => (
                  <CardItem key={card._id} card={card} index={cardIndex} />
                ))}

                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>

          {/* ===== ADD CARD BUTTON ===== */}
          <AddCard columnId={column._id} />
        </div>
      )}
    </Draggable>
  );
}
