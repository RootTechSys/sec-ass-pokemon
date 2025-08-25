# PokéCards - Aplicação de Cartas Pokémon

Uma aplicação completa para coleção e troca de cartas Pokémon com vulnerabilidades web intencionais para fins educacionais.

## 🚀 Funcionalidades

- **Sistema de Autenticação**: Login e registro de usuários
- **Compra de Pacotes**: Pacotes básicos e premium com animações
- **Coleção de Cartas**: Visualização e gerenciamento da coleção pessoal
- **Sistema de Trocas**: Troca de cartas entre usuários
- **Busca de Cartas**: Sistema de busca com filtros
- **Animações**: Abertura de pacotes com efeitos visuais
- **Design Responsivo**: Interface moderna e adaptável

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MySQL
- **Autenticação**: JWT, bcryptjs
- **UI Components**: Radix UI, shadcn/ui
- **Banco de Dados**: MySQL com scripts de criação e seed

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- MySQL 8.0+
- npm ou yarn

### Configuração do Banco de Dados

1. Instale e configure o MySQL
2. Execute os scripts de criação do banco:

\`\`\`bash
mysql -u root -p < scripts/create_database_v2.sql
mysql -u root -p < scripts/seed_data_v3.sql
\`\`\`

### Configuração da Aplicação

1. Clone o repositório
2. Instale as dependências:

\`\`\`bash
npm install
\`\`\`

3. Configure as variáveis de ambiente:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Edite o arquivo `.env.local` com suas configurações:

\`\`\`env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_mysql
DB_NAME=pokemon_cards
DB_PORT=3306
NEXTAUTH_SECRET=sua_chave_secreta_jwt
NEXTAUTH_URL=http://localhost:3000
\`\`\`

5. Execute a aplicação:

\`\`\`bash
npm run dev
\`\`\`

A aplicação estará disponível em `http://localhost:3000`

## 🔒 Vulnerabilidades Implementadas

**ATENÇÃO**: Esta aplicação contém vulnerabilidades intencionais para fins educacionais. Consulte o arquivo `VULNERABILITIES.md` para detalhes completos.

## 🚀 Deploy em Produção

### Vercel (Recomendado)

1. Faça push do código para um repositório Git
2. Conecte o repositório no Vercel
3. Configure as variáveis de ambiente no painel do Vercel
4. Configure um banco MySQL em produção (PlanetScale, Railway, etc.)
5. Deploy automático

### Docker

\`\`\`bash
docker build -t pokecards .
docker run -p 3000:3000 pokecards
\`\`\`

## 📁 Estrutura do Projeto

\`\`\`
pokemon-card-app/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI
│   ├── auth-forms.tsx    # Formulários de autenticação
│   ├── pack-opening-animation.tsx
│   └── trading-system.tsx
├── hooks/                 # Custom hooks
├── lib/                   # Utilitários
│   ├── db.ts             # Conexão com banco
│   └── utils.ts          # Funções utilitárias
├── scripts/              # Scripts SQL
│   ├── create_database_v2.sql
│   └── seed_data_v3.sql
├── public/               # Arquivos estáticos
└── VULNERABILITIES.md    # Documentação das vulnerabilidades
\`\`\`

## 🎮 Como Usar

1. **Registro**: Crie uma conta na aba "Registrar"
2. **Login**: Faça login com suas credenciais
3. **Comprar Pacotes**: Use moedas para comprar pacotes de cartas
4. **Coleção**: Visualize suas cartas na aba "Minha Coleção"
5. **Trocas**: Troque cartas com outros usuários na aba "Trocas"
6. **Busca**: Encontre cartas específicas na aba "Buscar"

## 🔧 Desenvolvimento

### Scripts Disponíveis

\`\`\`bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Executar build
npm run lint         # Linting
\`\`\`

### Adicionando Novas Cartas

1. Adicione as cartas no arquivo `scripts/seed_data_v3.sql`
2. Execute o script no banco de dados
3. Adicione as imagens correspondentes em `public/`

## 📝 Licença

Este projeto é para fins educacionais. Use com responsabilidade.

## ⚠️ Aviso de Segurança

Esta aplicação contém vulnerabilidades intencionais e NÃO deve ser usada em produção sem as devidas correções de segurança. Consulte `VULNERABILITIES.md` para mais informações.
