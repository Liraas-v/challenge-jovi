import { MODES, INK } from "../constants/theme";

export function OrbitalRing({ mode, onModeChange }) {
  const modeIdx = MODES.findIndex((m) => m.id === mode);

  const getVisible = () => {
    const result = [];
    for (let i = -2; i <= 2; i++) {
      const idx = ((modeIdx + i) % MODES.length + MODES.length) % MODES.length;
      result.push({ ...MODES[idx], offset: i });
    }
    return result;
  };

  const visible = getVisible();
  const RADIUS = 148;
  const CENTER_X = 187;

  const offsetToAngle = (offset) => (offset / 2.5) * 58;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 84,
        left: 0,
        right: 0,
        height: 90,
        zIndex: 30,
        pointerEvents: "none",
      }}
    >
      <svg
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 160,
          overflow: "visible",
          pointerEvents: "none",
        }}
        viewBox="0 0 375 80"
      >
        <path
          d={`M ${CENTER_X - 155},80 A ${RADIUS} ${RADIUS} 0 0 1 ${CENTER_X + 155},80`}
          fill="none"
          stroke={INK.rim}
          strokeWidth="1"
          strokeDasharray="2 4"
          opacity="0.5"
        />
      </svg>

      {visible.map(({ id, label, icon, offset }) => {
        const angleRad = (offsetToAngle(offset) * Math.PI) / 180;
        const x = CENTER_X + RADIUS * Math.sin(angleRad);
        const y = 80 - RADIUS * (1 - Math.cos(angleRad));
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
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 3,
                  height: 3,
                  borderRadius: "50%",
                  background: INK.gold,
                  boxShadow: `0 0 8px ${INK.gold}`,
                }}
              />
            )}
            <span
              style={{
                fontSize: isActive ? 15 : 12,
                color: isActive ? INK.gold : INK.smoke,
                transition: "all 0.32s",
                lineHeight: 1,
              }}
            >
              {icon}
            </span>
            <span
              style={{
                fontSize: isActive ? 10 : 8.5,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? INK.bone : INK.smoke,
                letterSpacing: 0.3,
                textTransform: "uppercase",
                transition: "all 0.32s",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}

      <button
        onClick={() => {
          const prev = ((modeIdx - 1) % MODES.length + MODES.length) % MODES.length;
          onModeChange(MODES[prev].id);
        }}
        style={{
          position: "absolute",
          left: 18,
          bottom: 16,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: INK.mist,
          fontSize: 14,
          pointerEvents: "all",
          opacity: 0.6,
        }}
      >
        ‹
      </button>
      <button
        onClick={() => {
          const next = (modeIdx + 1) % MODES.length;
          onModeChange(MODES[next].id);
        }}
        style={{
          position: "absolute",
          right: 18,
          bottom: 16,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: INK.mist,
          fontSize: 14,
          pointerEvents: "all",
          opacity: 0.6,
        }}
      >
        ›
      </button>
    </div>
  );
}
