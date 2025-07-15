import FlashcardCard from "./FlashcardCard";

export default function FlashcardColumn({ title, cards }) {
  // Modernes Farbschema und Glassmorphism wie HomePage
  const statusColorMap = {
    Backlog:
      "border-blue-500 bg-gradient-to-br from-blue-900/80 via-blue-800/80 to-zinc-900/80",
    Repeat:
      "border-red-500 bg-gradient-to-br from-red-900/80 via-red-800/80 to-zinc-900/80",
    InProgress:
      "border-yellow-400 bg-gradient-to-br from-yellow-900/80 via-yellow-800/80 to-zinc-900/80",
    Done: "border-green-500 bg-gradient-to-br from-green-900/80 via-green-800/80 to-zinc-900/80",
  };
  const normalizedTitle = title?.split(" ")[0];
  // Korrigiere "InProgress" statt "In"
  const colorKey = normalizedTitle === "In" ? "InProgress" : normalizedTitle;
  const styleClass =
    statusColorMap[colorKey] ||
    "border-purple-500 bg-gradient-to-br from-purple-900/80 via-purple-800/80 to-zinc-900/80";

  return (
    <div
      className={`rounded-3xl border-2 p-6 flex flex-col gap-4 shadow-2xl ${styleClass} transition-all duration-300`}
    >
      <h2 className="text-xl font-bold text-fuchsia-200 mb-2 tracking-tight drop-shadow">
        {title}
      </h2>
      {cards.length === 0 ? (
        <p className="text-base text-zinc-400 italic">No cards yet</p>
      ) : (
        cards.map((card, index) => {
          const key = card._id || `${normalizedTitle}-${index}`;
          return (
            <FlashcardCard
              key={key}
              {...card} 
              prompt={card.task_name} // Title
              task_name={""} // Description
              color={styleClass.split(" ")[0]}
            />
          );
        })
      )}
    </div>
  );
}
