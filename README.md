# 🐞 DuggyBuggy – LLM-unterstütztes Debugging & Lernen

DuggyBuggy ist ein MERN-Webprojekt, das KI nutzt, um Programmierfehler zu analysieren, Hinweise zu geben und automatisch Flashcards aus Fehlern zu generieren. Diese Karten können im Trainer-Modus geübt werden – mit Spaced Repetition.

## 📦 Features

- **Helper**: Code einfügen, analysieren lassen, Hinweise & Lösung abrufen
- **Flashcards**: Eigene Fehler werden zu Lernkarten
- **Trainer-Mode**: Aufgaben lösen, Lösung prüfen, Fortschritt speichern
- **KI-Integration**: OpenAI API zur Codeanalyse und Feedbackgenerierung
- **MongoDB-Datenbank** zur Speicherung aller Flashcards

---

duggybuggy/
├── client/ # Frontend (React + Vite)
├── server/ # Backend (Express + MongoDB)
├── docker-compose.yml # MongoDB Setup
├── package.json # Root-Skripte (npm start, install-all)
└── README.md

## 🚀 Projekt starten

### 🛠 Voraussetzungen

- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Git (zum Klonen)

---

### 📥 Setup in 3 Schritten

```bash
# 1. Repository klonen
git clone <REPO_URL>
cd duggybuggy

# 2. Alle Abhängigkeiten installieren
npm run install-all

# 3. App + MongoDB starten
npm start
```
