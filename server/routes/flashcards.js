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

// Alle Karten abrufen
router.get("/", async (req, res) => {
  const cards = await Flashcard.find().sort({ createdAt: -1 });
  res.json(cards);
});

module.exports = router;
