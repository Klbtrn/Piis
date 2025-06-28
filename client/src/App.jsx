import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FlashcardPage from "./pages/FlashcardPage";
import StatisticsPage from "./pages/StatisticsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/flashcards" element={<FlashcardPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
