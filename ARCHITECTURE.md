# Arquitetura - Bingo Virtual Manus

## Visão Geral

Sistema de bingo online multiplayer com salas compartilháveis, sem necessidade de cadastro prévio. Organizador cria sala e compartilha link; jogadores entram e recebem cartelas únicas.

## Modelo de Dados

### Tabelas Principais

**rooms** - Salas de bingo
- `id`: UUID único
- `code`: Código curto (6 caracteres) para compartilhamento
- `name`: Nome da sala
- `status`: 'waiting' | 'drawing' | 'finished'
- `organizerId`: ID do organizador (gerado na criação)
- `drawnNumbers`: JSON array de números já sorteados
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**players** - Jogadores em uma sala
- `id`: UUID único
- `roomId`: FK para rooms
- `sessionId`: ID de sessão (sem cadastro)
- `name`: Nome do jogador
- `status`: 'connected' | 'disconnected'
- `hasWon`: Boolean (alguém já venceu com este padrão?)
- `winPattern`: 'line' | 'column' | 'diagonal' | 'full' | null
- `joinedAt`: Timestamp

**cards** - Cartelas de bingo
- `id`: UUID único
- `playerId`: FK para players
- `numbers`: JSON array 5x5 de números (1-75)
- `markedNumbers`: JSON array de números marcados
- `createdAt`: Timestamp

### Fluxo de Dados

1. **Criação de Sala**
   - Organizador acessa home e clica "Criar Bingo"
   - Sistema gera: UUID, código (6 chars), nome
   - Retorna link compartilhável: `/room/{code}`
   - Organizador entra automaticamente

2. **Entrada de Jogador**
   - Jogador acessa link `/room/{code}`
   - Sistema cria sessão anônima (sessionId)
   - Jogador insere nome
   - Sistema cria registro em players
   - Gera cartela única (5x5, números 1-75)
   - Jogador recebe cartela

3. **Sorteio**
   - Organizador clica "Sortear Número"
   - Sistema seleciona número aleatório não sorteado (1-75)
   - Broadcast para todos os jogadores
   - Cada cliente marca automaticamente se número está em sua cartela
   - Histórico atualizado

4. **Conferência de Vitória**
   - Após cada sorteio, verifica padrões:
     - Linha: 5 números em uma linha
     - Coluna: 5 números em uma coluna
     - Diagonal: 5 números na diagonal
     - Cartela cheia: Todos os 25 números
   - Se vencer, marca como `hasWon` e envia notificação
   - Pausa sorteio até confirmação

## Arquitetura Técnica

### Backend (Express + tRPC)

**Procedures Públicas:**
- `rooms.create(name)` → {code, roomId, organizerId}
- `rooms.get(code)` → {id, name, status, playerCount, drawnNumbers}
- `players.join(roomCode, name)` → {playerId, cardNumbers, sessionId}
- `players.list(roomCode)` → [{id, name, status}]

**Procedures Protegidas (organizador):**
- `rooms.drawNumber(roomId, organizerId)` → {number, allDrawn}
- `rooms.finishGame(roomId, organizerId)` → {success}

**WebSocket Events:**
- `room:numberDrawn` → {number, timestamp}
- `room:playerJoined` → {playerName, playerCount}
- `room:playerLeft` → {playerName, playerCount}
- `room:playerWon` → {playerName, pattern}
- `room:gameFinished` → {winners}

### Frontend

**Páginas:**
- `/` - Home (criar sala ou entrar via código)
- `/room/{code}` - Sala (organizador ou jogador)

**Componentes:**
- `RoomCreator` - Formulário para criar sala
- `RoomJoiner` - Formulário para entrar em sala
- `OrganizerPanel` - Controle de sorteio, histórico, jogadores
- `PlayerCard` - Cartela interativa 5x5
- `DrawnNumbers` - Histórico visual de números sorteados

## Fluxo de Comunicação em Tempo Real

1. **Polling (fallback)**
   - Cliente faz GET `/api/trpc/rooms.get` a cada 2s
   - Atualiza UI com novos números

2. **WebSocket (ideal)**
   - Conexão ao entrar em sala
   - Eventos broadcast para todos os clientes
   - Reduz latência e carga de servidor

## Segurança

- Sem autenticação (acesso via código)
- Validação de `organizerId` para ações de sorteio
- Validação de `sessionId` para ações de jogador
- Código de sala com 6 caracteres (46.656 combinações)

## Próximos Passos

1. Implementar schema Drizzle
2. Criar procedures tRPC
3. Implementar geração de cartelas
4. Criar interfaces (organizador e jogador)
5. Integrar WebSocket
6. Testes e validação
