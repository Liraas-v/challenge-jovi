import { useRef, useEffect } from "react";
import { MODES, INK } from "../constants/theme";

/**
 * Barra de modos horizontal, arrastável e responsiva.
 * Deslize para os lados ou toque em um modo para selecionar.
 */
export function ModeBar({ mode, onModeChange }) {
  const scrollRef = useRef(null);

  const modeIdx = MODES.findIndex((m) => m.id === mode);

  // Centralizar o modo ativo no scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const item = el.querySelector("[data-active='true']");
    if (item) {
      item.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [mode]);

  return (
    <div
      ref={scrollRef}
      style={{
        position: "absolute",
        bottom: 84,
        left: 0,
        right: 0,
        height: 44,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: 4,
        overflowX: "auto",
        overflowY: "hidden",
        padding: "0 12px",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      className="mode-bar-scroll"
    >
      {MODES.map((m) => {
        const isActive = m.id === mode;
        return (
          <button
            key={m.id}
            data-active={isActive}
            onClick={() => onModeChange(m.id)}
            style={{
              flexShrink: 0,
              scrollSnapAlign: "center",
              minWidth: 72,
              height: 36,
              padding: "0 12px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
              color: isActive ? INK.bone : INK.smoke,
              fontSize: isActive ? 11 : 10,
              fontWeight: isActive ? 600 : 400,
              transition: "background 0.2s, color 0.2s",
              fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{m.icon}</span>
            <span style={{ whiteSpace: "nowrap" }}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
