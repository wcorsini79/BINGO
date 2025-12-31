import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Bingo Game Tables
export const rooms = mysqlTable("rooms", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: varchar("code", { length: 6 }).notNull().unique(),
  name: text("name").notNull(),
  status: mysqlEnum("status", ["waiting", "drawing", "finished"]).default("waiting").notNull(),
  organizerId: varchar("organizerId", { length: 36 }).notNull(),
  drawnNumbers: text("drawnNumbers").notNull(), // JSON array of drawn numbers
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;

export const players = mysqlTable("players", {
  id: varchar("id", { length: 36 }).primaryKey(),
  roomId: varchar("roomId", { length: 36 }).notNull(),
  sessionId: varchar("sessionId", { length: 36 }).notNull(),
  name: text("name").notNull(),
  status: mysqlEnum("status", ["connected", "disconnected"]).default("connected").notNull(),
  hasWon: timestamp("hasWon"),
  winPattern: mysqlEnum("winPattern", ["line", "column", "diagonal", "full"]),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

export const cards = mysqlTable("cards", {
  id: varchar("id", { length: 36 }).primaryKey(),
  playerId: varchar("playerId", { length: 36 }).notNull(),
  numbers: text("numbers").notNull(), // JSON array of 25 numbers
  markedNumbers: text("markedNumbers").notNull(), // JSON array of marked numbers
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;
