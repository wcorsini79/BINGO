import { useParams, useLocation, useSearch } from "wouter";
import { useEffect, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Volume2, Trophy, Star } from "lucide-react";

export default function Player() {
  const { roomId } = useParams<{ roomId: string }>();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [cardId, setCardId] = useState<string | null>(null);
  const [cardNumbers, setCardNumbers] = useState<number[]>([]);
  const [markedNumbers, setMarkedNumbers] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [hasWon, setHasWon] = useState(false);
  const [winPattern, setWinPattern] = useState<string | null>(null);

  const playerName = new URLSearchParams(search).get("playerName") || "Jogador";

  const getRoomQuery = trpc.bingo.getRoomById.useQuery(
    { roomId: roomId || "" },
    { enabled: !!roomId, refetchInterval: 2000 }
  );
  const getPlayersQuery = trpc.bingo.getPlayers.useQuery(
    { roomId: roomId || "" },
    { enabled: !!roomId, refetchInterval: 5000 }
  );
  const joinRoomMutation = trpc.bingo.joinRoom.useMutation();
  const getCardQuery = trpc.bingo.getCard.useQuery(
    { playerId: playerId || "" },
    { enabled: !!playerId }
  );
  const markNumberMutation = trpc.bingo.markNumber.useMutation();
  const checkWinQuery = trpc.bingo.checkWin.useQuery(
    { playerId: playerId || "" },
    { enabled: !!playerId, refetchInterval: 3000 }
  );
  const updatePlayerWinMutation = trpc.bingo.updatePlayerWin.useMutation();

  const room = getRoomQuery.data;
  const players = getPlayersQuery.data || [];

  // Join room on mount
  useEffect(() => {
    if (roomId && !playerId) {
      const join = async () => {
        try {
          const result = await joinRoomMutation.mutateAsync({
            roomId,
            playerName,
            sessionId,
          });
          setPlayerId(result.player.id);
          setCardId(result.card.id);
          setCardNumbers(JSON.parse(result.card.numbers));
          setMarkedNumbers(JSON.parse(result.card.markedNumbers));
          toast.success("Você entrou na sala!");
        } catch (error) {
          toast.error("Erro ao entrar na sala");
          console.error(error);
        }
      };
      join();
    }
  }, [roomId, playerId, playerName, sessionId, joinRoomMutation]);

  // Update drawn numbers from room
  useEffect(() => {
    if (room?.drawnNumbers) {
      try {
        const numbers = JSON.parse(room.drawnNumbers) as number[];
        setDrawnNumbers(numbers);
        
        // Auto-mark numbers that are drawn
        const newMarked = numbers.filter(n => cardNumbers.includes(n));
        setMarkedNumbers(newMarked);
      } catch (e) {
        console.error("Error parsing drawn numbers:", e);
      }
    }
  }, [room?.drawnNumbers, cardNumbers]);

  // Check win condition when query data changes
  useEffect(() => {
    if (checkWinQuery.data?.winPattern && !hasWon && playerId) {
      const win = async () => {
        setHasWon(true);
        setWinPattern(checkWinQuery.data.winPattern!);
        
        try {
          // Update player win status
          await updatePlayerWinMutation.mutateAsync({
            playerId,
            pattern: checkWinQuery.data.winPattern as "line" | "column" | "diagonal" | "full",
          });
          
          toast.success(`Você venceu com ${checkWinQuery.data.winPattern}!`);
        } catch (error) {
          console.error("Error updating win status:", error);
        }
      };
      win();
    }
  }, [checkWinQuery.data, hasWon, playerId, updatePlayerWinMutation]);

  const handleToggleNumber = async (number: number) => {
    if (!cardId) return;

    try {
      const isMarked = markedNumbers.includes(number);
      if (!isMarked) {
        await markNumberMutation.mutateAsync({
          cardId,
          number,
        });
        setMarkedNumbers([...markedNumbers, number]);
      } else {
        // Remove from marked
        setMarkedNumbers(markedNumbers.filter(n => n !== number));
      }
    } catch (error) {
      toast.error("Erro ao marcar número");
      console.error(error);
    }
  };

  if (getRoomQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
        <div className="text-white text-xl">Sala não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-1">{room.name}</h1>
          <p className="text-white/80">Bem-vindo, {playerName}!</p>
        </div>

        {/* Win Notification */}
        {hasWon && (
          <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-lg shadow-xl animate-pulse">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              <div>
                <p className="text-xl font-bold">Parabéns! Você venceu!</p>
                <p className="text-sm opacity-90">Padrão: {winPattern}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Bingo Card */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Sua Cartela</CardTitle>
                <CardDescription>Clique nos números sorteados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {["B", "I", "N", "G", "O"].map((letter) => (
                    <div
                      key={letter}
                      className="aspect-square flex items-center justify-center font-black text-2xl text-purple-600"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {cardNumbers.map((number, index) => {
                    const isStar = number === 0;
                    const isMarked = isStar || markedNumbers.includes(number);
                    const isDrawn = isStar || drawnNumbers.includes(number);

                    return (
                      <button
                        key={index}
                        onClick={() => !isStar && handleToggleNumber(number)}
                        disabled={isStar}
                        className={`aspect-square flex items-center justify-center rounded-lg font-bold text-lg transition-all ${
                          isMarked
                            ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white scale-105 shadow-lg"
                            : isDrawn
                            ? "bg-purple-100 text-purple-800 border-2 border-purple-300"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        } ${isStar ? "cursor-default" : ""}`}
                      >
                        {isStar ? (
                          <Star className="w-8 h-8 fill-current" />
                        ) : (
                          number
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Room Info */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <Badge
                    variant={
                      room.status === "waiting"
                        ? "secondary"
                        : room.status === "drawing"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {room.status === "waiting"
                      ? "Aguardando"
                      : room.status === "drawing"
                      ? "Em Andamento"
                      : "Finalizado"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Números Sorteados</p>
                  <p className="text-2xl font-bold text-purple-600">{drawnNumbers.length}/75</p>
                </div>
              </CardContent>
            </Card>

            {/* Players */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Jogadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className={`p-2 rounded text-sm ${
                        player.id === playerId
                          ? "bg-blue-100 font-semibold text-blue-900"
                          : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{player.name}</span>
                        {player.hasWon && (
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Drawn Numbers */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Últimos Sorteados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-1">
                  {drawnNumbers.slice(-12).map((num) => (
                    <div
                      key={num}
                      className="aspect-square flex items-center justify-center bg-purple-600 text-white rounded text-xs font-bold"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
