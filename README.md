# Bingo Virtual Manus

Uma plataforma de bingo online elegante e em tempo real, construída com React, Tailwind CSS, tRPC e MySQL.

## 🎮 Funcionalidades

### Sistema de Salas
- **Criar Sala**: Organize uma partida com um código único de 6 caracteres
- **Entrar em Sala**: Jogadores podem entrar via código ou link de convite
- **Código Compartilhável**: Copie o código ou link para convidar amigos

### Interface do Organizador
- Painel de controle com informações da sala
- Botão para sortear números (1-75)
- Visualização de histórico de números sorteados em grid
- Lista de jogadores conectados
- Exibição de vencedores e padrão de vitória
- Controles para iniciar e finalizar o jogo

### Interface do Jogador
- Cartela 5x5 gerada automaticamente com 25 números únicos
- Marcação automática de números sorteados
- Visualização de números sorteados recentemente
- Detecção automática de vitória
- Notificação em tempo real quando vencer
- Informações da sala e contador de jogadores

### Detecção de Vitória
- **Linha**: 5 números em uma linha horizontal
- **Coluna**: 5 números em uma coluna vertical
- **Diagonal**: 5 números em uma diagonal
- **Cartela Cheia**: Todos os 25 números marcados

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11 + Node.js
- **Database**: MySQL com Drizzle ORM
- **Real-time**: Polling com tRPC (pronto para WebSocket)
- **Testing**: Vitest com 21 testes automatizados

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev

# Executar testes
pnpm test

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start
```

## 🚀 Como Usar

### Para o Organizador

1. Acesse a página inicial
2. Clique em "Criar Sala"
3. Digite um nome para a sala
4. Compartilhe o código ou link com os jogadores
5. Clique em "Iniciar Jogo" quando todos estiverem prontos
6. Clique em "Sortear Número" para cada rodada
7. Veja os vencedores aparecerem em tempo real

### Para o Jogador

1. Acesse a página inicial
2. Clique em "Entrar"
3. Digite o código da sala (ou use o link)
4. Digite seu nome
5. Sua cartela será gerada automaticamente
6. Números sorteados serão marcados automaticamente
7. Quando vencer, receberá uma notificação

## 🎨 Design

A plataforma apresenta um design elegante e moderno com:

- **Gradientes Vibrantes**: Cores roxo, rosa e vermelho para o organizador; azul e ciano para o jogador
- **Componentes shadcn/ui**: Interface consistente e profissional
- **Responsividade**: Funciona perfeitamente em mobile, tablet e desktop
- **Animações Suaves**: Transições elegantes e feedback visual

## 📊 Arquitetura

```
bingo-virtual-manus-v2/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Home, Organizer, Player
│   │   ├── components/    # UI components
│   │   ├── lib/           # tRPC client
│   │   └── App.tsx        # Router
│   └── index.html
├── server/                 # Backend Express + tRPC
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Database helpers
│   ├── storage.ts         # S3 storage
│   └── _core/             # Framework plumbing
├── drizzle/               # Database schema
│   ├── schema.ts          # Tables definition
│   └── migrations/        # SQL migrations
├── shared/                # Shared types
└── package.json
```

## 🧪 Testes

O projeto inclui 21 testes automatizados cobrindo:

- **Unit Tests**: Lógica de detecção de vitória e geração de cartelas
- **Integration Tests**: Criação de salas, entrada de jogadores, sorteio de números

```bash
# Executar testes
pnpm test

# Executar com coverage
pnpm test -- --coverage
```

## 🔄 Fluxo de Dados

1. **Criação de Sala**: Organizador → Backend → Database
2. **Entrada de Jogador**: Jogador → Backend → Database + Geração de Cartela
3. **Sorteio de Número**: Organizador → Backend → Database → Broadcast para Jogadores
4. **Marcação de Número**: Jogador → Backend → Database
5. **Detecção de Vitória**: Jogador → Backend → Verificação → Notificação

## 🚧 Próximas Melhorias

- [ ] WebSocket com Socket.io para comunicação em tempo real
- [ ] Sistema de pontuação e rankings
- [ ] Histórico de partidas
- [ ] Temas customizáveis
- [ ] Suporte a múltiplos idiomas
- [ ] Integração com redes sociais

## 📝 Licença

MIT

## 👥 Contribuições

Contribuições são bem-vindas! Abra uma issue ou pull request.

---

**Desenvolvido com ❤️ usando Manus WebDev**
