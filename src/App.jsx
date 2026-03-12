import { useState, useEffect, useRef, useCallback } from "react";
import {
  INK,
  MODES,
  LANGUAGES,
  SAMPLE_SIGNS,
  CAPTION_LINES,
} from "./constants/theme";
import { useInterval } from "./hooks/useInterval";
import { fmt } from "./utils/format";
import { callAI, translateWithAI } from "./services/ai";
import { ModeBar } from "./components/ModeBar";
import { PulseShutter } from "./components/PulseShutter";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { ContextBloom } from "./components/ContextBloom";
import { Scene } from "./components/Scene";
import { globalStyles } from "./styles/global";

const SUGG = [
  "Retrato profissional",
  "Traduzir cartaz",
  "Escanear caderno",
  "Modo noturno",
  "Câmera lenta",
  "Reconhecer objeto",
];

export default function App() {
  const [mode, setMode] = useState("photo");
  const [view, setView] = useState("camera");
  const [zoom, setZoom] = useState(1);
  const [flash, setFlash] = useState("auto");
  const [scanY, setScanY] = useState(15);
  const [metrics, setMetrics] = useState({ luz: 82, foco: 90, estab: 87 });
  const [captures, setCaptures] = useState([]);
  const [isRecording, setRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [captionsOn, setCaptions] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [captionLang, setCaptionLang] = useState("pt-BR");
  const [targetLang, setTargetLang] = useState("en");
  const [langPickerFor, setLangFor] = useState("translate");
  const [translatedLines, setTranslated] = useState(
    SAMPLE_SIGNS.map((s) => ({ original: s, translated: "" }))
  );
  const [translating, setTranslating] = useState(false);
  const [aiSettings, setAiSettings] = useState({ iso: 100, ev: 0 });
  const [chat, setChat] = useState([
    {
      text: "Olá! Diga o que quer fazer que configuro tudo — você decide se aplica.",
      isUser: false,
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [pendingMode, setPending] = useState(null);
  const [notif, setNotif] = useState(null);
  const [exportDone, setExportDone] = useState(false);
  const [flashFrame, setFlashFrame] = useState(false);

  const chatEndRef = useRef(null);
  const suggRef = useRef(null);
  const captionIdx = useRef(0);

  const cm = MODES.find((m) => m.id === mode) || MODES[0];

  const {
    caption: liveCaption,
    supported: speechSupported,
  } = useSpeechRecognition(
    mode === "video" && captionsOn && isRecording,
    captionLang
  );
  const tLangLabel =
    LANGUAGES.find((l) => l.code === targetLang)?.label || targetLang;

  useInterval(
    () =>
      setScanY((y) => {
        const n = y + 1.4;
        return n > 84 ? 15 : n;
      }),
    16
  );

  useInterval(
    () =>
      setMetrics((m) => ({
        luz: Math.min(100, Math.max(20, m.luz + (Math.random() - 0.5) * 4)),
        foco: Math.min(100, Math.max(40, m.foco + (Math.random() - 0.5) * 3)),
        estab: Math.min(
          100,
          Math.max(50, m.estab + (Math.random() - 0.5) * 3)
        ),
      })),
    1500
  );

  useEffect(() => {
    if (!isRecording) {
      setRecTime(0);
      return;
    }
    const id = setInterval(() => setRecTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  useInterval(() => {
    if (mode === "video" && isRecording && captionsOn && !speechSupported) {
      captionIdx.current =
        (captionIdx.current + 1) % CAPTION_LINES.length;
      setCaptionText(CAPTION_LINES[captionIdx.current]);
    } else if (!(mode === "video" && captionsOn && isRecording && speechSupported))
      setCaptionText("");
  }, 3400);

  useEffect(() => {
    if (mode !== "translate") return;
    let cancelled = false;
    async function run() {
      setTranslating(true);
      const results = await Promise.all(
        SAMPLE_SIGNS.map(async (orig) => {
          const t = await translateWithAI(orig, tLangLabel);
          return { original: orig, translated: t };
        })
      );
      if (!cancelled) {
        setTranslated(results);
        setTranslating(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [mode, targetLang, tLangLabel]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (mode === "translate" && targetLang === "pt-BR")
      setTargetLang("en");
  }, [mode]);

  const notify = useCallback((msg) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 2600);
  }, []);

  const handleShutter = useCallback(() => {
    if (mode === "video") {
      if (!isRecording) {
        setRecording(true);
        notify("Gravação iniciada");
      } else {
        setRecording(false);
        setCaptures((c) => [
          {
            id: Date.now(),
            mode: "Vídeo",
            time: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            tags: ["VÍDEO", "4K", captionsOn ? "CC" : null].filter(Boolean),
          },
          ...c,
        ]);
        notify("Vídeo salvo");
      }
      return;
    }
    setFlashFrame(true);
    setTimeout(() => setFlashFrame(false), 220);
    setCaptures((c) => [
      {
        id: Date.now(),
        mode: cm.label,
        time: new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        tags: [mode.toUpperCase()],
      },
      ...c,
    ]);
    notify(`${cm.label} capturada`);
  }, [mode, isRecording, cm, captionsOn, notify]);

  const handleExport = useCallback(() => {
    const content =
      mode === "document"
        ? "Documento escaneado — JoviLens\n\nConteúdo do documento seria exportado aqui."
        : "QR/Barcode — JoviLens\n\nConteúdo lido seria exportado aqui.";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "document" ? "documento-jovilens.txt" : "qr-jovilens.txt";
    a.click();
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3500);
    notify("Arquivo baixado");
  }, [notify, mode]);

  const sendChat = useCallback(
    async (text) => {
      if (!text.trim()) return;
      setChat((c) => [...c, { text, isUser: true }]);
      setChatInput("");
      setAiTyping(true);
      const result = await callAI(text, tLangLabel);
      if (result.suggestedMode)
        setPending({
          mode: result.suggestedMode,
          label:
            MODES.find((m) => m.id === result.suggestedMode)?.label ||
            result.suggestedMode,
        });
      setChat((c) => [
        ...c,
        {
          text: result.text,
          isUser: false,
          suggestedMode: result.suggestedMode,
        },
      ]);
      setAiTyping(false);
    },
    [tLangLabel]
  );

  const applyPending = useCallback(() => {
    if (!pendingMode) return;
    setMode(pendingMode.mode);
    notify(`${pendingMode.label} aplicado. Toque em ‹ para voltar à câmera.`);
    setPending(null);
  }, [pendingMode, notify]);

  const bindDrag = (ref) => ({
    onMouseDown: (e) => {
      const el = ref.current;
      if (!el) return;
      let startX = e.pageX,
        startScroll = el.scrollLeft;
      const move = (ev) => {
        el.scrollLeft = startScroll - (ev.pageX - startX);
      };
      const up = () => {
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    },
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {globalStyles}

      <div
        style={{
          width: 375,
          height: 812,
          background: INK.void,
          borderRadius: 40,
          border: `2px solid ${INK.rim}`,
          boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
          position: "relative",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 11,
            left: "50%",
            transform: "translateX(-50%)",
            width: 122,
            height: 32,
            background: "#000",
            borderRadius: 18,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            border: "1px solid #0e0e10",
          }}
        >
          {mode === "video" && isRecording ? (
            <>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#FF3B30",
                  animation: "blink 1s infinite",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                {fmt(recTime)}
              </span>
            </>
          ) : view === "chat" ? (
            <>
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: INK.accent,
                  animation: "blink 2.5s infinite",
                }}
              />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                IA ativa
              </span>
            </>
          ) : (
            <span
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.32)",
                fontWeight: 500,
                letterSpacing: 0.2,
              }}
            >
              {cm.label}
            </span>
          )}
        </div>

        {/* Status bar */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 22,
            right: 22,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 150,
            paddingTop: 1,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            {new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
              5G
            </span>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
              <rect x="0" y="7" width="3" height="3" rx=".5" fill="rgba(255,255,255,0.85)" />
              <rect x="4" y="4.5" width="3" height="5.5" rx=".5" fill="rgba(255,255,255,0.85)" />
              <rect x="8" y="2" width="3" height="8" rx=".5" fill="rgba(255,255,255,0.85)" />
              <rect x="12" y="0" width="3" height="10" rx=".5" fill="rgba(255,255,255,0.85)" />
            </svg>
            <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
              <rect x=".5" y=".5" width="16" height="9" rx="2" stroke="rgba(255,255,255,0.4)" strokeWidth=".9" />
              <rect x="1.5" y="1.5" width="12" height="7" rx="1.5" fill="rgba(255,255,255,0.82)" />
              <path d="M17.5 3.5v3a1.5 1.5 0 000-3z" fill="rgba(255,255,255,0.4)" />
            </svg>
          </div>
        </div>

        {notif && (
          <div
            style={{
              position: "absolute",
              bottom: 108,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(22,24,30,0.88)",
              backdropFilter: "blur(20px)",
              borderRadius: 22,
              padding: "8px 18px",
              zIndex: 500,
              whiteSpace: "nowrap",
              animation: "toastUp .25s ease",
              border: `1px solid ${INK.rim}`,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.8)",
                fontWeight: 500,
              }}
            >
              {notif}
            </span>
          </div>
        )}

        {view === "camera" && (
          <>
            <Scene
              mode={mode}
              scanY={scanY}
              isRecording={isRecording}
              captionsOn={captionsOn}
              captionText={
                mode === "video" &&
                captionsOn &&
                isRecording &&
                speechSupported &&
                liveCaption
                  ? liveCaption
                  : captionText
              }
              translatedLines={translatedLines}
              translating={translating}
            />

            {flashFrame && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#fff",
                  zIndex: 100,
                  pointerEvents: "none",
                  animation: "flash .22s ease forwards",
                }}
              />
            )}

            <ContextBloom
              flash={flash}
              onFlashChange={setFlash}
              mode={mode}
              captionsOn={captionsOn}
              onCaptionsToggle={() => setCaptions((x) => !x)}
              onLangOpen={() => {
                setLangFor("translate");
                setView("langpicker");
              }}
            />

            {mode === "translate" && (
              <button
                onClick={() => {
                  setLangFor("translate");
                  setView("langpicker");
                }}
                style={{
                  position: "absolute",
                  top: 52,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 50,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  background: "rgba(28,28,30,0.9)",
                  border: `1px solid ${INK.rim}`,
                  borderRadius: 20,
                  color: INK.bone,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ opacity: 0.8 }}>Traduzir para</span>
                <span style={{ color: INK.accent, fontWeight: 600 }}>
                  {tLangLabel}
                </span>
                <span style={{ fontSize: 10, opacity: 0.7 }}>▼</span>
              </button>
            )}

            <div
              style={{
                position: "absolute",
                bottom: 206,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0,0,0,0.42)",
                backdropFilter: "blur(20px)",
                borderRadius: 20,
                padding: "3px 4px",
                display: "flex",
                zIndex: 40,
              }}
            >
              {[0.5, 1, 2, 5].map((z) => (
                <button
                  key={z}
                  onClick={() => setZoom(z)}
                  style={{
                    minWidth: 34,
                    height: 26,
                    borderRadius: 18,
                    border: "none",
                    cursor: "pointer",
                    background:
                      zoom === z ? "rgba(255,255,255,0.14)" : "transparent",
                    color: zoom === z ? INK.bone : INK.smoke,
                    fontSize: 10,
                    fontWeight: zoom === z ? 600 : 400,
                    transition: "all .2s",
                  }}
                >
                  {z}×
                </button>
              ))}
            </div>

            <ModeBar
              mode={mode}
              onModeChange={(id) => {
                setMode(id);
                if (isRecording) setRecording(false);
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 28,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 28px",
                zIndex: 40,
              }}
            >
              <button
                onClick={() => setView("gallery")}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${INK.rim}`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                {captures.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: INK.gold,
                      color: "#000",
                      fontSize: 8,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid " + INK.void,
                    }}
                  >
                    {captures.length}
                  </div>
                )}
              </button>

              <PulseShutter
                mode={mode}
                isRecording={isRecording}
                onPress={handleShutter}
              />

              <button
                onClick={() => setView("chat")}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${INK.rim}`,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  flexShrink: 0,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span
                  style={{
                    fontSize: 7,
                    color: INK.gold,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  IA
                </span>
              </button>
            </div>

            {(mode === "document" || mode === "qr") && (
              <button
                onClick={handleExport}
                style={{
                  position: "absolute",
                  bottom: 210,
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "7px 18px",
                  borderRadius: 18,
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  zIndex: 40,
                  whiteSpace: "nowrap",
                  background: exportDone
                    ? "rgba(52,199,89,0.2)"
                    : "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(16px)",
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  color: exportDone ? "#34C759" : "rgba(255,255,255,0.7)",
                  transition: "all .3s",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                {exportDone ? "Enviado ao Drive" : "Exportar para Drive"}
              </button>
            )}
          </>
        )}

        {view === "langpicker" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: INK.deep,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "56px 18px 14px",
                borderBottom: `1px solid ${INK.rim}`,
                display: "flex",
                alignItems: "center",
                gap: 13,
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setView("camera")}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: INK.lift,
                  border: "none",
                  color: INK.ash,
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ‹
              </button>
              <div style={{ fontSize: 16, fontWeight: 600, color: INK.bone }}>
                {langPickerFor === "translate"
                  ? "Traduzir para"
                  : "Idioma das legendas"}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {LANGUAGES.map((lang) => {
                const active =
                  langPickerFor === "translate"
                    ? targetLang === lang.code
                    : captionLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      if (langPickerFor === "translate")
                        setTargetLang(lang.code);
                      else setCaptionLang(lang.code);
                      setView("camera");
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "15px 18px",
                      background: active ? INK.goldGlow : "transparent",
                      border: "none",
                      borderBottom: `1px solid ${INK.rim}`,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{lang.flag}</span>
                      <span
                        style={{
                          fontSize: 15,
                          color: active ? INK.gold : INK.bone,
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {lang.label}
                      </span>
                    </div>
                    {active && (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={INK.gold}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === "chat" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: INK.deep,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "56px 18px 14px",
                borderBottom: `1px solid ${INK.rim}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
                background: INK.surface,
              }}
            >
              <button
                onClick={() => setView("camera")}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: INK.lift,
                  border: "none",
                  color: INK.ash,
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ‹
              </button>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: INK.goldGlow,
                  border: `1px solid ${INK.goldD}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={INK.gold}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="4" r="1.5" />
                  <circle cx="12" cy="20" r="1.5" />
                  <circle cx="4" cy="12" r="1.5" />
                  <circle cx="20" cy="12" r="1.5" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: INK.bone }}>
                  JOVI IA
                </div>
                <div style={{ fontSize: 11, color: INK.smoke }}>
                  Configuro tudo por você
                </div>
              </div>
              {pendingMode && (
                <button
                  onClick={applyPending}
                  style={{
                    marginLeft: "auto",
                    padding: "6px 14px",
                    background: INK.goldGlow,
                    border: `1px solid ${INK.goldD}44`,
                    borderRadius: 18,
                    fontSize: 12,
                    color: INK.gold,
                    fontWeight: 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  Aplicar ›
                </button>
              )}
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 14px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {chat.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: msg.isUser ? "flex-end" : "flex-start",
                    animation: "fadeUp .3s ease",
                  }}
                >
                  {!msg.isUser && (
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: INK.goldGlow,
                        border: `1px solid ${INK.goldD}35`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginRight: 7,
                        alignSelf: "flex-end",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={INK.gold}
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <circle cx="12" cy="4" r="1.5" />
                        <circle cx="12" cy="20" r="1.5" />
                        <circle cx="4" cy="12" r="1.5" />
                        <circle cx="20" cy="12" r="1.5" />
                      </svg>
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: "76%",
                      padding: "10px 13px",
                      background: msg.isUser ? INK.lift : INK.surface,
                      border: `1px solid ${INK.rim}`,
                      borderRadius: msg.isUser
                        ? "15px 15px 3px 15px"
                        : "15px 15px 15px 3px",
                      fontSize: 13,
                      color: INK.bone,
                      lineHeight: 1.55,
                    }}
                  >
                    {msg.text}
                    {msg.suggestedMode &&
                      pendingMode?.mode === msg.suggestedMode && (
                        <button
                          onClick={applyPending}
                          style={{
                            marginTop: 8,
                            width: "100%",
                            padding: "7px 0",
                            background: INK.goldGlow,
                            border: `1px solid ${INK.goldD}35`,
                            borderRadius: 9,
                            fontSize: 12,
                            color: INK.gold,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            fontFamily: "inherit",
                          }}
                        >
                          Ir para{" "}
                          {MODES.find((m) => m.id === msg.suggestedMode)
                            ?.label || ""}{" "}
                          →
                        </button>
                      )}
                  </div>
                </div>
              ))}
              {aiTyping && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: INK.goldGlow,
                      border: `1px solid ${INK.goldD}35`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        border: `1.5px solid ${INK.goldD}40`,
                        borderTopColor: INK.gold,
                        borderRadius: "50%",
                        animation: "spin .7s linear infinite",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      padding: "10px 13px",
                      background: INK.surface,
                      border: `1px solid ${INK.rim}`,
                      borderRadius: "15px 15px 15px 3px",
                    }}
                  >
                    {[0, 1, 2].map((j) => (
                      <div
                        key={j}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: INK.mist,
                          animation: `blink 1.1s ease ${j * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div
              ref={suggRef}
              style={{
                padding: "6px 14px",
                overflowX: "auto",
                overflowY: "hidden",
                display: "flex",
                gap: 6,
                flexShrink: 0,
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-x",
              }}
              {...bindDrag(suggRef)}
            >
              {SUGG.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendChat(s)}
                  style={{
                    flexShrink: 0,
                    padding: "7px 13px",
                    background: INK.surface,
                    border: `1px solid ${INK.rim}`,
                    borderRadius: 18,
                    fontSize: 11,
                    color: INK.ash,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    fontFamily: "inherit",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <div
              style={{
                padding: "8px 14px 32px",
                background: INK.surface,
                borderTop: `1px solid ${INK.rim}`,
                display: "flex",
                gap: 8,
                flexShrink: 0,
                alignItems: "center",
              }}
            >
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendChat(chatInput);
                }}
                placeholder="O que você quer fazer?"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: INK.lift,
                  borderRadius: 22,
                  padding: "10px 16px",
                  fontSize: 13,
                  color: INK.bone,
                  caretColor: INK.gold,
                }}
              />
              <button
                onClick={() => sendChat(chatInput)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  background: chatInput.trim() ? INK.gold : INK.lift,
                  color: chatInput.trim() ? "#000" : INK.mist,
                  transition: "all .2s",
                  flexShrink: 0,
                  fontFamily: "inherit",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {view === "gallery" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: INK.deep,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "56px 18px 14px",
                borderBottom: `1px solid ${INK.rim}`,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
                background: INK.surface,
              }}
            >
              <button
                onClick={() => setView("camera")}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: INK.lift,
                  border: "none",
                  color: INK.ash,
                  fontSize: 18,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ‹
              </button>
              <div style={{ fontSize: 16, fontWeight: 600, color: INK.bone }}>
                Capturas
              </div>
              {captures.length > 0 && (
                <div
                  style={{
                    marginLeft: "auto",
                    padding: "3px 10px",
                    background: INK.lift,
                    borderRadius: 9,
                    fontSize: 11,
                    color: INK.ash,
                    fontWeight: 500,
                  }}
                >
                  {captures.length}
                </div>
              )}
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {captures.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    color: INK.mist,
                    paddingTop: 80,
                  }}
                >
                  <svg
                    width="46"
                    height="46"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span style={{ fontSize: 13 }}>Nenhuma captura ainda</span>
                  <button
                    onClick={() => setView("camera")}
                    style={{
                      padding: "7px 18px",
                      background: INK.lift,
                      border: "none",
                      borderRadius: 10,
                      color: INK.ash,
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Abrir câmera
                  </button>
                </div>
              ) : (
                captures.map((cap) => (
                  <div
                    key={cap.id}
                    style={{
                      background: INK.surface,
                      border: `1px solid ${INK.rim}`,
                      borderRadius: 14,
                      padding: "13px 15px",
                      display: "flex",
                      alignItems: "center",
                      gap: 13,
                      animation: "fadeUp .3s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 11,
                        background: INK.lift,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={INK.smoke}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: INK.bone,
                        }}
                      >
                        {cap.mode}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: INK.smoke,
                          marginTop: 2,
                        }}
                      >
                        {cap.time}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          marginTop: 5,
                          flexWrap: "wrap",
                        }}
                      >
                        {cap.tags.map((t, j) => (
                          <span
                            key={j}
                            style={{
                              fontSize: 9,
                              color: INK.mist,
                              background: INK.lift,
                              borderRadius: 5,
                              padding: "1px 6px",
                              fontWeight: 500,
                              letterSpacing: 0.4,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
