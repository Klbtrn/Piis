import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FlashcardColumn from "@/components/FlashcardColumn";
import { getLevelNumber } from "@/lib/utils";
import SpacedRepetitionSystem from "@/lib/SpacedRepetitionSystem";

const glassBg =
  "bg-white/10 backdrop-blur-md shadow-2xl border border-purple-400/30";
const cardBg =
  "bg-gradient-to-br from-purple-900/80 via-purple-800/80 to-zinc-900/80";
const accent = "from-purple-600 via-fuchsia-500 to-purple-400";
const borderAccent = "border border-purple-500/40";

function Input({ value, onChange, placeholder, className }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`bg-zinc-900 text-white px-4 py-2 rounded-full border border-purple-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 ${className}`}
    />
  );
}

export default function FlashcardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Alle");
  const [sortOption, setSortOption] = useState("Neueste");
  const [spacedRepStats, setSpacedRepStats] = useState(null);
  const [reviewsMovedToday, setReviewsMovedToday] = useState(0);


   useEffect(() => {
    const fetchAndCheckCards = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/flashcards");
        const data = await response.json();
        setFlashcards(data);
        
        // Check for cards due for review and move them
        const movedCards = await SpacedRepetitionSystem.moveCardsToReview(data);
        if (movedCards > 0) {
          setReviewsMovedToday(movedCards);
          console.log(`${movedCards} cards moved to review`);
          
          // Refresh flashcards after moving
          const refreshResponse = await fetch("http://localhost:5000/api/flashcards");
          const refreshedData = await refreshResponse.json();
          setFlashcards(refreshedData);
        }
        
        // Calculate spaced repetition stats
        const stats = SpacedRepetitionSystem.getSpacedRepetitionStats(data);
        setSpacedRepStats(stats);
        
      } catch (err) {
        console.error("Error fetching flashcards:", err);
      }
    };
    
    fetchAndCheckCards();
  }, []);

  // Sortierlogik
  const sortCards = (cards) => {
    switch (sortOption) {
      case "Neueste":
        return [...cards].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "Älteste":
        return [...cards].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "Hints":
        return [...cards].sort(
          (a, b) => (b.hintsUsed ?? 0) - (a.hintsUsed ?? 0)
        );
      default:
        return cards;
    }
  };

  // Filterlogik
  const filterByStatus = (status) => {
    let filtered = flashcards.filter((card) => card.status === status);
    filtered = filtered.filter(
      (card) =>
        (card.prompt || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (card.task_name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (card.task || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortCards(filtered);
  };

  // Level- und Fortschrittsberechnung
  const doneCount = flashcards.filter((c) => c.status === "Done").length;
  const level = getLevelNumber(doneCount);
  let sum = 0,
    needed = 1;
  for (let i = 0; i < level; i++) {
    sum += needed;
    needed *= 2;
  }
  const progressInLevel = doneCount - sum;
  const neededForNext = needed;

  // Spalten für die Anzeige
  const columns = [
    { title: "Backlog", status: "Backlog" },
    { title: "Repeat", status: "Repeat" },
    { title: "InProgress", status: "InProgress" },
    { title: "Done", status: "Done" },
  ];

   return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#18181b] via-[#232136] to-zinc-900 text-white relative overflow-x-hidden">
      <Navbar />
      <main className="p-8 pt-4 flex flex-col gap-8 max-w-[1800px] mx-auto items-stretch">
        
        {/* Show notification if cards were moved to review */}
        {reviewsMovedToday > 0 && (
          <div className="bg-gradient-to-r from-fuchsia-900/80 to-purple-900/80 p-4 rounded-2xl border border-fuchsia-500/40 mb-4">
            <p className="text-fuchsia-200 font-semibold">
              📅 {reviewsMovedToday} cards moved to review today! Time to practice what you've learned.
            </p>
          </div>
        )}

        <section className="flex flex-wrap gap-6 items-center justify-between mb-2 p-8 transition-all duration-300">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search your flashcards..."
            className="w-72 text-base font-medium"
          />

          <div className="flex items-center gap-6 flex-wrap">
            {/* Level Progress */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-purple-900/80 via-purple-800/80 to-zinc-900/80 px-5 py-2 rounded-full shadow border border-purple-700/40">
              <span className="text-fuchsia-300 font-bold text-lg">
                LEVEL {level}
              </span>
              <div className="w-32 h-3 bg-purple-900 rounded-full overflow-hidden border border-purple-700/30">
                <div
                  className="h-full bg-gradient-to-r from-fuchsia-400 to-purple-400 transition-all"
                  style={{
                    width: `${
                      Math.max(
                        0,
                        Math.min(
                          1,
                          neededForNext ? progressInLevel / neededForNext : 0
                        )
                      ) * 100
                    }%`,
                  }}
                />
              </div>
              <span className="text-white text-xs font-semibold">
                {progressInLevel}/{neededForNext}
              </span>
            </div>
            
            {/* Spaced Repetition Stats */}
            {spacedRepStats && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-green-900/80 via-emerald-800/80 to-zinc-900/80 px-5 py-2 rounded-full shadow border border-green-700/40">
                <span className="text-green-300 font-bold text-sm">
                  📅 {spacedRepStats.cardsForReviewToday}
                </span>
                <span className="text-white text-xs">
                  due today
                </span>
                <span className="text-green-200 text-xs">
                  • {spacedRepStats.upcomingThisWeek} this week
                </span>
              </div>
            )}
            
            {/* Performance Indicator */}
            {spacedRepStats && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-900/80 via-cyan-800/80 to-zinc-900/80 px-5 py-2 rounded-full shadow border border-blue-700/40">
                <span className="text-blue-300 font-bold text-sm">
                  📈 {spacedRepStats.averagePerformance}
                </span>
                <span className="text-white text-xs">
                  avg performance
                </span>
              </div>
            )}

            {/* Filter and Sort Dropdowns */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-full px-5 py-2 border-fuchsia-700 text-fuchsia-300 bg-zinc-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-700"
            >
              <option value="Alle">All</option>
              <option value="Backlog">Backlog</option>
              <option value="Repeat">Repeat</option>
              <option value="InProgress">InProgress</option>
              <option value="Done">Done</option>
            </select>
            
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-full px-5 py-2 border-fuchsia-700 text-fuchsia-300 bg-zinc-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-700"
            >
              <option value="Review">Review Date</option>
              <option value="Neueste">Newest</option>
              <option value="Älteste">Oldest</option>
              <option value="Hints">Hints used</option>
            </select>
          </div>
        </section>

        {/* Flashcard Columns */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((col) => (
            <div
              key={col.status}
              className={
                filterStatus === "Alle" || filterStatus === col.status
                  ? "scale-[1.03] shadow-2xl z-10"
                  : "opacity-40 grayscale"
              }
            >
              <FlashcardColumn
                title={col.title}
                cards={filterByStatus(col.status)}
              />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
