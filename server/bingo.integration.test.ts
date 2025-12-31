import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context
function createMockContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Bingo tRPC Routers", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let roomId: string;
  let playerId: string;
  let cardId: string;

  beforeEach(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("Room Management", () => {
    it("should create a room", async () => {
      const room = await caller.bingo.createRoom({ name: "Test Room" });
      
      expect(room).toBeDefined();
      expect(room.name).toBe("Test Room");
      expect(room.code).toHaveLength(6);
      expect(room.status).toBe("waiting");
      
      roomId = room.id;
    });

    it("should get room by code", async () => {
      const room = await caller.bingo.createRoom({ name: "Test Room 2" });
      const retrievedRoom = await caller.bingo.getRoomByCode({ code: room.code });
      
      expect(retrievedRoom).toBeDefined();
      expect(retrievedRoom.code).toBe(room.code);
      expect(retrievedRoom.id).toBe(room.id);
    });

    it("should get room by ID", async () => {
      const room = await caller.bingo.createRoom({ name: "Test Room 3" });
      const retrievedRoom = await caller.bingo.getRoomById({ roomId: room.id });
      
      expect(retrievedRoom).toBeDefined();
      expect(retrievedRoom.id).toBe(room.id);
    });

    it("should update room status", async () => {
      const room = await caller.bingo.createRoom({ name: "Test Room 4" });
      const updatedRoom = await caller.bingo.updateRoomStatus({
        roomId: room.id,
        status: "drawing",
      });
      
      expect(updatedRoom.status).toBe("drawing");
    });
  });

  describe("Player Management", () => {
    beforeEach(async () => {
      const room = await caller.bingo.createRoom({ name: "Player Test Room" });
      roomId = room.id;
    });

    it("should join a room", async () => {
      const sessionId = Math.random().toString(36).substring(7);
      const result = await caller.bingo.joinRoom({
        roomId,
        playerName: "Test Player",
        sessionId,
      });
      
      expect(result.player).toBeDefined();
      expect(result.player.name).toBe("Test Player");
      expect(result.player.status).toBe("connected");
      expect(result.card).toBeDefined();
      
      playerId = result.player.id;
      cardId = result.card.id;
    });

    it("should get players in a room", async () => {
      const sessionId = Math.random().toString(36).substring(7);
      await caller.bingo.joinRoom({
        roomId,
        playerName: "Player 1",
        sessionId,
      });
      
      const players = await caller.bingo.getPlayers({ roomId });
      
      expect(players).toBeDefined();
      expect(players.length).toBeGreaterThan(0);
      expect(players[0].name).toBe("Player 1");
    });
  });

  describe("Card and Number Management", () => {
    beforeEach(async () => {
      const room = await caller.bingo.createRoom({ name: "Card Test Room" });
      roomId = room.id;
      
      const sessionId = Math.random().toString(36).substring(7);
      const result = await caller.bingo.joinRoom({
        roomId,
        playerName: "Test Player",
        sessionId,
      });
      
      playerId = result.player.id;
      cardId = result.card.id;
    });

    it("should get player card", async () => {
      const card = await caller.bingo.getCard({ playerId });
      
      expect(card).toBeDefined();
      expect(card.playerId).toBe(playerId);
      
      const numbers = JSON.parse(card.numbers) as number[];
      expect(numbers).toHaveLength(25);
      expect(numbers.every(n => n >= 1 && n <= 75)).toBe(true);
    });

    it("should mark a number on card", async () => {
      const card = await caller.bingo.getCard({ playerId });
      const numbers = JSON.parse(card.numbers) as number[];
      const numberToMark = numbers[0];
      
      const updatedCard = await caller.bingo.markNumber({
        cardId,
        number: numberToMark,
      });
      
      const markedNumbers = JSON.parse(updatedCard.markedNumbers) as number[];
      expect(markedNumbers).toContain(numberToMark);
    });

    it("should draw a number in room", async () => {
      const updatedRoom = await caller.bingo.drawNumber({
        roomId,
        number: 42,
      });
      
      const drawnNumbers = JSON.parse(updatedRoom.drawnNumbers) as number[];
      expect(drawnNumbers).toContain(42);
    });
  });

  describe("Win Detection", () => {
    beforeEach(async () => {
      const room = await caller.bingo.createRoom({ name: "Win Test Room" });
      roomId = room.id;
      
      const sessionId = Math.random().toString(36).substring(7);
      const result = await caller.bingo.joinRoom({
        roomId,
        playerName: "Test Player",
        sessionId,
      });
      
      playerId = result.player.id;
      cardId = result.card.id;
    });

    it("should check win condition", async () => {
      const result = await caller.bingo.checkWin({ playerId });
      
      expect(result).toBeDefined();
      expect(result.hasWon).toBe(false);
      expect(result.winPattern).toBeNull();
    });

    it("should update player win status", async () => {
      const updatedPlayer = await caller.bingo.updatePlayerWin({
        playerId,
        pattern: "line",
      });
      
      expect(updatedPlayer.winPattern).toBe("line");
      expect(updatedPlayer.hasWon).not.toBeNull();
    });
  });
});
