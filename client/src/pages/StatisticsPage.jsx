import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getLevelNumber } from "@/lib/utils";
import SpacedRepetitionSystem from "@/lib/SpacedRepetitionSystem";

const STATUS = ["Backlog", "Repeat", "InProgress", "Done"];
const STATUS_LABELS = {
  Backlog: "Backlog",
  Repeat: "Repeat",
  InProgress: "In Progress",
  Done: "Done",
};
const STATUS_COLORS = {
  Backlog: "bg-blue-500",
  Repeat: "bg-red-500",
  InProgress: "bg-purple-500",
  Done: "bg-green-500",
};

export default function StatisticsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

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
  const avgHintsDone = doneCards.length ? (doneCards.reduce((sum, c) => sum + (c.hintsUsed || 0), 0) / doneCards.length).toFixed(2) : "0.00";
  const spacedRepStats = flashcards.length > 0 ? SpacedRepetitionSystem.getSpacedRepetitionStats(flashcards) : null;
  const totalAttempts = flashcards.reduce((sum, c) => sum + (c.attempts || 0), 0);
  const avgAttemptsPerCard = flashcards.length ? (totalAttempts / flashcards.length).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 flex flex-col gap-8">
        <h1 className="text-3xl font-bold mb-2">Statistiken</h1>
        {loading ? (
          <div className="text-center text-zinc-400">Lade Daten...</div>
        ) : (
          <>
            <Card className="bg-zinc-950 border-purple-700">
              <CardHeader>
                <CardTitle className="text-2xl mb-2">Allgemeiner Fortschritt</CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div>
                      <span className="text-lg font-semibold">{total}</span>
                      <span className="ml-2 text-zinc-400">Karten insgesamt</span>
                    </div>
                    {STATUS.map((status) => (
                      <Badge key={status} className={`ml-2 ${STATUS_COLORS[status]}`}>
                        {STATUS_LABELS[status]}: {perStatus[status]}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-zinc-400 w-24">Done-Anteil</span>
                    <span className="font-semibold">{donePercent}%</span>
                    <div className="flex-1">
                      <Progress value={donePercent} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-zinc-400 w-24">Level</span>
                    <span className="font-semibold text-lg">{level}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400 w-56">Ø Hints/Karte in Done</span>
                    <span className="font-semibold">{avgHintsDone}</span>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Spaced Repetition Card */}
            {spacedRepStats && (
              <Card className="bg-zinc-950 border-fuchsia-700">
                <CardHeader>
                  <CardTitle className="text-2xl mb-2 text-fuchsia-300">
                    📅 Spaced Repetition
                  </CardTitle>
                  <CardDescription>
                    <div className="grid grid-cols-2 gap-6 mb-4">
                      {/* Today's Reviews */}
                      <div className="bg-green-900/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">📚</span>
                          <span className="text-green-300 font-semibold">Today</span>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-green-400">
                            {spacedRepStats.cardsForReviewToday}
                          </span>
                          <span className="ml-2 text-zinc-400">cards due</span>
                        </div>
                      </div>

                      {/* This Week */}
                      <div className="bg-blue-900/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">📊</span>
                          <span className="text-blue-300 font-semibold">This Week</span>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-blue-400">
                            {spacedRepStats.upcomingThisWeek}
                          </span>
                          <span className="ml-2 text-zinc-400">reviews</span>
                        </div>
                      </div>

                      {/* Performance */}
                      <div className="bg-purple-900/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🎯</span>
                          <span className="text-purple-300 font-semibold">Performance</span>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-purple-400">
                            {spacedRepStats.averagePerformance}
                          </span>
                          <span className="ml-2 text-zinc-400">average</span>
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div className="bg-fuchsia-900/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">⚡</span>
                          <span className="text-fuchsia-300 font-semibold">Difficulty</span>
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
                        <span className="text-zinc-400 w-48">Total Attempts</span>
                        <span className="font-semibold text-fuchsia-300">{totalAttempts}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400 w-48">Avg Attempts per Card</span>
                        <span className="font-semibold text-fuchsia-300">{avgAttemptsPerCard}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-400 w-48">Cards in Review System</span>
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
      </div>
    </div>
  );
}
