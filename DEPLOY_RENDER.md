# Guia de Deploy no Render

Este guia vai te ajudar a colocar seu Planning Poker no ar usando o Render (Grátis).

## 1. Preparar o Código

1. Crie um repositório no GitHub.
2. Envie todo o código deste projeto para lá.

## 2. Criar o Serviço no Render

1. Crie uma conta em [render.com](https://render.com/).
2. No painel, clique em **New +** e selecione **Web Service**.
3. Conecte sua conta do GitHub e selecione o repositório que você criou.

## 3. Configurar o Serviço

Preencha os campos assim:

- **Name:** `quick-planning-room` (ou o que preferir)
- **Region:** Escolha a mais próxima (ex: Ohio ou Frankfurt)
- **Branch:** `main` (ou a que você usou)
- **Root Directory:** Deixe em branco (ponto importante!)
- **Runtime:** `Node`
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

## 4. Configurar o Redis (Banco de Dados)

1. Ainda no painel do Render, clique em **New +** e selecione **Redis**.
2. Dê um nome (ex: `planning-redis`).
3. Escolha o plano **Free**.
4. Clique em **Create Redis**.
5. Quando criar, copie o **Internal Redis URL** (vai parecer com `redis://red-c...:6379`).

## 5. Conectar o Redis ao Serviço

1. Volte para o seu **Web Service** que você criou no passo 3.
2. Vá na aba **Environment**.
3. Clique em **Add Environment Variable**.
4. **Key:** `REDIS_URL`
5. **Value:** Cole a URL do Redis que você copiou.
6. Clique em **Save Changes**.

## 6. Finalizar

O Render vai reiniciar seu serviço automaticamente. Espere o deploy terminar (pode levar uns minutos).
Quando ficar verde ("Live"), clique na URL do seu projeto (ex: `https://quick-planning-room.onrender.com`) e pronto! 🎉

---

**Nota:** No plano gratuito, o servidor "dorme" após 15 minutos de inatividade. O primeiro acesso depois disso pode demorar uns 30-50 segundos para carregar. Isso é normal.
