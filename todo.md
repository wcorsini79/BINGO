# Project TODO - Bingo Virtual Manus

## Phase 1: Database & Backend Setup
- [x] Implementar schema Drizzle (rooms, players, cards tables)
- [x] Criar helpers de banco de dados em server/db.ts
- [x] Implementar procedimento de criação de sala
- [x] Implementar procedimento de entrada de jogador
- [x] Implementar procedimento de sorteio de número
- [x] Implementar lógica de detecção de vitória
- [x] Escrever testes vitest para lógica central

## Phase 2: API tRPC & Routers
- [x] Criar router de bingo com procedimentos tRPC
- [x] Implementar geração de cartelas com números aleatórios
- [x] Implementar validação de vitória (linha, coluna, diagonal, cartela cheia)
- [x] Criar procedimentos para obter estado da sala
- [x] Criar procedimentos para marcar números na cartela

## Phase 3: WebSocket & Real-time
- [ ] Configurar Socket.io para comunicação em tempo real (usando polling com tRPC)
- [ ] Implementar eventos de sorteio de número
- [ ] Implementar eventos de entrada de jogador
- [ ] Implementar eventos de vitória
- [ ] Implementar reconexão e persistência de estado

## Phase 4: Interface do Organizador
- [x] Criar página de criação de sala
- [x] Exibir código de sala e link de compartilhamento
- [x] Implementar botão de sorteio de número
- [x] Exibir histórico de números sorteados
- [x] Exibir lista de jogadores conectados
- [x] Exibir contador de jogadores
- [x] Implementar botão de finalizar jogo
- [x] Exibir vencedores e padrão de vitória

## Phase 5: Interface do Jogador
- [x] Criar formulário de entrada em sala (código ou link)
- [x] Exibir cartela 5x5 gerada automaticamente
- [x] Implementar marcação de números na cartela
- [x] Exibir lista de números sorteados
- [x] Exibir informações da sala e contador de jogadores
- [x] Exibir notificação de vitória
- [x] Tratar desconexão e reconexão

## Phase 6: Design & Polish
- [x] Implementar design elegante com Tailwind CSS
- [x] Aplicar componentes shadcn/ui consistentemente
- [x] Garantir responsividade em mobile/tablet/desktop
- [x] Implementar animações e transições suaves
- [ ] Testar em diferentes navegadores
- [ ] Testar fluxo completo de jogo

## Phase 7: Testing & Deployment
- [x] Escrever e executar testes vitest
- [x] Testar criação e entrada em sala
- [x] Testar sorteio e marcação de números
- [x] Testar detecção de vitória para todos os padrões
- [x] Testar atualizações em tempo real
- [x] Testar desconexão/reconexão
- [ ] Criar checkpoint final
