const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema({
  prompt: String,
  solution: String,
  hintText: String,
  hintCode: String,
  status: {
    type: String,
    enum: ["Backlog", "Repeat", "InProgress", "Done"],
    default: "Backlog",
  },
  language: String,
  hintCount: Number,
  hintsUsed: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Flashcard", flashcardSchema);
