# Guia de Deploy na Vercel

## Arquitetura

- **Client**: React + Vite (estático) → Vercel
- **API**: Vercel Serverless Functions (`/api/*`)
- **Banco**: Upstash Redis (serverless)
- **Real-time**: Ably (substitui Socket.io)

## 1. Contas Necessárias

1. **Vercel**: [vercel.com](https://vercel.com/) (free tier)
2. **Upstash**: [upstash.com](https://upstash.com/) (free tier: 10K comandos/dia)
3. **Ably**: [ably.com](https://ably.com/) (free tier: 3M mensagens/mês)

## 2. Configurar Upstash Redis

1. Crie uma conta no Upstash
2. Clique em **Create Database**
3. Escolha a região mais próxima
4. Selecione o plano **Pay-as-you-go** (grátis até 10K comandos/dia)
5. Copie o **REST URL** e **REST Token**

## 3. Configurar Ably

1. Crie uma conta no Ably
2. Clique em **Create New App**
3. Escolha o plano **Sandbox** (grátis)
4. Vá em **Settings** → **API Keys**
5. Copie a **Root API Key** (para o servidor)
6. Crie uma nova key com **Publish only** capability (para o client)

## 4. Deploy na Vercel

1. Conecte seu repositório GitHub na Vercel
2. A Vercel detectará automaticamente a configuração
3. Adicione as variáveis de ambiente:

**Variáveis de Ambiente (Environment Variables):**

| Variável | Descrição | Exemplo |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | URL REST do Upstash | `https://xxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Token do Upstash | `AXxx...` |
| `ABLY_API_KEY` | Chave API do Ably (servidor) | `xxxx:xxxx` |
| `VITE_ABLY_KEY` | Chave pública do Ably (client) | `xxxx:xxxx` |

4. Clique em **Deploy**

## 5. Testar

1. Acesse a URL do seu projeto (ex: `https://quick-planning-room.vercel.app`)
2. Crie uma sala
3. Abra outra aba/janela e entre na mesma sala
4. Teste votar, revelar e resetar

## 6. Deploy Local (Desenvolvimento)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Criar contas no Upstash e Ably, configure as env vars

# Criar arquivo .env.local na raiz
cp .env.example .env.local
# Edite com suas credenciais

# Criar arquivo client/.env.local
cp client/.env.example client/.env.local
# Edite com a chave pública do Ably

# Rodar localmente
vercel dev
```

## Notas

- O plano gratuito da Vercel não tem limites de build significativos para este projeto
- Upstash: 10K comandos/dia grátis (suficiente para uso pessoal)
- Ably: 3M mensagens/mês grátis (muito generoso)
- O client é servido como estático (CDN global, carregamento rápido)
- As API routes rodam como serverless (cold start ~250ms)
