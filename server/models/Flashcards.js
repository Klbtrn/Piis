const mongoose = require("mongoose");

const flashcardSchema = new mongoose.Schema({
  prompt: String,
  solution: String,
  hintText: String,
  hintCode: String,
  status: {
    type: String,
    enum: ["ToDo", "InArbeit", "Done"],
    default: "ToDo",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Flashcard", flashcardSchema);
