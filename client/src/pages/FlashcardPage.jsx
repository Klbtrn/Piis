import Navbar from "@/components/Navbar";
import FlashcardColumn from "@/components/FlashcardColumn";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function Input({ value, onChange, placeholder, className }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`bg-zinc-900 text-white px-4 py-2 rounded-full border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
    />
  );
}

export default function FlashcardPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const flashcards = {
    backlog: [
      {
        _id: "fc1",
        prompt: "Indentation",
        language: "python",
        hintCount: 0,
        hintsUsed: 0,
      },
    ],
    repeat: [
      {
        _id: "fc2",
        prompt: "Merge Sort",
        language: "javascript",
        hintCount: 2,
        hintsUsed: 1,
      },
    ],
    inProgress: [
      {
        _id: "fc3",
        prompt: "Null Pointer Exception",
        language: "c",
        hintCount: 2,
        hintsUsed: 2,
      },
    ],
    done: [
      {
        _id: "fc4",
        prompt: "Type Mismatch",
        language: "haskell",
        hintCount: 0,
        hintsUsed: 2,
      },
      {
        _id: "fc5",
        prompt: "Gradient Descent",
        language: "python",
        hintCount: 0,
        hintsUsed: 2,
      },
    ],
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-900 text-white">
      <Navbar />

      <div className="p-6 flex flex-col gap-6">
        {/* Top Controls */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Search"
            className="w-72 rounded-full bg-white text-black px-4"
          />

          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 bg-zinc-800 border border-purple-600 px-4 py-1 rounded-full text-sm">
              <span className="text-purple-400 font-semibold">LEVEL 7</span>
              <div className="w-24 h-2 bg-purple-900 rounded-full overflow-hidden">
                <div className="w-10/12 h-full bg-purple-400" />
              </div>
              <span className="text-white text-xs">10/12</span>
            </div>
            <Button
              variant="outline"
              className="rounded-full px-4 py-1 border-purple-600 text-purple-300 hover:bg-purple-900/40"
            >
              🔍 Filter
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-4 py-1 border-purple-600 text-purple-300 hover:bg-purple-900/40"
            >
              ↕ Sort
            </Button>
          </div>
        </div>

        {/* Flashcard Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FlashcardColumn
            title="Backlog (History)"
            cards={flashcards.backlog}
          />
          <FlashcardColumn title="Repeat" cards={flashcards.repeat} />
          <FlashcardColumn title="In Progress" cards={flashcards.inProgress} />
          <FlashcardColumn title="Done" cards={flashcards.done} />
        </div>
      </div>
    </div>
  );
}
