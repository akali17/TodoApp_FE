import AddCard from "./AddCard";
import CardItem from "./CardItem";

export default function Column({ column }) {
  return (
    <div className="bg-white w-64 rounded shadow p-3 flex flex-col">
      <h2 className="font-semibold mb-3">{column.title}</h2>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {column.cards?.length > 0 ? (
          column.cards.map((card) => (
            <CardItem key={card._id} card={card} />
          ))
        ) : (
          <p className="text-gray-400 text-sm">No cards</p>
        )}
      </div>

      <AddCard columnId={column._id} />
    </div>
  );
}
