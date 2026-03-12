# JoviLens — Orbital UI

App de câmera conceitual (UI) com seletor orbital de modos, assistente IA e modos Foto, Retrato, Doc, Vídeo, Cinema, Slow, Pano, QR, Traduzir, Objeto e Pro.

## Como abrir e rodar

1. **Instalar dependências** (se ainda não instalou):
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

4. **Visualizar build de produção**:
   ```bash
   npm run preview
   ```

## Estrutura do projeto

```
src/
├── main.jsx              # Entrada: monta o app no #root
├── App.jsx               # App principal JoviLens (estado e telas)
├── index.css             # Estilos globais (body, #root)
├── constants/
│   └── theme.js          # INK, MODES, LANGUAGES, AI_RULES, etc.
├── hooks/
│   └── useInterval.js    # Hook useInterval
├── utils/
│   └── format.js         # fmt (formato de tempo)
├── services/
│   └── ai.js             # callAI, translateWithAI, matchRule
├── components/
│   ├── OrbitalRing.jsx   # Seletor de modos em arco
│   ├── PulseShutter.jsx  # Botão de captura/gravação
│   ├── ContextBloom.jsx  # Controles rápidos (flash, legendas, idioma)
│   └── Scene.jsx         # Viewfinder por modo (doc, QR, translate, etc.)
└── styles/
    └── global.jsx        # Estilos injetados (fonte Sora, keyframes)
```

## Requisitos

- Node.js (recomendado 18+)
- npm ou yarn

As chamadas de IA (Anthropic) falham sem API key; o app continua funcionando com respostas locais (regras em `AI_RULES`).
