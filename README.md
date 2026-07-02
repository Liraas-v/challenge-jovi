## Sobre o Projeto

O **JoviLens** é uma aplicação conceitual de câmera (UI) desenvolvida como parte do desafio acadêmico da FIAP. O projeto simula uma interface de câmera moderna, com estética autêntica inspirada nos sistemas iOS e Android, mas com identidade visual própria.

A aplicação conta com um assistente de IA que sugere modos de captura de acordo com o contexto da cena — como Portrait, Document, Night, Translation, entre outros. Uma barra de modos deslizável horizontalmente permite alternar facilmente entre as opções: Photo, Portrait, Video, Doc, Night, Cinema, Slow, Pano, QR, Translate, Object e Pro.

O projeto também implementa legendas automáticas para vídeo quando a Web Speech API está disponível no navegador, além de um modo de tradução com seletor de idioma de destino (EN, DE, ES, FR). As chamadas de IA utilizam a API da Anthropic, mas a aplicação funciona com respostas baseadas em regras locais caso a chave de API não esteja disponível.

---

## Objetivo de Aprendizado

Este projeto foi desenvolvido para colocar em prática conceitos de desenvolvimento frontend moderno com React, incluindo criação de componentes reutilizáveis, gerenciamento de estado com hooks customizados, integração com APIs de IA e Web APIs nativas do browser. O desafio também exercita boas práticas de organização de código, separação de responsabilidades (services, utils, constants) e construção de interfaces com foco em experiência do usuário.

---

## Tech Stack

[![Skills](https://skillicons.dev/icons?i=react,js,html,css,vite)](https://skillicons.dev)

| Tecnologia | Versão |
|---|---|
| React | ^19.2.0 |
| Vite | ^7.3.1 |
| JavaScript | ES2022+ |
| Web Speech API | nativa |
| Anthropic API | integração opcional |

---

## Como Rodar

**Pré-requisitos:** Node.js 18+ e npm ou yarn instalados.

```bash
# Clone o repositório
git clone https://github.com/Liraas-v/challenge-jovi
cd challenge-jovi

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

```bash
# Gerar build de produção
npm run build

# Pré-visualizar o build de produção
npm run preview
```

> **Nota:** Para habilitar o assistente de IA, configure sua chave da API da Anthropic. Sem a chave, o app utiliza respostas baseadas em regras locais automaticamente.

---

## Estrutura do Projeto

```
challenge-jovi/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
├── public/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── constants/
    │   └── theme.js
    ├── hooks/
    │   ├── useInterval.js
    │   └── useSpeechRecognition.js
    ├── utils/
    │   └── format.js
    ├── services/
    │   └── ai.js
    ├── components/
    │   ├── ModeBar.jsx
    │   ├── PulseShutter.jsx
    │   ├── ContextBloom.jsx
    │   └── Scene.jsx
    └── styles/
        └── global.jsx
```

---

<div align="center">

![Footer](https://capsule-render.vercel.app/api?type=wave&color=ED1C24&height=80&section=footer)

</div>
