const express = require("express");
const router = express.Router();
const Flashcard = require("../models/Flashcard");

// Neue Karte anlegen
router.post("/", async (req, res) => {
  try {
    const flashcard = new Flashcard(req.body);
    await flashcard.save();
    res.status(201).json(flashcard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/flashcards
router.get("/", async (req, res) => {
  try {
    const flashcards = await Flashcard.find();
    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
