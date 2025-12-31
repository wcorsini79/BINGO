import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Dice5, Users } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const createRoomMutation = trpc.bingo.createRoom.useMutation();
  const getRoomByCodeMutation = trpc.bingo.getRoomByCode.useMutation();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      toast.error("Por favor, digite um nome para a sala");
      return;
    }

    setIsCreating(true);
    try {
      const room = await createRoomMutation.mutateAsync({ name: roomName });
      toast.success(`Sala criada! Código: ${room.code}`);
      setRoomName("");
      setLocation(`/organizer/${room.id}`);
    } catch (error) {
      toast.error("Erro ao criar sala");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !playerName.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsJoining(true);
    try {
      const room = await getRoomByCodeMutation.mutateAsync({ code: joinCode.toUpperCase() });
      setJoinCode("");
      setPlayerName("");
      setLocation(`/player/${room.id}?playerName=${encodeURIComponent(playerName)}`);
    } catch (error) {
      toast.error("Código de sala inválido");
      console.error(error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Dice5 className="w-10 h-10 text-white" />
            <h1 className="text-4xl font-bold text-white">Bingo Virtual</h1>
          </div>
          <p className="text-white/80 text-lg">Jogue bingo online em tempo real</p>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Bem-vindo ao Bingo</CardTitle>
            <CardDescription className="text-center">
              Crie uma sala ou entre em uma existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create">Criar Sala</TabsTrigger>
                <TabsTrigger value="join">Entrar</TabsTrigger>
              </TabsList>

              {/* Create Room Tab */}
              <TabsContent value="create" className="space-y-4">
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-name">Nome da Sala</Label>
                    <Input
                      id="room-name"
                      placeholder="Ex: Bingo da Família"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Dice5 className="w-4 h-4 mr-2" />
                        Criar Sala
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Join Room Tab */}
              <TabsContent value="join" className="space-y-4">
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="join-code">Código da Sala</Label>
                    <Input
                      id="join-code"
                      placeholder="Ex: ABC123"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      disabled={isJoining}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="player-name">Seu Nome</Label>
                    <Input
                      id="player-name"
                      placeholder="Ex: João"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      disabled={isJoining}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    disabled={isJoining}
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 mr-2" />
                        Entrar na Sala
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-white/70 text-sm">
          <p>Jogue com amigos e família em tempo real</p>
        </div>
      </div>
    </div>
  );
}
