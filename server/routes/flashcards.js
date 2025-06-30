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

// PUT /api/flashcards/:id - Flashcard aktualisieren
router.put("/:id", async (req, res) => {
  try {
    const updatedFlashcard = await Flashcard.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedFlashcard) {
      return res.status(404).json({ error: "Flashcard nicht gefunden" });
    }
    res.json(updatedFlashcard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/flashcards/:id - Flashcard löschen
router.delete("/:id", async (req, res) => {
  try {
    const deletedFlashcard = await Flashcard.findByIdAndDelete(req.params.id);
    if (!deletedFlashcard) {
      return res.status(404).json({ error: "Flashcard nicht gefunden" });
    }
    res.json({ message: "Flashcard gelöscht" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
