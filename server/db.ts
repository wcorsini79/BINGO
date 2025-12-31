import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, rooms, players, cards, Room, Player, Card, InsertRoom, InsertPlayer, InsertCard } from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Bingo Game Helpers

export async function createRoom(name: string, organizerId: string): Promise<Room> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const roomId = nanoid(36);
  const code = generateRoomCode();
  const drawnNumbers = "[]";

  const newRoom: InsertRoom = {
    id: roomId,
    code,
    name,
    status: "waiting",
    organizerId,
    drawnNumbers,
  };

  await db.insert(rooms).values(newRoom);
  return { id: roomId, code, name, status: "waiting", organizerId, drawnNumbers, createdAt: new Date(), updatedAt: new Date() };
}

export async function getRoomByCode(code: string): Promise<Room | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRoomById(roomId: string): Promise<Room | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function addPlayer(roomId: string, name: string, sessionId: string): Promise<Player> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const playerId = nanoid(36);
  const newPlayer: InsertPlayer = {
    id: playerId,
    roomId,
    sessionId,
    name,
    status: "connected",
  };

  await db.insert(players).values(newPlayer);
  return { id: playerId, roomId, sessionId, name, status: "connected", hasWon: null, winPattern: null, joinedAt: new Date() };
}

export async function getPlayersByRoomId(roomId: string): Promise<Player[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(players).where(eq(players.roomId, roomId));
}

export async function getPlayerById(playerId: string): Promise<Player | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCard(playerId: string): Promise<Card> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cardId = nanoid(36);
  const numbers = generateBingoCard();
  const markedNumbers = "[]";

  const newCard: InsertCard = {
    id: cardId,
    playerId,
    numbers: JSON.stringify(numbers),
    markedNumbers,
  };

  await db.insert(cards).values(newCard);
  return { id: cardId, playerId, numbers: JSON.stringify(numbers), markedNumbers, createdAt: new Date() };
}

export async function getCardByPlayerId(playerId: string): Promise<Card | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(cards).where(eq(cards.playerId, playerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function markNumber(cardId: string, number: number): Promise<Card | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const card = await db.select().from(cards).where(eq(cards.id, cardId)).limit(1);
  if (card.length === 0) return undefined;

  const currentCard = card[0];
  const markedNumbers = JSON.parse(currentCard.markedNumbers) as number[];

  if (!markedNumbers.includes(number)) {
    markedNumbers.push(number);
  }

  const updatedMarkedNumbers = JSON.stringify(markedNumbers);
  await db.update(cards).set({ markedNumbers: updatedMarkedNumbers }).where(eq(cards.id, cardId));

  return { ...currentCard, markedNumbers: updatedMarkedNumbers };
}

export async function drawNumber(roomId: string, number: number): Promise<Room | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const room = await getRoomById(roomId);
  if (!room) return undefined;

  const drawnNumbers = JSON.parse(room.drawnNumbers) as number[];
  if (!drawnNumbers.includes(number)) {
    drawnNumbers.push(number);
  }

  const updatedDrawnNumbers = JSON.stringify(drawnNumbers);
  await db.update(rooms).set({ drawnNumbers: updatedDrawnNumbers }).where(eq(rooms.id, roomId));

  return { ...room, drawnNumbers: updatedDrawnNumbers };
}

export async function updatePlayerWin(playerId: string, pattern: "line" | "column" | "diagonal" | "full"): Promise<Player | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const player = await getPlayerById(playerId);
  if (!player) return undefined;

  await db.update(players).set({ hasWon: new Date(), winPattern: pattern }).where(eq(players.id, playerId));

  return { ...player, hasWon: new Date(), winPattern: pattern };
}

export async function updateRoomStatus(roomId: string, status: "waiting" | "drawing" | "finished"): Promise<Room | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const room = await getRoomById(roomId);
  if (!room) return undefined;

  await db.update(rooms).set({ status, updatedAt: new Date() }).where(eq(rooms.id, roomId));

  return { ...room, status, updatedAt: new Date() };
}

// Utility Functions

function generateRoomCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateBingoCard(): number[] {
  const card: number[] = [];
  const ranges = [
    { min: 1, max: 15 },   // B
    { min: 16, max: 30 },  // I
    { min: 31, max: 45 },  // N
    { min: 46, max: 60 },  // G
    { min: 61, max: 75 },  // O
  ];

  // We need 5 numbers for each column
  const columns: number[][] = [[], [], [], [], []];

  for (let col = 0; col < 5; col++) {
    const { min, max } = ranges[col];
    const available = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    
    for (let row = 0; row < 5; row++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      columns[col].push(available[randomIndex]);
      available.splice(randomIndex, 1);
    }
  }

  // Flatten into a 25-number array (row by row)
  // Row 0: B0, I0, N0, G0, O0
  // Row 1: B1, I1, N1, G1, O1
  // ...
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        card.push(0); // Star/Free space
      } else {
        card.push(columns[col][row]);
      }
    }
  }

  return card;
}

export function checkWinCondition(cardNumbers: number[], markedNumbers: number[]): "line" | "column" | "diagonal" | "full" | null {
  // Free space (0) is always considered marked
  const isMarked = (num: number) => num === 0 || markedNumbers.includes(num);

  // Check full card first (highest priority)
  if (cardNumbers.every(num => isMarked(num))) {
    return "full";
  }

  // Convert to 5x5 grid
  const grid: number[][] = [];
  for (let i = 0; i < 5; i++) {
    grid[i] = cardNumbers.slice(i * 5, (i + 1) * 5);
  }

  // Check rows
  for (let i = 0; i < 5; i++) {
    if (grid[i].every(num => isMarked(num))) {
      return "line";
    }
  }

  // Check columns
  for (let i = 0; i < 5; i++) {
    if (grid.every(row => isMarked(row[i]))) {
      return "column";
    }
  }

  // Check diagonals
  if (grid.every((row, i) => isMarked(row[i]))) {
    return "diagonal";
  }

  if (grid.every((row, i) => isMarked(row[4 - i]))) {
    return "diagonal";
  }

  return null;
}
