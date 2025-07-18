import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getLevelNumber } from "@/lib/utils";
import SpacedRepetitionSystem from "@/lib/SpacedRepetitionSystem";

// Style-Variablen wie in HomePage und FlashcardPage
const glassBg =
  "bg-white/10 backdrop-blur-md shadow-2xl border border-purple-400/30";
const cardBg =
  "bg-gradient-to-br from-purple-900/80 via-purple-800/80 to-zinc-900/80";
const accent = "from-purple-600 via-fuchsia-500 to-purple-400";
const borderAccent = "border border-purple-500/40";

const STATUS = ["Backlog", "Repeat", "InProgress", "Done"];
const STATUS_LABELS = {
  Backlog: "Backlog",
  Repeat: "Repeat",
  InProgress: "In Progress",
  Done: "Done",
};
const STATUS_COLORS = {
  Backlog: "bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 text-white",
  Repeat: "bg-gradient-to-r from-fuchsia-700 via-red-500 to-red-400 text-white",
  InProgress:
    "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black",
  Done: "bg-gradient-to-r from-green-700 via-green-500 to-green-400 text-white",
};

export default function StatisticsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/flashcards")
      .then((res) => res.json())
      .then((data) => {
        setFlashcards(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const total = flashcards.length;
  const perStatus = {
    Backlog: flashcards.filter((c) => c.status === "Backlog").length,
    InProgress: flashcards.filter((c) => c.status === "InProgress").length,
    Repeat: flashcards.filter((c) => c.status === "Repeat").length,
    Done: flashcards.filter((c) => c.status === "Done").length,
  };
  const donePercent = total ? Math.round((perStatus.Done / total) * 100) : 0;
  const level = getLevelNumber(perStatus.Done);
  const doneCards = flashcards.filter((c) => c.status === "Done");
  const avgHintsDone = doneCards.length
    ? (
        doneCards.reduce((sum, c) => sum + (c.hintsUsed || 0), 0) /
        doneCards.length
      ).toFixed(2)
    : "0.00";
  const spacedRepStats =
    flashcards.length > 0
      ? SpacedRepetitionSystem.getSpacedRepetitionStats(flashcards)
      : null;
  const totalAttempts = flashcards.reduce(
    (sum, c) => sum + (c.attempts || 0),
    0
  );
  const avgAttemptsPerCard = flashcards.length
    ? (totalAttempts / flashcards.length).toFixed(1)
    : "0.0";

  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-br from-[#18181b] via-[#232136] to-zinc-900 text-white relative overflow-x-hidden`}
    >
      <Navbar />
      <main className="p-8 pt-4 flex flex-col gap-8 max-w-[1200px] mx-auto items-stretch">
        <h1 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 drop-shadow-lg flex items-center gap-2">
          Statistics
        </h1>
        {loading ? (
          <div className="text-center text-zinc-400">Loading data...</div>
        ) : (
          <>
            <Card
              className={`${glassBg} ${cardBg} ${borderAccent} mb-4 rounded-2xl shadow-lg hover:shadow-fuchsia-700/30 transition-shadow`}
            >
              <CardHeader>
                <CardTitle className="text-2xl mb-2 text-fuchsia-200 flex items-center gap-2">
                  <span>🚀</span>General Progress
                </CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div>
                      <span className="text-lg font-semibold text-fuchsia-300">
                        {total}
                      </span>
                      <span className="ml-2 text-zinc-400">Total cards</span>
                    </div>
                    {STATUS.map((status) => (
                      <button
                        key={status}
                        className={`ml-2 px-4 py-2 rounded-full shadow ${STATUS_COLORS[status]} transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fuchsia-700 cursor-pointer`}
                        onClick={() => navigate(`/flashcards?status=${status}`)}
                        title={`Zu ${STATUS_LABELS[status]} filtern`}
                      >
                        <span className="mr-1">
                          {status === "Backlog" && "🗂️"}
                          {status === "Repeat" && "🔁"}
                          {status === "InProgress" && "⚡"}
                          {status === "Done" && "✅"}
                        </span>
                        {STATUS_LABELS[status]}: {perStatus[status]}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-zinc-400 w-24">Done ratio</span>
                    <span className="font-semibold text-fuchsia-200">
                      {donePercent}%
                    </span>
                    <div className="flex-1">
                      <Progress
                        value={donePercent}
                        className="bg-purple-900/40 h-3 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-zinc-400 w-24">Level</span>
                    <span className="font-semibold text-lg text-fuchsia-300">
                      {level}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400 w-56">
                      Avg hints/card in Done
                    </span>
                    <span className="font-semibold text-fuchsia-200">
                      {avgHintsDone}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Spaced Repetition Card */}
            {spacedRepStats && (
              <Card className={`${glassBg} ${cardBg} border-fuchsia-700 mb-4`}>
                <CardHeader>
                  <CardTitle className="text-2xl mb-2 text-fuchsia-300 drop-shadow flex items-center gap-2">
                    <span>📅</span>Spaced Repetition
                  </CardTitle>
                  <CardDescription>
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      {/* Today's Reviews */}
                      <div className="bg-gradient-to-r from-green-900/80 to-zinc-900/80 p-4 rounded-xl shadow border border-green-700/40 hover:shadow-green-700/40 transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">📚</span>
                          <span className="text-green-300 font-semibold">
                            Today
                          </span>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-green-400">
                            {spacedRepStats.cardsForReviewToday}
                          </span>
                          <span className="ml-2 text-zinc-400">cards due</span>
                        </div>
                      </div>

                      {/* This Week */}
                      <div className="bg-gradient-to-r from-blue-900/80 to-zinc-900/80 p-4 rounded-xl shadow border border-blue-700/40 hover:shadow-blue-700/40 transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">📊</span>
                          <span className="text-blue-300 font-semibold">
                            This Week
                          </span>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-blue-400">
                            {spacedRepStats.upcomingThisWeek}
                          </span>
                          <span className="ml-2 text-zinc-400">reviews</span>
                        </div>
                      </div>

                      {/* Performance */}
                      <div className="bg-gradient-to-r from-purple-900/80 to-zinc-900/80 p-4 rounded-xl shadow border border-purple-700/40 hover:shadow-purple-700/40 transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🎯</span>
                          <span className="text-purple-300 font-semibold">
                            Performance
                          </span>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-purple-400">
                            {spacedRepStats.averagePerformance}
                          </span>
                          <span className="ml-2 text-zinc-400">average</span>
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div className="bg-gradient-to-r from-fuchsia-900/80 to-zinc-900/80 p-4 rounded-xl shadow border border-fuchsia-700/40 hover:shadow-fuchsia-700/40 transition-shadow">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">⚡</span>
                          <span className="text-fuchsia-300 font-semibold">
                            Difficulty
                          </span>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-fuchsia-400">
                            {spacedRepStats.averageDifficulty}
                          </span>
                          <span className="ml-2 text-zinc-400">factor</span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Metrics */}
                    <div className="space-y-2 border-t border-fuchsia-700/30 pt-4">
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400 w-48">
                          Total Attempts
                        </span>
                        <span className="font-semibold text-fuchsia-300">
                          {totalAttempts}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400 w-48">
                          Avg Attempts per Card
                        </span>
                        <span className="font-semibold text-fuchsia-300">
                          {avgAttemptsPerCard}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400 w-48">
                          Cards in Review System
                        </span>
                        <span className="font-semibold text-fuchsia-300">
                          {spacedRepStats.totalDoneCards}
                        </span>
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
