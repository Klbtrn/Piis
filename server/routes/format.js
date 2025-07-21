const express = require("express");
const { execFile } = require("child_process");
const path = require("path");

const router = express.Router();

// POST /api/format/python
router.post("/python", (req, res) => {
  const code = req.body.code;
  if (typeof code !== "string") {
    return res.status(400).json({ error: "No code provided" });
  }

  // Absoluter Pfad zum Python-Skript
  const scriptPath = path.resolve(__dirname, "../pyformat.py");

  const child = execFile(
    "python3",
    [scriptPath],
    { maxBuffer: 1024 * 1024 },
    (error, stdout, stderr) => {
      if (error) {
        return res.status(500).json({ error: stderr || error.message });
      }
      res.json({ formatted: stdout });
    }
  );
  child.stdin.write(code);
  child.stdin.end();
});

module.exports = router;
