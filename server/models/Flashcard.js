const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema({
  prompt: String,//Überschrift für Karte
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
  task: String, // Beschreibung der Aufgabe
  keyConcepts: [String], // Schlüsselkonzepte, die in der Karte behandelt werden
  hintCount: Number,
  hintsUsed: Number,
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
