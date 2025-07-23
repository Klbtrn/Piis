const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema({
  prompt: String,//Überschrift für Karte
  task_name: String, // promt ist verwirrend, könnte ja auch die actual prompt für die Ausgabe sein, oder die prompt id
  solution: String,
  hintText: String,
  hintCode: String,
  difficultyLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"]
  },
  status: {
    type: String,
    enum: ["Backlog", "Repeat", "InProgress", "Done"],
    default: "Backlog",
  },
  // Spaced Repetition
  attempts: { type: Number, default: 0 },           // Total attempts on this card
  successfulReviews: { type: Number, default: 0 },  // Number of successful completions
  lastReviewDate: { type: Date, default: null },    // When card was last completed
  nextReviewDate: { type: Date, default: null },    // When to show again
  difficultyFactor: { type: Number, default: 2.5 }, // Performance-based multiplier (1.3-5.0)
  currentInterval: { type: Number, default: 1 },    // Current interval in days
  // Spaced Repetition
  taskText: String, // Beschreibung der Aufgabe
  taskCode: String, // Code, der für die Aufgabe verwendet wird
  keyConcepts: [String], // Schlüsselkonzepte, die in der Karte behandelt werden
  hintCount: Number,
  hintsUsed: Number,
  hintsUsedOverall: Number, // Gesamtzahl der verwendeten Hinweise
  triedCount: Number, // Anzahl der gestarteten Sessions
  textHintUsed: Boolean, // Gibt an, ob der Text-Hinweis verwendet wurde
  codeHintUsed: Boolean, // Gibt an, ob der Code-Hinweis verwendet wurde
  editorContent: String, // Inhalt des Editors, der für die Karte verwendet wird
  language: String,
  duggyFeedback: String, //rein wertendes Feedback ohne Hint
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Flashcard", flashcardSchema);
