# Guia de Deploy - PokéCards

## 🚀 Opções de Deploy

### 1. Vercel (Recomendado)

#### Configuração Rápida
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

#### Variáveis de Ambiente Necessárias
\`\`\`env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=pokemon_cards
DB_PORT=3306
NEXTAUTH_SECRET=your-jwt-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
\`\`\`

#### Banco de Dados Recomendado
- **PlanetScale**: MySQL serverless
- **Railway**: MySQL com deploy fácil
- **Supabase**: PostgreSQL (requer adaptação)

### 2. Railway

#### Deploy da Aplicação
\`\`\`bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway init
railway up
\`\`\`

#### Deploy do Banco MySQL
1. Adicione um serviço MySQL no Railway
2. Configure as variáveis de ambiente
3. Execute os scripts SQL via Railway CLI

### 3. Docker + VPS

#### Build da Imagem
\`\`\`bash
docker build -t pokecards .
docker run -p 3000:3000 --env-file .env.local pokecards
\`\`\`

#### Docker Compose
\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=pokemon_cards
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=pokemon_cards
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"

volumes:
  mysql_data:
\`\`\`

### 4. AWS/DigitalOcean

#### Configuração do Servidor
\`\`\`bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar MySQL
sudo apt update
sudo apt install mysql-server

# Configurar aplicação
git clone your-repo
cd pokemon-card-app
npm install
npm run build

# Configurar PM2 para produção
npm install -g pm2
pm2 start npm --name "pokecards" -- start
pm2 startup
pm2 save
\`\`\`

## 🗄️ Configuração do Banco de Dados

### Criação do Banco
\`\`\`bash
# Local
mysql -u root -p < scripts/create_database_v2.sql
mysql -u root -p < scripts/seed_data_v3.sql

# Remoto
mysql -h your-host -u your-user -p your-database < scripts/create_database_v2.sql
mysql -h your-host -u your-user -p your-database < scripts/seed_data_v3.sql
\`\`\`

### Backup e Restore
\`\`\`bash
# Backup
mysqldump -u root -p pokemon_cards > backup.sql

# Restore
mysql -u root -p pokemon_cards < backup.sql
\`\`\`

## 🔧 Configurações de Produção

### Otimizações de Performance
\`\`\`javascript
// next.config.mjs
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60
  }
}
\`\`\`

### Configuração de HTTPS
\`\`\`nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

## 📊 Monitoramento

### Logs da Aplicação
\`\`\`bash
# PM2
pm2 logs pokecards

# Docker
docker logs container-name

# Vercel
vercel logs
\`\`\`

### Métricas de Performance
- Configure New Relic ou DataDog
- Use Vercel Analytics
- Monitor MySQL com MySQL Workbench

## 🔒 Segurança em Produção

### Correções Necessárias
⚠️ **IMPORTANTE**: Corrija as vulnerabilidades antes do deploy:

1. **SQL Injection**: Use prepared statements
2. **XSS**: Sanitize user input
3. **IDOR**: Implement proper authorization
4. **Auth Bypass**: Strengthen session validation

### Configurações de Segurança
\`\`\`env
# Use senhas fortes
DB_PASSWORD=complex-secure-password
NEXTAUTH_SECRET=very-long-random-string-here

# Configure CORS
ALLOWED_ORIGINS=https://your-domain.com

# Rate limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
\`\`\`

## 🚨 Checklist de Deploy

- [ ] Banco de dados configurado e populado
- [ ] Variáveis de ambiente definidas
- [ ] SSL/HTTPS configurado
- [ ] Vulnerabilidades corrigidas (se necessário)
- [ ] Backup do banco configurado
- [ ] Monitoramento ativo
- [ ] Logs configurados
- [ ] Performance testada
- [ ] Domínio configurado
- [ ] CDN configurado (opcional)

## 📞 Suporte

Para problemas de deploy, verifique:
1. Logs da aplicação
2. Conexão com banco de dados
3. Variáveis de ambiente
4. Permissões de arquivo
5. Configuração de rede/firewall
