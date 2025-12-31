import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  createRoom,
  getRoomByCode,
  getRoomById,
  addPlayer,
  getPlayersByRoomId,
  getPlayerById,
  createCard,
  getCardByPlayerId,
  markNumber,
  drawNumber,
  updatePlayerWin,
  updateRoomStatus,
  checkWinCondition,
} from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  bingo: router({
    // Create a new bingo room
    createRoom: publicProcedure
      .input(z.object({ name: z.string().min(1).max(100) }))
      .mutation(async ({ input }) => {
        try {
          const organizerId = Math.random().toString(36).substring(7); // Temporary ID for non-authenticated users
          const room = await createRoom(input.name, organizerId);
          return room;
        } catch (error) {
          console.error("Error creating room:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create room",
          });
        }
      }),

    // Get room by code
    getRoomByCode: publicProcedure
      .input(z.object({ code: z.string().length(6) }))
      .mutation(async ({ input }) => {
        try {
          const room = await getRoomByCode(input.code);
          if (!room) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Room not found",
            });
          }
          return room;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error getting room:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get room",
          });
        }
      }),

    // Get room by ID
    getRoomById: publicProcedure
      .input(z.object({ roomId: z.string() }))
      .query(async ({ input }) => {
        try {
          const room = await getRoomById(input.roomId);
          if (!room) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Room not found",
            });
          }
          return room;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error getting room:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get room",
          });
        }
      }),

    // Join a room as a player
    joinRoom: publicProcedure
      .input(
        z.object({
          roomId: z.string(),
          playerName: z.string().min(1).max(50),
          sessionId: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const room = await getRoomById(input.roomId);
          if (!room) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Room not found",
            });
          }

          // Check if player already exists in this room with this sessionId
          const existingPlayers = await getPlayersByRoomId(input.roomId);
          const existingPlayer = existingPlayers.find(p => p.sessionId === input.sessionId);

          if (existingPlayer) {
            const card = await getCardByPlayerId(existingPlayer.id);
            if (card) {
              return { player: existingPlayer, card };
            }
          }

          if (room.status !== "waiting") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Game already started",
            });
          }

          const player = await addPlayer(input.roomId, input.playerName, input.sessionId);
          const card = await createCard(player.id);

          return { player, card };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error joining room:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to join room",
          });
        }
      }),

    // Get players in a room
    getPlayers: publicProcedure
      .input(z.object({ roomId: z.string() }))
      .query(async ({ input }) => {
        try {
          const players = await getPlayersByRoomId(input.roomId);
          return players;
        } catch (error) {
          console.error("Error getting players:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get players",
          });
        }
      }),

    // Get player card
    getCard: publicProcedure
      .input(z.object({ playerId: z.string() }))
      .query(async ({ input }) => {
        try {
          const card = await getCardByPlayerId(input.playerId);
          if (!card) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Card not found",
            });
          }
          return card;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error getting card:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get card",
          });
        }
      }),

    // Mark a number on player's card
    markNumber: publicProcedure
      .input(z.object({ cardId: z.string(), number: z.number().min(1).max(75) }))
      .mutation(async ({ input }) => {
        try {
          const updatedCard = await markNumber(input.cardId, input.number);
          if (!updatedCard) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Card not found",
            });
          }
          return updatedCard;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error marking number:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to mark number",
          });
        }
      }),

    // Draw a number in the room
    drawNumber: publicProcedure
      .input(z.object({ roomId: z.string(), number: z.number().min(1).max(75) }))
      .mutation(async ({ input }) => {
        try {
          const updatedRoom = await drawNumber(input.roomId, input.number);
          if (!updatedRoom) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Room not found",
            });
          }
          return updatedRoom;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error drawing number:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to draw number",
          });
        }
      }),

    // Check for win condition
    checkWin: publicProcedure
      .input(z.object({ playerId: z.string() }))
      .query(async ({ input }) => {
        try {
          const player = await getPlayerById(input.playerId);
          if (!player) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Player not found",
            });
          }

          const card = await getCardByPlayerId(input.playerId);
          if (!card) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Card not found",
            });
          }

          const cardNumbers = JSON.parse(card.numbers) as number[];
          const markedNumbers = JSON.parse(card.markedNumbers) as number[];

          const winPattern = checkWinCondition(cardNumbers, markedNumbers);
          return { winPattern, hasWon: player.hasWon !== null };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error checking win:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to check win condition",
          });
        }
      }),

    // Update player win status
    updatePlayerWin: publicProcedure
      .input(
        z.object({
          playerId: z.string(),
          pattern: z.enum(["line", "column", "diagonal", "full"]),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const updatedPlayer = await updatePlayerWin(input.playerId, input.pattern);
          if (!updatedPlayer) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Player not found",
            });
          }
          return updatedPlayer;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error updating player win:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update player win",
          });
        }
      }),

    // Update room status
    updateRoomStatus: publicProcedure
      .input(
        z.object({
          roomId: z.string(),
          status: z.enum(["waiting", "drawing", "finished"]),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const updatedRoom = await updateRoomStatus(input.roomId, input.status);
          if (!updatedRoom) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Room not found",
            });
          }
          return updatedRoom;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error updating room status:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update room status",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
