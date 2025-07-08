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
