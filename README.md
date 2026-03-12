# ChallengeFiap — JoviLens

App de câmera conceitual (UI) focado em estudantes, com:
- interface minimalista e aparência de câmera real (inspirada em iOS/Android, mas com identidade própria);
- assistente de IA que sugere modos (Retrato, Documento, Noturno, Tradução, etc.);
- barra de modos horizontal arrastável (Foto, Retrato, Vídeo, Doc, Noite, Cinema, Slow, Pano, QR, Traduzir, Objeto, Pro);
- legendas automáticas em vídeo (quando o navegador suporta Web Speech API);
- modo Tradução com seletor de idioma de destino (ex.: EN, DE, ES, FR).

## Como abrir e rodar

1. **Instalar dependências** (na primeira vez):
   ```bash
   npm install
   ```

2. **Modo desenvolvimento** (abre no navegador com hot-reload):
   ```bash
   npm run dev
   ```
   Acesse o endereço que aparecer no terminal (geralmente `http://localhost:5173`).

3. **Build para produção**:
   ```bash
   npm run build
   ```

4. **Visualizar o build de produção**:
   ```bash
   npm run preview
   ```

## Estrutura do projeto

```
src/
├── main.jsx              # Entrada: monta o app no #root
├── App.jsx               # App principal (estado e telas)
├── index.css             # Estilos globais básicos
├── constants/
│   └── theme.js          # Paleta INK, MODES, LANGUAGES, AI_RULES
├── hooks/
│   ├── useInterval.js    # Hook useInterval
│   └── useSpeechRecognition.js # Legendas ao vivo (Web Speech API)
├── utils/
│   └── format.js         # fmt (formato de tempo)
├── services/
│   └── ai.js             # callAI, translateWithAI, matchRule
├── components/
│   ├── ModeBar.jsx       # Barra horizontal de modos
│   ├── PulseShutter.jsx  # Botão de captura/gravação
│   ├── ContextBloom.jsx  # Controles rápidos (flash, legendas, idioma)
│   └── Scene.jsx         # Viewfinder por modo (doc, QR, translate, etc.)
└── styles/
    └── global.jsx        # Estilos injetados (fonte, keyframes)
```

## Requisitos

- Node.js (recomendado 18+)
- npm ou yarn

As chamadas de IA externas (Anthropic) falham sem API key; o app continua funcionando com respostas locais (regras em `AI_RULES`).
