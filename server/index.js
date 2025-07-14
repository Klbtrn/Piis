const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoose = require("mongoose");

// MongoDB-Verbindung herstellen
mongoose
  .connect("mongodb://localhost:27017/duggybuggy", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🟢 Verbunden mit MongoDB"))
  .catch((err) => console.error("🔴 MongoDB-Verbindungsfehler:", err));

// Import and mount routes
const flashcardRoutes = require("./routes/flashcards");
const llmRoutes = require("./routes/llmapi"); 

app.use("/api/flashcards", flashcardRoutes);
app.use("/api/llm", llmRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("DuggyBuggy API läuft 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});