import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   JOVÍLENS — ORBITAL UI CONCEPT
   
   Design System:
   · Orbital Ring: semi-circular mode selector, replaces horizontal strip
   · Context Bloom: radial controls bloom from touch point
   · Pulse Shutter: breathing shutter with biological rhythm feel
   · Ink Palette: warm off-black + bone white + single golden accent
   · Typography: Sora (geometric, warm, student-friendly)
═══════════════════════════════════════════════════════════════ */

const FONT = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap";

/* ── Ink Palette ── */
const INK = {
  void:    "#080A0F",   // near-black viewfinder
  deep:    "#0D1018",   // shell bg
  surface: "#131820",   // cards
  lift:    "#1A2230",   // elevated
  rim:     "#232E40",   // borders
  mist:    "#2E3D55",   // disabled
  smoke:   "#4A5E78",   // secondary text
  ash:     "#8CA0BC",   // tertiary
  bone:    "#E8EAF0",   // primary text
  gold:    "#F0C040",   // single accent — warm, not neon
  goldD:   "#C49A28",
  goldGlow:"rgba(240,192,64,0.18)",
};

/* ── Modes arranged for orbital display ── */
const MODES = [
  { id:"portrait",  label:"Retrato",   icon:"◉",  angle:-108 },
  { id:"document",  label:"Doc",       icon:"▣",  angle:-72  },
  { id:"night",     label:"Noite",     icon:"◑",  angle:-36  },
  { id:"photo",     label:"Foto",      icon:"○",  angle:0    },  // center default
  { id:"video",     label:"Vídeo",     icon:"⬤",  angle:36   },
  { id:"cinema",    label:"Cinema",    icon:"▬",  angle:72   },
  { id:"slow",      label:"Slow",      icon:"≋",  angle:108  },
  { id:"pano",      label:"Pano",      icon:"⊟",  angle:144  },
  { id:"qr",        label:"QR",        icon:"⊞",  angle:-144 },
  { id:"translate", label:"Traduzir",  icon:"⟨A⟩",angle:180  },
  { id:"object",    label:"Objeto",    icon:"◈",  angle:-180 },
  { id:"pro",       label:"Pro",       icon:"⊕",  angle:216  },
];

const LANGUAGES = [
  { code:"pt-BR", label:"Português", flag:"🇧🇷" },
  { code:"en",    label:"English",   flag:"🇺🇸" },
  { code:"es",    label:"Español",   flag:"🇪🇸" },
  { code:"fr",    label:"Français",  flag:"🇫🇷" },
  { code:"de",    label:"Deutsch",   flag:"🇩🇪" },
  { code:"it",    label:"Italiano",  flag:"🇮🇹" },
  { code:"ja",    label:"日本語",     flag:"🇯🇵" },
  { code:"zh",    label:"中文",      flag:"🇨🇳" },
  { code:"ko",    label:"한국어",    flag:"🇰🇷" },
];

const AI_RULES = [
  { t:["retrato","portrait","bokeh","desfocado","rosto"],        mode:"portrait",  reply:"Retrato configurado — bokeh máximo e luz de rosto otimizada. Aplicar?" },
  { t:["traduz","cartaz","placa","texto","idioma","inglês","alemão","espanhol"], mode:"translate", reply:"Modo Tradução AR pronto. Qual idioma você quer? Aplicar?" },
  { t:["doc","caderno","lousa","papel","scan","ocr","escanear"], mode:"document",  reply:"OCR + correção de perspectiva automática. Aplicar modo Doc?" },
  { t:["noite","noturno","escuro","pouca luz","sem luz"],        mode:"night",     reply:"ISO alto, exposição longa e redução de ruído IA. Aplicar Noite?" },
  { t:["slow","lento","slowmo","câmera lenta"],                   mode:"slow",      reply:"240fps configurado. Cada detalhe em câmera lenta. Aplicar?" },
  { t:["vídeo","video","gravar","filmagem","4k"],                 mode:"video",     reply:"Vídeo 4K com estabilização cinemática. Aplicar?" },
  { t:["panorama","pano","paisagem","amplo"],                     mode:"pano",      reply:"Panorama pronto. Mova devagar da esquerda pra direita. Aplicar?" },
  { t:["qr","código","barcode","ler"],                            mode:"qr",        reply:"Leitor QR/Barcode pronto. Aplicar?" },
  { t:["cinema","cinemático","filme"],                            mode:"cinema",    reply:"Cinema 2.39:1 com LUT. Aplicar?" },
  { t:["objeto","planta","comida","reconhec","identific"],        mode:"object",    reply:"Gemini Vision para reconhecimento. Aplicar?" },
  { t:["pro","manual","iso","controle"],                          mode:"pro",       reply:"Controle total desbloqueado. Aplicar Pro?" },
];

const CAPTION_LINES = [
  "Então como eu estava explicando...",
  "Olha que lugar incrível esse aqui!",
  "Bem-vindos ao canal, pessoal!",
  "Deixa eu te mostrar como funciona...",
  "E aí, o que você achou?",
  "Isso aqui é simplesmente demais...",
  "Então a ideia principal é essa...",
  "Não acredito que aconteceu isso!",
];

function useInterval(fn, ms) {
  const r = useRef(fn);
  useEffect(() => { r.current = fn; }, [fn]);
  useEffect(() => {
    if (!ms) return;
    const id = setInterval(() => r.current(), ms);
    return () => clearInterval(id);
  }, [ms]);
}

function matchRule(text) {
  const l = text.toLowerCase();
  return AI_RULES.find(r => r.t.some(t => l.includes(t))) || null;
}

async function callAI(userMsg, targetLangLabel) {
  const rule = matchRule(userMsg);
  if (rule) return { text: rule.reply, suggestedMode: rule.mode };
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: `Você é o assistente IA do JoviLens, app de câmera para estudantes. Responda em português, máximo 2 frases, sugira modos disponíveis: Foto, Retrato, Doc, Vídeo, Cinema, Slow, Pano, QR, Traduzir, Objeto, Pro. Idioma de tradução: ${targetLangLabel}.`,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    const d = await res.json();
    return { text: d.content?.[0]?.text || "Tente: 'retrato profissional', 'escanear caderno' ou 'traduzir texto'.", suggestedMode: null };
  } catch {
    return { text: "Tente: 'retrato profissional', 'escanear caderno' ou 'modo noturno'.", suggestedMode: null };
  }
}

async function translateWithAI(text, targetLabel) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system: `Translate to ${targetLabel}. Return ONLY the translated text. No explanations, no quotes.`,
        messages: [{ role: "user", content: text }],
      }),
    });
    const d = await res.json();
    return d.content?.[0]?.text || text;
  } catch {
    return text;
  }
}

/* ── Viewfinder content ── */
const SAMPLE_SIGNS = [
  "Welcome to our store!",
  "Open Monday to Friday, 9am–6pm",
  "Special offers available inside",
];

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
}

/* ════════════════════════════════════════════════════════════════
   ORBITAL RING COMPONENT
   The signature element: a half-circle mode selector
   centered at the bottom, modes arc above the shutter
════════════════════════════════════════════════════════════════ */
function OrbitalRing({ mode, onModeChange }) {
  const VISIBLE = 5; // modes visible at once in the arc
  const modeIdx = MODES.findIndex(m => m.id === mode);

  // Compute which 5 modes are visible, centered on active
  const getVisible = () => {
    const result = [];
    for (let i = -2; i <= 2; i++) {
      const idx = ((modeIdx + i) % MODES.length + MODES.length) % MODES.length;
      result.push({ ...MODES[idx], offset: i });
    }
    return result;
  };

  const visible = getVisible();
  const RADIUS = 148; // arc radius in px
  const CENTER_X = 187; // phone width / 2
  const CENTER_Y = 0;   // arc center is below the ring

  // Convert offset to arc angle: offset -2..2 mapped to -60°..60°
  const offsetToAngle = (offset) => (offset / 2.5) * 58; // degrees

  return (
    <div style={{
      position: "absolute", bottom: 84, left: 0, right: 0,
      height: 90, zIndex: 30, pointerEvents: "none",
    }}>
      {/* The arc — SVG guide line */}
      <svg style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 160, overflow: "visible", pointerEvents: "none" }} viewBox="0 0 375 80">
        <path
          d={`M ${CENTER_X - 155},80 A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER_X + 155},80`}
          fill="none"
          stroke={INK.rim}
          strokeWidth="1"
          strokeDasharray="2 4"
          opacity="0.5"
        />
      </svg>

      {/* Mode nodes on the arc */}
      {visible.map(({ id, label, icon, offset }) => {
        const angleRad = (offsetToAngle(offset) * Math.PI) / 180;
        const x = CENTER_X + RADIUS * Math.sin(angleRad);
        const y = 80 - RADIUS * (1 - Math.cos(angleRad)); // above baseline
        const isActive = id === mode;
        const distFade = Math.abs(offset);

        return (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            style={{
              position: "absolute",
              left: x,
              bottom: y + 2,
              transform: "translate(-50%, 50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              pointerEvents: "all",
              opacity: isActive ? 1 : Math.max(0.25, 1 - distFade * 0.28),
              transition: "all 0.32s cubic-bezier(0.34,1.56,0.64,1)",
              zIndex: isActive ? 10 : 5 - distFade,
            }}
          >
            {isActive && (
              <div style={{
                position: "absolute",
                top: -6, left: "50%",
                transform: "translateX(-50%)",
                width: 3, height: 3,
                borderRadius: "50%",
                background: INK.gold,
                boxShadow: `0 0 8px ${INK.gold}`,
              }} />
            )}
            <span style={{
              fontSize: isActive ? 15 : 12,
              color: isActive ? INK.gold : INK.smoke,
              transition: "all 0.32s",
              lineHeight: 1,
            }}>{icon}</span>
            <span style={{
              fontSize: isActive ? 10 : 8.5,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? INK.bone : INK.smoke,
              letterSpacing: 0.3,
              textTransform: "uppercase",
              transition: "all 0.32s",
              whiteSpace: "nowrap",
            }}>{label}</span>
          </button>
        );
      })}

      {/* Scroll hint arrows */}
      <button
        onClick={() => {
          const prev = ((modeIdx - 1) % MODES.length + MODES.length) % MODES.length;
          onModeChange(MODES[prev].id);
        }}
        style={{
          position: "absolute", left: 18, bottom: 16,
          background: "none", border: "none", cursor: "pointer",
          color: INK.mist, fontSize: 14, pointerEvents: "all",
          opacity: 0.6,
        }}
      >‹</button>
      <button
        onClick={() => {
          const next = (modeIdx + 1) % MODES.length;
          onModeChange(MODES[next].id);
        }}
        style={{
          position: "absolute", right: 18, bottom: 16,
          background: "none", border: "none", cursor: "pointer",
          color: INK.mist, fontSize: 14, pointerEvents: "all",
          opacity: 0.6,
        }}
      >›</button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PULSE SHUTTER — breathing animation tied to ~60bpm
════════════════════════════════════════════════════════════════ */
function PulseShutter({ mode, isRecording, onPress }) {
  const isVideo = mode === "video";

  return (
    <div style={{
      position: "absolute",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 40,
    }}>
      {/* Outer breathing ring */}
      <div style={{
        width: 82,
        height: 82,
        borderRadius: "50%",
        border: `1.5px solid rgba(240,192,64,${isRecording ? 0.9 : 0.35})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: isRecording ? "none" : "breathe 3.8s ease-in-out infinite",
        boxShadow: isRecording ? `0 0 24px rgba(240,192,64,0.3)` : "none",
        transition: "border-color 0.4s, box-shadow 0.4s",
        cursor: "pointer",
        background: "transparent",
      }} onClick={onPress}>
        {/* Inner button */}
        <div style={{
          width: 62,
          height: 62,
          borderRadius: isVideo && isRecording ? "10px" : "50%",
          background: isVideo
            ? (isRecording ? "#FF3B30" : "rgba(255,255,255,0.92)")
            : "rgba(255,255,255,0.92)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
          transition: "border-radius 0.3s, background 0.3s, transform 0.1s",
        }} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CONTEXT BLOOM — radial quick controls (top-left corner)
   Collapses to a single icon, expands into petals on tap
════════════════════════════════════════════════════════════════ */
function ContextBloom({ flash, onFlashChange, mode, captionsOn, onCaptionsToggle, onLangOpen }) {
  const [open, setOpen] = useState(false);

  const petals = [
    {
      icon: flash === "off" ? "⚡̸" : "⚡",
      label: { off: "Off", auto: "Auto", on: "On" }[flash],
      active: flash !== "off",
      action: () => onFlashChange(f => ({ off: "auto", auto: "on", on: "off" })[f]),
      angle: -90, dist: 68,
    },
    mode === "video" && {
      icon: "CC",
      label: captionsOn ? "Leg. On" : "Leg. Off",
      active: captionsOn,
      action: onCaptionsToggle,
      angle: -45, dist: 72,
    },
    mode === "translate" && {
      icon: "⟨A⟩",
      label: "Idioma",
      active: true,
      action: onLangOpen,
      angle: -45, dist: 72,
    },
  ].filter(Boolean);

  return (
    <div style={{ position: "absolute", top: 52, left: 16, zIndex: 60 }}>
      {/* Petals */}
      {open && petals.map((petal, i) => {
        const rad = (petal.angle * Math.PI) / 180;
        const px = Math.cos(rad) * petal.dist;
        const py = Math.sin(rad) * petal.dist;
        return (
          <button
            key={i}
            onClick={() => { petal.action(); setOpen(false); }}
            style={{
              position: "absolute",
              left: 19 + px,
              top: 19 + py,
              transform: "translate(-50%,-50%)",
              width: 38, height: 38,
              borderRadius: "50%",
              background: petal.active ? INK.goldGlow : "rgba(13,16,24,0.85)",
              border: `1px solid ${petal.active ? INK.gold : INK.rim}`,
              backdropFilter: "blur(16px)",
              color: petal.active ? INK.gold : INK.ash,
              fontSize: petal.icon === "CC" ? 9 : 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "bloomPetal 0.24s cubic-bezier(0.34,1.56,0.64,1) forwards",
              zIndex: 60,
            }}
          >{petal.icon}</button>
        );
      })}

      {/* Core button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 38, height: 38,
          borderRadius: "50%",
          background: open ? INK.goldGlow : "rgba(13,16,24,0.72)",
          border: `1px solid ${open ? INK.gold : INK.rim}`,
          backdropFilter: "blur(20px)",
          color: open ? INK.gold : INK.ash,
          fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.25s",
          zIndex: 61,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></>
          }
        </svg>
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   VIEWFINDER SCENE
════════════════════════════════════════════════════════════════ */
function Scene({ mode, scanY, isRecording, captionsOn, captionText, translatedLines, translating }) {
  const bg = {
    photo:    "radial-gradient(ellipse at 55% 38%, #1c2738 0%, #070c14 100%)",
    video:    "radial-gradient(ellipse at 50% 40%, #160d22 0%, #060408 100%)",
    portrait: "radial-gradient(ellipse at 50% 24%, #0e1e32 0%, #060c18 100%)",
    document: "radial-gradient(ellipse at 50% 52%, #141c28 0%, #080e18 100%)",
    night:    "radial-gradient(ellipse at 50% 32%, #06041a 0%, #010208 100%)",
    cinema:   "#070808",
    slow:     "radial-gradient(ellipse at 50% 50%, #0c1022 0%, #04060c 100%)",
    pano:     "linear-gradient(180deg, #081422 0%, #0e2030 45%, #0a1a12 72%, #04080a 100%)",
    qr:       "radial-gradient(ellipse at 50% 50%, #0e1614 0%, #040806 100%)",
    translate:"radial-gradient(ellipse at 50% 40%, #100e1c 0%, #06050c 100%)",
    object:   "radial-gradient(ellipse at 50% 44%, #0e1218 0%, #040608 100%)",
    pro:      "#080a0e",
  }[mode] || "#080a0e";

  return (
    <div style={{ position: "absolute", inset: 0, background: bg, overflow: "hidden" }}>

      {/* Night stars */}
      {mode === "night" && [...Array(42)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          top: `${2 + Math.random() * 60}%`,
          left: `${Math.random() * 100}%`,
          width: Math.random() * 1.5 + 0.5,
          height: Math.random() * 1.5 + 0.5,
          borderRadius: "50%",
          background: "#fff",
          opacity: Math.random() * 0.55 + 0.15,
        }} />
      ))}

      {/* Portrait: face ellipse guide */}
      {mode === "portrait" && (
        <div style={{
          position: "absolute", top: "10%", left: "50%",
          transform: "translateX(-50%)",
          width: 145, height: 182,
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: "50%",
        }} />
      )}

      {/* Document: paper + scan */}
      {mode === "document" && (<>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-52%) perspective(600px) rotateX(8deg) rotateZ(-1.5deg)",
          width: 190, height: 244,
          background: "linear-gradient(145deg, #f4efe5, #ece7d6)",
          borderRadius: 3,
          boxShadow: "0 18px 55px rgba(0,0,0,0.78), 0 2px 8px rgba(0,0,0,0.4)",
          padding: 16, display: "flex", flexDirection: "column", gap: 6,
        }}>
          {[100, 68, 86, 56, 92, 74, 80, 50, 88, 64].map((w, i) => (
            <div key={i} style={{ height: i === 0 ? 8 : 5, width: `${w}%`, background: i === 0 ? "#aaa" : "#d2cdc2", borderRadius: 2 }} />
          ))}
        </div>
        {/* scan corners */}
        {[{top:"12%",left:"12%",bT:1,bL:1},{top:"12%",right:"12%",bT:1,bR:1},{bottom:"12%",left:"12%",bB:1,bL:1},{bottom:"12%",right:"12%",bB:1,bR:1}].map((s,i)=>(
          <div key={i} style={{position:"absolute",width:20,height:20,...(s.top?{top:s.top}:{}), ...(s.bottom?{bottom:s.bottom}:{}), ...(s.left?{left:s.left}:{}), ...(s.right?{right:s.right}:{}), borderTop: s.bT ? "1.5px solid rgba(255,255,255,0.55)":undefined, borderBottom: s.bB ? "1.5px solid rgba(255,255,255,0.55)":undefined, borderLeft: s.bL ? "1.5px solid rgba(255,255,255,0.55)":undefined, borderRight: s.bR ? "1.5px solid rgba(255,255,255,0.55)":undefined}}/>
        ))}
        <div style={{ position: "absolute", left: "12%", right: "12%", top: `${scanY}%`, height: 1.5, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)", pointerEvents: "none", zIndex: 5 }} />
      </>)}

      {/* Translate: AR overlay */}
      {mode === "translate" && (<>
        <div style={{
          position: "absolute", top: "13%", left: "10%", right: "10%",
          background: "rgba(244,239,228,0.93)",
          borderRadius: 4, padding: "14px 15px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
        }}>
          {translating ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", padding: "8px 0" }}>
              <div style={{ width: 14, height: 14, border: "2px solid rgba(0,0,0,0.1)", borderTopColor: INK.gold, borderRadius: "50%", animation: "spin .8s linear infinite" }} />
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}>Traduzindo...</span>
            </div>
          ) : translatedLines.map((line, i) => (
            <div key={i} style={{ marginBottom: i < translatedLines.length - 1 ? 10 : 0 }}>
              <div style={{ fontSize: 10.5, color: "rgba(0,0,0,0.28)", fontStyle: "italic", marginBottom: 2 }}>{line.original}</div>
              <span style={{ background: "rgba(240,192,64,0.88)", color: "#000", fontWeight: 600, padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>
                {line.translated || line.original}
              </span>
            </div>
          ))}
        </div>
        {/* yellow corners */}
        {[{top:"10%",left:"8%",bT:1,bL:1},{top:"10%",right:"8%",bT:1,bR:1},{bottom:"32%",left:"8%",bB:1,bL:1},{bottom:"32%",right:"8%",bB:1,bR:1}].map((s,i)=>(
          <div key={i} style={{position:"absolute",width:18,height:18,...(s.top?{top:s.top}:{}), ...(s.bottom?{bottom:s.bottom}:{}), ...(s.left?{left:s.left}:{}), ...(s.right?{right:s.right}:{}), borderTop: s.bT ? `1.5px solid ${INK.gold}77`:undefined, borderBottom: s.bB ? `1.5px solid ${INK.gold}77`:undefined, borderLeft: s.bL ? `1.5px solid ${INK.gold}77`:undefined, borderRight: s.bR ? `1.5px solid ${INK.gold}77`:undefined}}/>
        ))}
      </>)}

      {/* QR finder */}
      {mode === "qr" && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-58%)", width: 180, height: 180 }}>
          {[{top:0,left:0,bT:1,bL:1},{top:0,right:0,bT:1,bR:1},{bottom:0,left:0,bB:1,bL:1},{bottom:0,right:0,bB:1,bR:1}].map((s,i)=>(
            <div key={i} style={{position:"absolute",width:22,height:22,...(s.top!==undefined?{top:s.top}:{}), ...(s.bottom!==undefined?{bottom:s.bottom}:{}), ...(s.left!==undefined?{left:s.left}:{}), ...(s.right!==undefined?{right:s.right}:{}), borderTop: s.bT ? "2.5px solid rgba(255,255,255,0.7)":undefined, borderBottom: s.bB ? "2.5px solid rgba(255,255,255,0.7)":undefined, borderLeft: s.bL ? "2.5px solid rgba(255,255,255,0.7)":undefined, borderRight: s.bR ? "2.5px solid rgba(255,255,255,0.7)":undefined}}/>
          ))}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.16)", fontSize: 10, letterSpacing: 2, fontWeight: 500 }}>QR / BARCODE</div>
        </div>
      )}

      {/* Cinema: letterbox */}
      {mode === "cinema" && (<>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "13%", background: "#000" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "13%", background: "#000" }} />
      </>)}

      {/* Pano guide */}
      {mode === "pano" && (<>
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 1.5, height: 16, background: "rgba(255,255,255,0.5)", borderRadius: 1 }} />
      </>)}

      {/* Object detect */}
      {mode === "object" && (
        <div style={{ position: "absolute", top: "14%", left: "14%", right: "14%", height: "50%", border: "1px dashed rgba(255,255,255,0.22)", borderRadius: 8 }}>
          <div style={{ position: "absolute", bottom: -22, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)", borderRadius: 18, padding: "2px 12px", fontSize: 10, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>Apontando para objeto...</div>
        </div>
      )}

      {/* Pro grid */}
      {mode === "pro" && [33, 66].map(p => (
        <div key={p}>
          <div style={{ position: "absolute", top: `${p}%`, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", left: `${p}%`, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.04)" }} />
        </div>
      ))}

      {/* Slow fps badge */}
      {mode === "slow" && (
        <div style={{ position: "absolute", top: "8%", right: "6%", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "3px 9px", fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 600, letterSpacing: 1 }}>240 FPS</div>
      )}

      {/* Video REC */}
      {mode === "video" && isRecording && (
        <div style={{ position: "absolute", top: "8%", right: "6%", display: "flex", alignItems: "center", gap: 5, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", borderRadius: 18, padding: "3px 10px" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B30", animation: "blink 1s infinite" }} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", fontWeight: 600, fontFamily: "monospace" }}>REC</span>
        </div>
      )}

      {/* Captions */}
      {mode === "video" && captionsOn && captionText && (
        <div style={{ position: "absolute", bottom: "22%", left: "8%", right: "8%", display: "flex", justifyContent: "center" }}>
          <div style={{ background: "rgba(0,0,0,0.7)", borderRadius: 6, padding: "5px 14px", fontSize: 13, color: "#fff", fontWeight: 400, lineHeight: 1.4, textAlign: "center", maxWidth: "90%" }}>
            {captionText}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════════════ */
export default function JoviLens() {
  const [mode, setMode]               = useState("photo");
  const [view, setView]               = useState("camera");
  const [zoom, setZoom]               = useState(1);
  const [flash, setFlash]             = useState("auto");
  const [scanY, setScanY]             = useState(15);
  const [metrics, setMetrics]         = useState({ luz: 82, foco: 90, estab: 87 });
  const [captures, setCaptures]       = useState([]);
  const [isRecording, setRecording]   = useState(false);
  const [recTime, setRecTime]         = useState(0);
  const [captionsOn, setCaptions]     = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [captionLang, setCaptionLang] = useState("pt-BR");
  const [targetLang, setTargetLang]   = useState("pt-BR");
  const [langPickerFor, setLangFor]   = useState("translate");
  const [translatedLines, setTranslated] = useState(SAMPLE_SIGNS.map(s => ({ original: s, translated: "" })));
  const [translating, setTranslating] = useState(false);
  const [aiSettings, setAiSettings]   = useState({ iso: 100, ev: 0 });
  const [chat, setChat]               = useState([{ text: "Olá! Diga o que quer fazer que configuro tudo — você decide se aplica.", isUser: false }]);
  const [chatInput, setChatInput]     = useState("");
  const [aiTyping, setAiTyping]       = useState(false);
  const [pendingMode, setPending]     = useState(null);
  const [notif, setNotif]             = useState(null);
  const [exportDone, setExportDone]   = useState(false);
  const [flashFrame, setFlashFrame]   = useState(false);

  const chatEndRef    = useRef(null);
  const suggRef       = useRef(null);
  const captionIdx    = useRef(0);

  const cm            = MODES.find(m => m.id === mode) || MODES[3];
  const tLangLabel    = LANGUAGES.find(l => l.code === targetLang)?.label || targetLang;
  const cLangLabel    = LANGUAGES.find(l => l.code === captionLang)?.label || captionLang;

  /* ── Scan ── */
  useInterval(() => setScanY(y => { const n = y + 1.4; return n > 84 ? 15 : n; }), 16);

  /* ── Metrics drift ── */
  useInterval(() => setMetrics(m => ({
    luz:   Math.min(100, Math.max(20, m.luz   + (Math.random() - .5) * 4)),
    foco:  Math.min(100, Math.max(40, m.foco  + (Math.random() - .5) * 3)),
    estab: Math.min(100, Math.max(50, m.estab + (Math.random() - .5) * 3)),
  })), 1500);

  /* ── Record timer ── */
  useEffect(() => {
    if (!isRecording) { setRecTime(0); return; }
    const id = setInterval(() => setRecTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  /* ── Captions sim ── */
  useInterval(() => {
    if (mode === "video" && isRecording && captionsOn) {
      captionIdx.current = (captionIdx.current + 1) % CAPTION_LINES.length;
      setCaptionText(CAPTION_LINES[captionIdx.current]);
    } else setCaptionText("");
  }, 3400);

  /* ── Auto-translate when mode=translate or lang changes ── */
  useEffect(() => {
    if (mode !== "translate") return;
    let cancelled = false;
    async function run() {
      setTranslating(true);
      const results = await Promise.all(
        SAMPLE_SIGNS.map(async orig => {
          const t = await translateWithAI(orig, tLangLabel);
          return { original: orig, translated: t };
        })
      );
      if (!cancelled) { setTranslated(results); setTranslating(false); }
    }
    run();
    return () => { cancelled = true; };
  }, [mode, targetLang]);

  /* ── Scroll chat ── */
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat]);

  const notify = useCallback((msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 2600);
  }, []);

  const handleShutter = useCallback(() => {
    if (mode === "video") {
      if (!isRecording) { setRecording(true); notify("Gravação iniciada"); }
      else {
        setRecording(false);
        setCaptures(c => [{ id: Date.now(), mode: "Vídeo", time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), tags: ["VÍDEO", "4K", captionsOn ? "CC" : null].filter(Boolean) }, ...c]);
        notify("Vídeo salvo");
      }
      return;
    }
    setFlashFrame(true);
    setTimeout(() => setFlashFrame(false), 220);
    setCaptures(c => [{ id: Date.now(), mode: cm.label, time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), tags: [mode.toUpperCase()] }, ...c]);
    notify(`${cm.label} capturada`);
  }, [mode, isRecording, cm, captionsOn, notify]);

  const handleExport = useCallback(() => {
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3500);
    notify("Exportado para o Google Drive");
  }, [notify]);

  const sendChat = useCallback(async (text) => {
    if (!text.trim()) return;
    setChat(c => [...c, { text, isUser: true }]);
    setChatInput("");
    setAiTyping(true);
    const result = await callAI(text, tLangLabel);
    if (result.suggestedMode) setPending({ mode: result.suggestedMode, label: MODES.find(m => m.id === result.suggestedMode)?.label || result.suggestedMode });
    setChat(c => [...c, { text: result.text, isUser: false, suggestedMode: result.suggestedMode }]);
    setAiTyping(false);
  }, [tLangLabel]);

  const applyPending = useCallback(() => {
    if (!pendingMode) return;
    setMode(pendingMode.mode);
    setView("camera");
    notify(`${pendingMode.label} aplicado`);
    setPending(null);
  }, [pendingMode, notify]);

  /* ── Drag helper for suggestion strip ── */
  const bindDrag = (ref) => ({
    onMouseDown: (e) => {
      const el = ref.current;
      if (!el) return;
      let startX = e.pageX, startScroll = el.scrollLeft;
      const move = ev => { el.scrollLeft = startScroll - (ev.pageX - startX); };
      const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    }
  });

  const SUGG = ["Retrato profissional","Traduzir cartaz","Escanear caderno","Modo noturno","Câmera lenta","Reconhecer objeto"];

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', system-ui, sans-serif" }}>
      <style>{`
        @import url('${FONT}');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        button, input { font-family: inherit; }
        * { scrollbar-width: none; }
        *::-webkit-scrollbar { display: none; }
        @keyframes breathe {
          0%,100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.032); opacity: .75; }
        }
        @keyframes bloomPetal {
          from { opacity: 0; transform: translate(-50%,-50%) scale(0.4); }
          to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastUp { from{opacity:0;transform:translateX(-50%) translateY(4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes flash  { 0%{opacity:.85} 100%{opacity:0} }
      `}</style>

      {/* ── PHONE SHELL ── */}
      <div style={{
        width: 375, height: 812,
        background: INK.void,
        borderRadius: 50,
        border: `1px solid ${INK.lift}`,
        boxShadow: `0 0 0 1px ${INK.deep}, 0 50px 120px rgba(0,0,0,0.97), inset 0 1px 0 rgba(255,255,255,0.04)`,
        position: "relative", overflow: "hidden",
        userSelect: "none",
      }}>

        {/* Dynamic Island */}
        <div style={{
          position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)",
          width: 122, height: 32, background: "#000", borderRadius: 18,
          zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          border: "1px solid #0e0e10",
        }}>
          {mode === "video" && isRecording ? (<>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF3B30", animation: "blink 1s infinite" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", fontWeight: 600 }}>{fmt(recTime)}</span>
          </>) : view === "chat" ? (<>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: INK.gold, animation: "blink 2.5s infinite" }} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>IA ativa</span>
          </>) : (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", fontWeight: 500, letterSpacing: .2 }}>{cm.label}</span>
          )}
        </div>

        {/* Status bar */}
        <div style={{ position: "absolute", top: 14, left: 22, right: 22, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 150, paddingTop: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.82)" }}>
            {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>5G</span>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
              <rect x="0" y="7" width="3" height="3" rx=".5" fill="rgba(255,255,255,0.85)"/>
              <rect x="4" y="4.5" width="3" height="5.5" rx=".5" fill="rgba(255,255,255,0.85)"/>
              <rect x="8" y="2" width="3" height="8" rx=".5" fill="rgba(255,255,255,0.85)"/>
              <rect x="12" y="0" width="3" height="10" rx=".5" fill="rgba(255,255,255,0.85)"/>
            </svg>
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
              <rect x=".5" y=".5" width="16" height="9" rx="2" stroke="rgba(255,255,255,0.4)" strokeWidth=".9"/>
              <rect x="1.5" y="1.5" width="12" height="7" rx="1.5" fill="rgba(255,255,255,0.82)"/>
              <path d="M17.5 3.5v3a1.5 1.5 0 000-3z" fill="rgba(255,255,255,0.4)"/>
            </svg>
          </div>
        </div>

        {/* Toast */}
        {notif && (
          <div style={{
            position: "absolute", bottom: 108, left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(22,24,30,0.88)", backdropFilter: "blur(20px)",
            borderRadius: 22, padding: "8px 18px", zIndex: 500, whiteSpace: "nowrap",
            animation: "toastUp .25s ease", border: `1px solid ${INK.rim}`,
          }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{notif}</span>
          </div>
        )}

        {/* ════ CAMERA VIEW ════ */}
        {view === "camera" && (<>
          <Scene
            mode={mode} scanY={scanY} isRecording={isRecording}
            captionsOn={captionsOn} captionText={captionText}
            translatedLines={translatedLines} translating={translating}
          />

          {/* Flash frame */}
          {flashFrame && <div style={{ position: "absolute", inset: 0, background: "#fff", zIndex: 100, pointerEvents: "none", animation: "flash .22s ease forwards" }} />}

          {/* ── Context Bloom (top-left) ── */}
          <ContextBloom
            flash={flash}
            onFlashChange={setFlash}
            mode={mode}
            captionsOn={captionsOn}
            onCaptionsToggle={() => setCaptions(x => !x)}
            onLangOpen={() => { setLangFor("translate"); setView("langpicker"); }}
          />

          {/* ── Right: metrics ── */}
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 4, zIndex: 40 }}>
            {[{ icon: "☀", v: metrics.luz, l: "LUZ" }, { icon: "◎", v: metrics.foco, l: "FOCO" }, { icon: "≡", v: metrics.estab, l: "EST" }].map(({ icon, v, l }) => (
              <div key={l} style={{ width: 30, height: 40, background: "rgba(0,0,0,0.42)", backdropFilter: "blur(16px)", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{icon}</span>
                <div style={{ width: 14, height: 1.5, background: "rgba(255,255,255,0.1)", borderRadius: 1 }}>
                  <div style={{ height: "100%", width: `${v}%`, borderRadius: 1, background: "rgba(255,255,255,0.55)", transition: "width 1s ease" }} />
                </div>
                <span style={{ fontSize: 6, color: "rgba(255,255,255,0.22)", letterSpacing: .5 }}>{l}</span>
              </div>
            ))}
          </div>

          {/* ── PRO sliders ── */}
          {mode === "pro" && (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 210, padding: "0 18px", zIndex: 20, display: "flex", flexDirection: "column", gap: 5 }}>
              {[{ label: "ISO", val: Math.min(100, (aiSettings.iso / 6400) * 100), display: aiSettings.iso }, { label: "EV", val: (aiSettings.ev + 3) * 16.67, display: (aiSettings.ev >= 0 ? "+" : "") + aiSettings.ev }].map(({ label, val, display }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)", borderRadius: 8, padding: "6px 12px" }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 600, width: 18 }}>{label}</span>
                  <div style={{ flex: 1, height: 1.5, background: "rgba(255,255,255,0.1)", borderRadius: 1 }}><div style={{ height: "100%", width: `${val}%`, background: "rgba(255,255,255,0.6)", borderRadius: 1, transition: "width .8s" }} /></div>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", fontWeight: 600, width: 30, textAlign: "right" }}>{display}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── Zoom pills ── */}
          <div style={{
            position: "absolute", bottom: 206, left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.42)", backdropFilter: "blur(20px)",
            borderRadius: 20, padding: "3px 4px", display: "flex", zIndex: 40,
          }}>
            {[0.5, 1, 2, 5].map(z => (
              <button key={z} onClick={() => setZoom(z)} style={{
                minWidth: 34, height: 26, borderRadius: 18, border: "none", cursor: "pointer",
                background: zoom === z ? "rgba(255,255,255,0.14)" : "transparent",
                color: zoom === z ? INK.bone : INK.smoke,
                fontSize: 10, fontWeight: zoom === z ? 600 : 400, transition: "all .2s",
              }}>{z}×</button>
            ))}
          </div>

          {/* ── ORBITAL RING ── */}
          <OrbitalRing mode={mode} onModeChange={(id) => { setMode(id); if (isRecording) setRecording(false); }} />

          {/* ── Bottom bar: gallery | shutter | AI ── */}
          <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", zIndex: 40 }}>
            {/* Gallery */}
            <button onClick={() => setView("gallery")} style={{
              width: 50, height: 50, borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${INK.rim}`,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
              </svg>
              {captures.length > 0 && (
                <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: INK.gold, color: "#000", fontSize: 8, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid " + INK.void }}>{captures.length}</div>
              )}
            </button>

            {/* Pulse shutter */}
            <PulseShutter mode={mode} isRecording={isRecording} onPress={handleShutter} />

            {/* AI */}
            <button onClick={() => setView("chat")} style={{
              width: 50, height: 50, borderRadius: 14,
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${INK.rim}`,
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span style={{ fontSize: 7, color: INK.gold, fontWeight: 600, letterSpacing: .5 }}>IA</span>
            </button>
          </div>

          {/* Doc / QR export */}
          {(mode === "document" || mode === "qr") && (
            <button onClick={handleExport} style={{
              position: "absolute", bottom: 210, left: "50%", transform: "translateX(-50%)",
              padding: "7px 18px", borderRadius: 18, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, zIndex: 40, whiteSpace: "nowrap",
              background: exportDone ? "rgba(52,199,89,0.2)" : "rgba(255,255,255,0.1)",
              backdropFilter: "blur(16px)",
              fontSize: 11, fontWeight: 500, fontFamily: "inherit",
              color: exportDone ? "#34C759" : "rgba(255,255,255,0.7)",
              transition: "all .3s",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              {exportDone ? "Enviado ao Drive" : "Exportar para Drive"}
            </button>
          )}
        </>)}

        {/* ════ LANGUAGE PICKER ════ */}
        {view === "langpicker" && (
          <div style={{ position: "absolute", inset: 0, background: INK.deep, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "56px 18px 14px", borderBottom: `1px solid ${INK.rim}`, display: "flex", alignItems: "center", gap: 13, flexShrink: 0 }}>
              <button onClick={() => setView("camera")} style={{ width: 34, height: 34, borderRadius: 9, background: INK.lift, border: "none", color: INK.ash, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
              <div style={{ fontSize: 16, fontWeight: 600, color: INK.bone }}>{langPickerFor === "translate" ? "Traduzir para" : "Idioma das legendas"}</div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {LANGUAGES.map(lang => {
                const active = langPickerFor === "translate" ? targetLang === lang.code : captionLang === lang.code;
                return (
                  <button key={lang.code} onClick={() => {
                    if (langPickerFor === "translate") setTargetLang(lang.code);
                    else setCaptionLang(lang.code);
                    setView("camera");
                  }} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "15px 18px", background: active ? INK.goldGlow : "transparent",
                    border: "none", borderBottom: `1px solid ${INK.rim}`,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{lang.flag}</span>
                      <span style={{ fontSize: 15, color: active ? INK.gold : INK.bone, fontWeight: active ? 600 : 400 }}>{lang.label}</span>
                    </div>
                    {active && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={INK.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ════ CHAT VIEW ════ */}
        {view === "chat" && (
          <div style={{ position: "absolute", inset: 0, background: INK.deep, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "56px 18px 14px", borderBottom: `1px solid ${INK.rim}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: INK.surface }}>
              <button onClick={() => setView("camera")} style={{ width: 34, height: 34, borderRadius: 9, background: INK.lift, border: "none", color: INK.ash, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: INK.goldGlow, border: `1px solid ${INK.goldD}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="1.5"/><circle cx="12" cy="20" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: INK.bone }}>JOVI IA</div>
                <div style={{ fontSize: 11, color: INK.smoke }}>Configuro tudo por você</div>
              </div>
              {pendingMode && (
                <button onClick={applyPending} style={{ marginLeft: "auto", padding: "6px 14px", background: INK.goldGlow, border: `1px solid ${INK.goldD}44`, borderRadius: 18, fontSize: 12, color: INK.gold, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
                  Aplicar ›
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
              {chat.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.isUser ? "flex-end" : "flex-start", animation: "fadeUp .3s ease" }}>
                  {!msg.isUser && (
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: INK.goldGlow, border: `1px solid ${INK.goldD}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 7, alignSelf: "flex-end" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={INK.gold} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="1.5"/><circle cx="12" cy="20" r="1.5"/><circle cx="4" cy="12" r="1.5"/><circle cx="20" cy="12" r="1.5"/></svg>
                    </div>
                  )}
                  <div style={{ maxWidth: "76%", padding: "10px 13px", background: msg.isUser ? INK.lift : INK.surface, border: `1px solid ${INK.rim}`, borderRadius: msg.isUser ? "15px 15px 3px 15px" : "15px 15px 15px 3px", fontSize: 13, color: INK.bone, lineHeight: 1.55 }}>
                    {msg.text}
                    {msg.suggestedMode && pendingMode?.mode === msg.suggestedMode && (
                      <button onClick={applyPending} style={{ marginTop: 8, width: "100%", padding: "7px 0", background: INK.goldGlow, border: `1px solid ${INK.goldD}35`, borderRadius: 9, fontSize: 12, color: INK.gold, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontFamily: "inherit" }}>
                        Ir para {MODES.find(m => m.id === msg.suggestedMode)?.label} →
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {aiTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: INK.goldGlow, border: `1px solid ${INK.goldD}35`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, border: `1.5px solid ${INK.goldD}40`, borderTopColor: INK.gold, borderRadius: "50%", animation: "spin .7s linear infinite" }} />
                  </div>
                  <div style={{ display: "flex", gap: 4, padding: "10px 13px", background: INK.surface, border: `1px solid ${INK.rim}`, borderRadius: "15px 15px 15px 3px" }}>
                    {[0, 1, 2].map(j => <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: INK.mist, animation: `blink 1.1s ease ${j * .2}s infinite` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div ref={suggRef} style={{ padding: "6px 14px", overflowX: "auto", display: "flex", gap: 6, flexShrink: 0, WebkitOverflowScrolling: "touch" }} {...bindDrag(suggRef)}>
              {SUGG.map((s, i) => (
                <button key={i} onClick={() => sendChat(s)} style={{ flexShrink: 0, padding: "7px 13px", background: INK.surface, border: `1px solid ${INK.rim}`, borderRadius: 18, fontSize: 11, color: INK.ash, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>{s}</button>
              ))}
            </div>

            <div style={{ padding: "8px 14px 32px", background: INK.surface, borderTop: `1px solid ${INK.rim}`, display: "flex", gap: 8, flexShrink: 0, alignItems: "center" }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") sendChat(chatInput); }} placeholder="O que você quer fazer?" style={{ flex: 1, border: "none", outline: "none", background: INK.lift, borderRadius: 22, padding: "10px 16px", fontSize: 13, color: INK.bone, caretColor: INK.gold }} />
              <button onClick={() => sendChat(chatInput)} style={{ width: 38, height: 38, borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, background: chatInput.trim() ? INK.gold : INK.lift, color: chatInput.trim() ? "#000" : INK.mist, transition: "all .2s", flexShrink: 0, fontFamily: "inherit" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* ════ GALLERY ════ */}
        {view === "gallery" && (
          <div style={{ position: "absolute", inset: 0, background: INK.deep, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "56px 18px 14px", borderBottom: `1px solid ${INK.rim}`, display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: INK.surface }}>
              <button onClick={() => setView("camera")} style={{ width: 34, height: 34, borderRadius: 9, background: INK.lift, border: "none", color: INK.ash, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
              <div style={{ fontSize: 16, fontWeight: 600, color: INK.bone }}>Capturas</div>
              {captures.length > 0 && <div style={{ marginLeft: "auto", padding: "3px 10px", background: INK.lift, borderRadius: 9, fontSize: 11, color: INK.ash, fontWeight: 500 }}>{captures.length}</div>}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              {captures.length === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: INK.mist, paddingTop: 80 }}>
                  <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <span style={{ fontSize: 13 }}>Nenhuma captura ainda</span>
                  <button onClick={() => setView("camera")} style={{ padding: "7px 18px", background: INK.lift, border: "none", borderRadius: 10, color: INK.ash, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Abrir câmera</button>
                </div>
              ) : captures.map(cap => (
                <div key={cap.id} style={{ background: INK.surface, border: `1px solid ${INK.rim}`, borderRadius: 14, padding: "13px 15px", display: "flex", alignItems: "center", gap: 13, animation: "fadeUp .3s ease" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: INK.lift, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INK.smoke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: INK.bone }}>{cap.mode}</div>
                    <div style={{ fontSize: 11, color: INK.smoke, marginTop: 2 }}>{cap.time}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                      {cap.tags.map((t, j) => <span key={j} style={{ fontSize: 9, color: INK.mist, background: INK.lift, borderRadius: 5, padding: "1px 6px", fontWeight: 500, letterSpacing: .4 }}>{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
