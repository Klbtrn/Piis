// Hilfsfunktion zum Erstellen eines Flashcard-Objekts aus LLM-Result
export function buildFlashcardFromResult(result: any) {
  return {
    name: result.task_name || "",
    prompt: result.prompt || '',
    solution: result.solution || '',
    hintText: result.text_hint || '',
    hintCode: result.code_hint || '',
    difficultyLevel: result.difficulty_level || '',
    status: 'Backlog',
    task: result.task_description || '',
    keyConcepts: result.key_concepts || [],
    hintCount: 2,
    hintsUsed: 0,
    textHintUsed: false,
    codeHintUsed: false,
    editorContent: '',
    language: result.programming_language || '',
    duggyFeedback: '',
    createdAt: new Date().toISOString(),
  };
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Level-Berechnung für Flashcards
export function getLevelNumber(doneCount: number): number {
  let level = 0;
  let needed = 1;
  let sum = 0;
  while (doneCount >= sum + needed) {
    sum += needed;
    needed *= 2;
    level++;
  }
  return level;
}
