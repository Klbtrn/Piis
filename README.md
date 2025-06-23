# RubberDuggy 🦆

**An intelligent code tutoring environment that helps developers fix their own bugs and learn from them — sustainably.**

---

## 🚀 Overview

RubberDuggy is an AI-powered learning system for developers that bridges the gap between instant bug fixes and real learning. Instead of simply giving you the solution to broken code, it guides you through the debugging process with gradual hints, then turns your mistakes into personalized coding challenges to strengthen long-term learning.

---

## 🎓 Motivation

While large language models can instantly fix broken code, this often leads to passive copy-pasting without understanding. NAME tackles this by:

* Acting like a tutor, not a solver
* Teaching through hints and reflection
* Turning every bug into a future learning opportunity

Whether you're a beginner or an experienced developer, this system adapts to your skill level.

---

## 📦 Features

- **Helper**: Code einfügen, analysieren lassen, Hinweise & Lösung abrufen
- **Flashcards**: Eigene Fehler werden zu Lernkarten
- **Trainer-Mode**: Aufgaben lösen, Lösung prüfen, Fortschritt speichern
- **KI-Integration**: OpenAI API zur Codeanalyse und Feedbackgenerierung
- **MongoDB-Datenbank** zur Speicherung aller Flashcards

---

```
duggybuggy/
├── client/ # Frontend (React + Vite)
├── server/ # Backend (Express + MongoDB)
├── docker-compose.yml # MongoDB Setup
├── package.json # Root-Skripte (npm start, install-all)
└── README.md
```

## 🚀 Projekt starten

### 🛠 Voraussetzungen

- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Git (zum Klonen)

---

### 📥 Setup in 3 Schritten


# 1. Repository klonen
```
git clone <REPO_URL>
cd duggybuggy
```

# 2. Alle Abhängigkeiten installieren
```
npm run install-all
```

# 3. App + MongoDB starten
```
npm start
```
