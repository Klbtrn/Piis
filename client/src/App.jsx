import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FlashcardPage from "./pages/FlashcardPage";
import TrainerPage from "./pages/TrainerPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/flashcards" element={<FlashcardPage />} />
        <Route path="/training" element={<TrainerPage />} />
      </Routes>
    </BrowserRouter>
  );
}
