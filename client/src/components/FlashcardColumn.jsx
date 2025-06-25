import FlashcardCard from "./FlashcardCard";

export default function FlashcardColumn({ title, cards }) {
  const statusColorMap = {
    Backlog: "border-blue-500",
    Repeat: "border-red-500",
    In: "border-yellow-400", // für "In Progress"
    Done: "border-green-500",
  };

  // z. B. "Backlog (History)" → "Backlog"
  const normalizedTitle = title?.split(" ")[0];
  const borderColor = statusColorMap[normalizedTitle] || "border-purple-500";

  return (
    <div
      className={`rounded-xl border-2 p-4 flex flex-col gap-4 ${borderColor}`}
    >
      <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
      {cards.length === 0 ? (
        <p className="text-sm text-zinc-400 italic">No cards yet</p>
      ) : (
        cards.map((card, index) => {
          const key = card._id || `${normalizedTitle}-${index}`;
          return <FlashcardCard key={key} {...card} color={borderColor} />;
        })
      )}
    </div>
  );
}
