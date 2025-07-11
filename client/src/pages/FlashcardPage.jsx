import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import FlashcardColumn from "@/components/FlashcardColumn";
import { Button } from "@/components/ui/button";
import { getLevelNumber } from "@/lib/utils";

// Modernes lila Farbschema und Glassmorphism-Styles wie auf der HomePage
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

  useEffect(() => {
    fetch("http://localhost:5000/api/flashcards")
      .then((res) => res.json())
      .then((data) => setFlashcards(data))
      .catch((err) => console.error("Error fetching flashcards:", err));
  }, []);

  // Sortierlogik
  const sortCards = (cards) => {
    switch (sortOption) {
      case "Neueste":
        return [...cards].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "Älteste":
        return [...cards].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
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
    filtered = filtered.filter((card) =>
      card.prompt.toLowerCase().includes(searchTerm.toLowerCase())
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
        {/* Top Controls */}
        <section
          className={`flex flex-wrap gap-6 items-center justify-between mb-2 p-8 transition-all duration-300`}
        >
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search your flashcards..."
            className="w-72 text-base font-medium"
          />

          <div className="flex items-center gap-6 flex-wrap">
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
            {/* Filter Dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-full px-5 py-2 border-fuchsia-700 text-fuchsia-300 bg-zinc-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-700"
            >
              <option value="Alle">Alle</option>
              <option value="Backlog">Backlog</option>
              <option value="Repeat">Repeat</option>
              <option value="InProgress">InProgress</option>
              <option value="Done">Done</option>
            </select>
            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-full px-5 py-2 border-fuchsia-700 text-fuchsia-300 bg-zinc-900 font-semibold shadow focus:outline-none focus:ring-2 focus:ring-fuchsia-700"
            >
              <option value="Neueste">Neueste zuerst</option>
              <option value="Älteste">Älteste zuerst</option>
              <option value="Hints">Hints genutzt</option>
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
