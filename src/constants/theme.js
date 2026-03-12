/**
 * JOVÍLENS — Design system ultra-realista
 * Estética de câmera profissional (iOS/Android): neutros, materiais autênticos
 */

export const FONT =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";

export const INK = {
  void: "#000000",
  deep: "#0a0a0a",
  surface: "#1c1c1e",
  lift: "#2c2c2e",
  rim: "#38383a",
  mist: "#48484a",
  smoke: "#8e8e93",
  ash: "#aeaeb2",
  bone: "#ffffff",
  accent: "#0a84ff",
  accentDim: "rgba(10,132,255,0.2)",
  danger: "#ff3b30",
  gold: "#0a84ff",
  goldD: "#0066cc",
  goldGlow: "rgba(10,132,255,0.18)",
};

export const MODES = [
  { id: "photo", label: "Foto", icon: "○" },
  { id: "portrait", label: "Retrato", icon: "◉" },
  { id: "video", label: "Vídeo", icon: "⬤" },
  { id: "document", label: "Doc", icon: "▣" },
  { id: "night", label: "Noite", icon: "◑" },
  { id: "cinema", label: "Cinema", icon: "▬" },
  { id: "slow", label: "Slow", icon: "≋" },
  { id: "pano", label: "Pano", icon: "⊟" },
  { id: "qr", label: "QR", icon: "⊞" },
  { id: "translate", label: "Traduzir", icon: "A" },
  { id: "object", label: "Objeto", icon: "◈" },
  { id: "pro", label: "Pro", icon: "M" },
];

export const LANGUAGES = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
];

export const AI_RULES = [
  { t: ["retrato", "portrait", "bokeh", "desfocado", "rosto"], mode: "portrait", reply: "Modo Retrato. Toque em \"Usar este modo\" para aplicar." },
  { t: ["traduz", "cartaz", "placa", "texto", "idioma", "inglês", "alemão", "espanhol"], mode: "translate", reply: "Modo Tradução. Escolha o idioma de destino na barra superior e toque em \"Usar este modo\" para aplicar." },
  { t: ["doc", "caderno", "lousa", "papel", "scan", "ocr", "escanear"], mode: "document", reply: "Modo Documento. Toque em \"Usar este modo\" para aplicar." },
  { t: ["noite", "noturno", "escuro", "pouca luz", "sem luz"], mode: "night", reply: "Modo Noite. Toque em \"Usar este modo\" para aplicar." },
  { t: ["slow", "lento", "slowmo", "câmera lenta"], mode: "slow", reply: "Modo Câmera lenta. Toque em \"Usar este modo\" para aplicar." },
  { t: ["vídeo", "video", "gravar", "filmagem", "4k"], mode: "video", reply: "Modo Vídeo. Toque em \"Usar este modo\" para aplicar." },
  { t: ["panorama", "pano", "paisagem", "amplo"], mode: "pano", reply: "Modo Panorama. Toque em \"Usar este modo\" para aplicar." },
  { t: ["qr", "código", "barcode", "ler"], mode: "qr", reply: "Modo QR. Toque em \"Usar este modo\" para aplicar." },
  { t: ["cinema", "cinemático", "filme"], mode: "cinema", reply: "Modo Cinema. Toque em \"Usar este modo\" para aplicar." },
  { t: ["objeto", "planta", "comida", "reconhec", "identific"], mode: "object", reply: "Modo Objeto. Toque em \"Usar este modo\" para aplicar." },
  { t: ["pro", "manual", "iso", "controle"], mode: "pro", reply: "Modo Pro. Toque em \"Usar este modo\" para aplicar." },
];

export const CAPTION_LINES = [
  "Então como eu estava explicando...",
  "Olha que lugar incrível esse aqui!",
  "Bem-vindos ao canal, pessoal!",
  "Deixa eu te mostrar como funciona...",
  "E aí, o que você achou?",
  "Isso aqui é simplesmente demais...",
  "Então a ideia principal é essa...",
  "Não acredito que aconteceu isso!",
];

export const SAMPLE_SIGNS = [
  "Welcome to our store!",
  "Open Monday to Friday, 9am–6pm",
  "Special offers available inside",
];
