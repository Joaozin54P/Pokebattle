# 🎮 PokéBattle

Website de batalha Pokémon desenvolvido com React Native Web e Expo.

---

## 👥 Dupla

- **João Pedro da Silva Machado Felix**
- **Giovanna Aparecida**

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [npm](https://www.npmjs.com/)

---

## 🚀 Instalação

1. Baixe o arquivo `.zip` do projeto
2. Extraia o conteúdo em uma pasta de sua preferência
3. Abra o terminal dentro da pasta extraída e instale as dependências:

```bash
npm install --legacy-peer-deps
```

> ⚠️ **Importante:** O `--legacy-peer-deps` é necessário devido a conflitos de versão entre as dependências do projeto. Sempre utilize esse comando ao instalar pacotes.

### 🔧 Erro na instalação?

Caso ocorra algum erro, delete a pasta `node_modules` e repita o processo de instalação:

```bash
npm install --legacy-peer-deps
```
---
## 🔐 Acesso à Aplicação
 
Para entrar no sistema, utilize as seguintes credenciais:
 
- **Usuário:** Joen
- **Senha:** joen123

---

## ▶️ Como rodar

Após a instalação, inicie o projeto com:

```bash
npx expo start
```

Depois escolha a das opção no terminal:

- Pressione `w` para abrir no **navegador (web)**

---

## 🔄 Atualizando dependências

Caso precise adicionar ou atualizar algum pacote, utilize sempre o `--legacy-peer-deps`:

```bash
npm install <nome-do-pacote> --legacy-peer-deps
```

```bash
npm update --legacy-peer-deps
```

---

## 🗂️ Estrutura do Projeto

```
Pokebattle/
│
├── assets/                        # Ícones e imagens do app
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
│
├── src/
│   ├── @type/
│   │   └── pokemon.ts             # Tipagens TypeScript de Pokémon
│   │
│   ├── app/
│   │   ├── _layout.tsx            # Layout raiz da aplicação
│   │   │
│   │   ├── (auth)/                # Rotas de autenticação
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx          # Tela de login
│   │   │   └── register.tsx       # Tela de cadastro
│   │   │
│   │   └── (app)/                 # Rotas principais (autenticadas)
│   │       ├── _layout.tsx
│   │       ├── home.tsx           # Tela inicial
│   │       ├── battle.tsx         # Tela de batalha
│   │       ├── pokedex.tsx        # Pokédex
│   │       ├── team.tsx           # Gerenciamento de time
│   │       └── profile.tsx        # Perfil do usuário
│   │
│   ├── components/                # Componentes reutilizáveis
│   │   ├── button/
│   │   ├── card/
│   │   ├── customAlert/
│   │   ├── input/
│   │   ├── navbar/
│   │   ├── passwordToggle/
│   │   └── pokemonList/
│   │
│   ├── context/
│   │   ├── AuthContext.tsx        # Contexto de autenticação
│   │   └── TeamContext.tsx        # Contexto do time de Pokémon
│   │
│   └── integration/
│       └── pokemonIntegration.ts  # Integração com a API de Pokémon
│
├── api.json                       # Configurações da API
├── app.json                       # Configurações do Expo
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## 🛠️ Tecnologias Utilizadas

- **React Native** — Framework mobile
- **Expo** — Plataforma de desenvolvimento
- **Expo Router** — Navegação baseada em arquivos
- **TypeScript** — Tipagem estática
- **Axios** — Requisições HTTP
- **AsyncStorage** — Persistência local de dados
