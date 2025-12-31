import { useParams, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Play, Square, Users, RotateCcw } from "lucide-react";

export default function Organizer() {
  const { roomId } = useParams<{ roomId: string }>();
  const [, setLocation] = useLocation();
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [nextNumber, setNextNumber] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getRoomQuery = trpc.bingo.getRoomById.useQuery(
    { roomId: roomId || "" },
    { enabled: !!roomId, refetchInterval: 2000 }
  );
  const getPlayersQuery = trpc.bingo.getPlayers.useQuery(
    { roomId: roomId || "" },
    { enabled: !!roomId, refetchInterval: 5000 }
  );
  const drawNumberMutation = trpc.bingo.drawNumber.useMutation();
  const updateRoomStatusMutation = trpc.bingo.updateRoomStatus.useMutation();

  const room = getRoomQuery.data;
  const players = getPlayersQuery.data || [];

  useEffect(() => {
    if (room?.drawnNumbers) {
      try {
        const numbers = JSON.parse(room.drawnNumbers) as number[];
        setDrawnNumbers(numbers);
      } catch (e) {
        console.error("Error parsing drawn numbers:", e);
      }
    }
  }, [room?.drawnNumbers]);

  const handleDrawNumber = async () => {
    if (!roomId) return;

    setIsDrawing(true);
    try {
      // Get available numbers (1-75 excluding already drawn)
      const available = Array.from({ length: 75 }, (_, i) => i + 1).filter(
        (n) => !drawnNumbers.includes(n)
      );

      if (available.length === 0) {
        toast.error("Todos os números foram sorteados!");
        setIsDrawing(false);
        return;
      }

      const randomNumber = available[Math.floor(Math.random() * available.length)];
      setNextNumber(randomNumber);

      await drawNumberMutation.mutateAsync({
        roomId,
        number: randomNumber,
      });

      setDrawnNumbers([...drawnNumbers, randomNumber]);
      toast.success(`Número sorteado: ${randomNumber}`);

      // Refetch players to check for winners
      await getPlayersQuery.refetch();
    } catch (error) {
      toast.error("Erro ao sortear número");
      console.error(error);
    } finally {
      setIsDrawing(false);
    }
  };

  const handleStartGame = async () => {
    if (!roomId) return;
    try {
      await updateRoomStatusMutation.mutateAsync({
        roomId,
        status: "drawing",
      });
      toast.success("Jogo iniciado!");
      await getRoomQuery.refetch();
    } catch (error) {
      toast.error("Erro ao iniciar jogo");
    }
  };

  const handleFinishGame = async () => {
    if (!roomId) return;
    try {
      await updateRoomStatusMutation.mutateAsync({
        roomId,
        status: "finished",
      });
      toast.success("Jogo finalizado!");
      await getRoomQuery.refetch();
    } catch (error) {
      toast.error("Erro ao finalizar jogo");
    }
  };

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      toast.success("Código copiado!");
    }
  };

  const handleCopyLink = () => {
    if (room?.code) {
      const link = `${window.location.origin}?joinCode=${room.code}`;
      navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    }
  };

  if (getRoomQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-white text-xl">Sala não encontrada</div>
      </div>
    );
  }

  const winners = players.filter((p) => p.hasWon !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Painel do Organizador</h1>
          <p className="text-white/80">{room.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Info */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Informações da Sala</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Código da Sala</p>
                    <div className="flex items-center gap-2">
                      <code className="text-2xl font-bold text-purple-600">{room.code}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyCode}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
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
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCopyLink}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link de Convite
                </Button>
              </CardContent>
            </Card>

            {/* Draw Controls */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Sorteio de Números</CardTitle>
                <CardDescription>
                  {drawnNumbers.length} de 75 números sorteados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {nextNumber && (
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg text-center">
                    <p className="text-sm text-gray-600 mb-2">Último número sorteado</p>
                    <p className="text-5xl font-bold text-purple-600">{nextNumber}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {room.status === "waiting" && (
                    <Button
                      onClick={handleStartGame}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Jogo
                    </Button>
                  )}
                  {room.status === "drawing" && (
                    <>
                      <Button
                        onClick={handleDrawNumber}
                        disabled={isDrawing || drawnNumbers.length >= 75}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Sortear Número
                      </Button>
                      <Button
                        onClick={handleFinishGame}
                        variant="destructive"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Finalizar
                      </Button>
                    </>
                  )}
                </div>

                {/* Drawn Numbers Grid */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Painel de Números:</p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <tbody>
                        {["B", "I", "N", "G", "O"].map((letter, rowIndex) => (
                          <tr key={letter}>
                            <td className="border p-2 bg-purple-600 text-white font-bold text-center w-10">
                              {letter}
                            </td>
                            {Array.from({ length: 15 }, (_, i) => rowIndex * 15 + i + 1).map((num) => (
                              <td
                                key={num}
                                className={`border p-1 text-center text-xs font-bold transition-colors ${
                                  drawnNumbers.includes(num)
                                    ? "bg-purple-200 text-purple-900"
                                    : "bg-white text-gray-400"
                                }`}
                              >
                                {num}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Players */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Jogadores ({players.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {players.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum jogador ainda</p>
                  ) : (
                    players.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm font-medium">{player.name}</span>
                        {player.hasWon && (
                          <Badge className="bg-green-600">Vencedor!</Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Winners */}
            {winners.length > 0 && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-600">Vencedores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {winners.map((winner) => (
                      <div key={winner.id} className="p-2 bg-white rounded border-l-4 border-orange-500">
                        <p className="font-semibold text-sm">{winner.name}</p>
                        <p className="text-xs text-gray-600 capitalize">
                          {winner.winPattern}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
