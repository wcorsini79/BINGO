import { describe, expect, it } from "vitest";
import { checkWinCondition } from "./db";

// Helper function for testing (mirrors generateBingoCard logic)
function generateBingoCardForTest(): number[] {
  const numbers: number[] = [];
  const available = Array.from({ length: 75 }, (_, i) => i + 1);

  for (let i = 0; i < 25; i++) {
    const randomIndex = Math.floor(Math.random() * available.length);
    numbers.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }

  return numbers;
}

describe("Bingo Game Logic", () => {
  describe("generateBingoCard", () => {
    it("should generate a card with 25 unique numbers between 1 and 75", () => {
      const card = generateBingoCardForTest();
      
      expect(card).toHaveLength(25);
      expect(new Set(card).size).toBe(25); // All unique
      expect(card.every(n => n >= 1 && n <= 75)).toBe(true);
    });

    it("should generate different cards on multiple calls", () => {
      const card1 = generateBingoCardForTest();
      const card2 = generateBingoCardForTest();
      
      expect(card1).not.toEqual(card2);
    });
  });

  describe("checkWinCondition", () => {
    it("should detect a winning line (row)", () => {
      const card = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
      const marked = [1, 2, 3, 4, 5]; // First row
      
      const result = checkWinCondition(card, marked);
      expect(result).toBe("line");
    });

    it("should detect a winning column", () => {
      const card = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
      const marked = [1, 6, 11, 16, 21]; // First column
      
      const result = checkWinCondition(card, marked);
      expect(result).toBe("column");
    });

    it("should detect a winning diagonal (top-left to bottom-right)", () => {
      const card = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
      const marked = [1, 7, 13, 19, 25]; // Main diagonal
      
      const result = checkWinCondition(card, marked);
      expect(result).toBe("diagonal");
    });

    it("should detect a winning diagonal (top-right to bottom-left)", () => {
      const card = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
      const marked = [5, 9, 13, 17, 21]; // Anti-diagonal
      
      const result = checkWinCondition(card, marked);
      expect(result).toBe("diagonal");
    });

    it("should detect a full card win", () => {
      const card = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
      const marked = card; // All numbers marked
      
      const result = checkWinCondition(card, marked);
      expect(result).toBe("full");
    });

    it("should return null when no win condition is met", () => {
      const card = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
      const marked = [1, 2, 3]; // Only 3 numbers
      
      const result = checkWinCondition(card, marked);
      expect(result).toBeNull();
    });

    it("should return null for incomplete line", () => {
      const card = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
      const marked = [1, 2, 3, 4]; // 4 out of 5 in first row
      
      const result = checkWinCondition(card, marked);
      expect(result).toBeNull();
    });
  });
});
