import { useState } from "react";
import { INK } from "../constants/theme";

/**
 * Controles rápidos mínimos: flash (foto/retrato), legendas (vídeo), idioma (traduzir).
 * Apenas botões com função real.
 */
export function ContextBloom({
  flash,
  onFlashChange,
  mode,
  captionsOn,
  onCaptionsToggle,
  onLangOpen,
}) {
  const [open, setOpen] = useState(false);

  const petals = [
    (mode === "photo" || mode === "portrait") && {
      icon: flash === "off" ? "⚡̸" : "⚡",
      label: { off: "Off", auto: "Auto", on: "On" }[flash],
      active: flash !== "off",
      action: () =>
        onFlashChange((f) => ({ off: "auto", auto: "on", on: "off" }[f])),
      angle: -90,
      dist: 56,
    },
    mode === "video" && {
      icon: "CC",
      label: captionsOn ? "Leg. ligada" : "Leg. desligada",
      active: captionsOn,
      action: onCaptionsToggle,
      angle: -45,
      dist: 56,
    },
    mode === "translate" && {
      icon: "A",
      label: "Idioma",
      active: true,
      action: onLangOpen,
      angle: -45,
      dist: 56,
    },
  ].filter(Boolean);

  if (petals.length === 0) return null;

  return (
    <div style={{ position: "absolute", top: 52, left: 16, zIndex: 60 }}>
      {open &&
        petals.map((petal, i) => {
          const rad = (petal.angle * Math.PI) / 180;
          const px = Math.cos(rad) * petal.dist;
          const py = Math.sin(rad) * petal.dist;
          return (
            <button
              key={i}
              onClick={() => {
                petal.action();
                setOpen(false);
              }}
              style={{
                position: "absolute",
                left: 18 + px,
                top: 18 + py,
                transform: "translate(-50%,-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: petal.active ? INK.accentDim : "rgba(28,28,30,0.9)",
                border: `1px solid ${petal.active ? INK.accent : INK.rim}`,
                color: petal.active ? INK.accent : INK.ash,
                fontSize: petal.icon === "CC" ? 9 : 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                zIndex: 60,
                fontFamily: "inherit",
              }}
            >
              {petal.icon}
            </button>
          );
        })}

      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: open ? INK.accentDim : "rgba(28,28,30,0.85)",
          border: `1px solid ${open ? INK.accent : INK.rim}`,
          color: open ? INK.accent : INK.ash,
          fontSize: 14,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
          zIndex: 61,
          fontFamily: "inherit",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
