import { INK } from "../constants/theme";

export function Scene({
  mode,
  scanY,
  isRecording,
  captionsOn,
  captionText,
  translatedLines,
  translating,
}) {
  const bg = {
    photo: "radial-gradient(ellipse at 55% 38%, #1c2738 0%, #070c14 100%)",
    video: "radial-gradient(ellipse at 50% 40%, #160d22 0%, #060408 100%)",
    portrait: "radial-gradient(ellipse at 50% 24%, #0e1e32 0%, #060c18 100%)",
    document: "radial-gradient(ellipse at 50% 52%, #141c28 0%, #080e18 100%)",
    night: "radial-gradient(ellipse at 50% 32%, #06041a 0%, #010208 100%)",
    cinema: "#070808",
    slow: "radial-gradient(ellipse at 50% 50%, #0c1022 0%, #04060c 100%)",
    pano: "linear-gradient(180deg, #081422 0%, #0e2030 45%, #0a1a12 72%, #04080a 100%)",
    qr: "radial-gradient(ellipse at 50% 50%, #0e1614 0%, #040806 100%)",
    translate: "radial-gradient(ellipse at 50% 40%, #0d0d0f 0%, #050506 100%)",
    object: "radial-gradient(ellipse at 50% 44%, #0e1218 0%, #040608 100%)",
    pro: "#080a0e",
  }[mode] || "#080a0e";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: bg,
        overflow: "hidden",
      }}
    >
      {mode === "night" &&
        [...Array(42)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${2 + Math.random() * 60}%`,
              left: `${Math.random() * 100}%`,
              width: Math.random() * 1.5 + 0.5,
              height: Math.random() * 1.5 + 0.5,
              borderRadius: "50%",
              background: "#fff",
              opacity: Math.random() * 0.55 + 0.15,
            }}
          />
        ))}

      {mode === "portrait" && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 145,
            height: 182,
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "50%",
          }}
        />
      )}

      {mode === "document" && (
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform:
                "translate(-50%,-52%) perspective(600px) rotateX(8deg) rotateZ(-1.5deg)",
              width: 190,
              height: 244,
              background: "linear-gradient(145deg, #f4efe5, #ece7d6)",
              borderRadius: 3,
              boxShadow:
                "0 18px 55px rgba(0,0,0,0.78), 0 2px 8px rgba(0,0,0,0.4)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {[100, 68, 86, 56, 92, 74, 80, 50, 88, 64].map((w, i) => (
              <div
                key={i}
                style={{
                  height: i === 0 ? 8 : 5,
                  width: `${w}%`,
                  background: i === 0 ? "#aaa" : "#d2cdc2",
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
          {[
            { top: "12%", left: "12%", bT: 1, bL: 1 },
            { top: "12%", right: "12%", bT: 1, bR: 1 },
            { bottom: "12%", left: "12%", bB: 1, bL: 1 },
            { bottom: "12%", right: "12%", bB: 1, bR: 1 },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 20,
                height: 20,
                ...(s.top ? { top: s.top } : {}),
                ...(s.bottom ? { bottom: s.bottom } : {}),
                ...(s.left ? { left: s.left } : {}),
                ...(s.right ? { right: s.right } : {}),
                borderTop: s.bT
                  ? "1.5px solid rgba(255,255,255,0.55)"
                  : undefined,
                borderBottom: s.bB
                  ? "1.5px solid rgba(255,255,255,0.55)"
                  : undefined,
                borderLeft: s.bL
                  ? "1.5px solid rgba(255,255,255,0.55)"
                  : undefined,
                borderRight: s.bR
                  ? "1.5px solid rgba(255,255,255,0.55)"
                  : undefined,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              left: "12%",
              right: "12%",
              top: `${scanY}%`,
              height: 1.5,
              background:
                "linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />
        </>
      )}

      {mode === "translate" && (
        <>
          <div
            style={{
              position: "absolute",
              top: "13%",
              left: "10%",
              right: "10%",
              background: "rgba(244,239,228,0.93)",
              borderRadius: 4,
              padding: "14px 15px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
            }}
          >
            {translating ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  justifyContent: "center",
                  padding: "8px 0",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(0,0,0,0.1)",
                    borderTopColor: INK.accent,
                    borderRadius: "50%",
                    animation: "spin .8s linear infinite",
                  }}
                />
                <span
                  style={{ fontSize: 12, color: "rgba(0,0,0,0.45)" }}
                >
                  Traduzindo...
                </span>
              </div>
            ) : (
              translatedLines.map((line, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: i < translatedLines.length - 1 ? 10 : 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "rgba(0,0,0,0.28)",
                      fontStyle: "italic",
                      marginBottom: 2,
                    }}
                  >
                    {line.original}
                  </div>
                  <span
                    style={{
                      background: "rgba(10,132,255,0.25)",
                      color: "#000",
                      fontWeight: 600,
                      padding: "1px 5px",
                      borderRadius: 3,
                      fontSize: 12,
                    }}
                  >
                    {line.translated || line.original}
                  </span>
                </div>
              ))
            )}
          </div>
          {[
            { top: "10%", left: "8%", bT: 1, bL: 1 },
            { top: "10%", right: "8%", bT: 1, bR: 1 },
            { bottom: "32%", left: "8%", bB: 1, bL: 1 },
            { bottom: "32%", right: "8%", bB: 1, bR: 1 },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 18,
                height: 18,
                ...(s.top ? { top: s.top } : {}),
                ...(s.bottom ? { bottom: s.bottom } : {}),
                ...(s.left ? { left: s.left } : {}),
                ...(s.right ? { right: s.right } : {}),
                borderTop: s.bT ? `1.5px solid ${INK.accent}99` : undefined,
                borderBottom: s.bB ? `1.5px solid ${INK.accent}99` : undefined,
                borderLeft: s.bL ? `1.5px solid ${INK.accent}99` : undefined,
                borderRight: s.bR ? `1.5px solid ${INK.accent}99` : undefined,
              }}
            />
          ))}
        </>
      )}

      {mode === "qr" && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-58%)",
            width: 180,
            height: 180,
          }}
        >
          {[
            { top: 0, left: 0, bT: 1, bL: 1 },
            { top: 0, right: 0, bT: 1, bR: 1 },
            { bottom: 0, left: 0, bB: 1, bL: 1 },
            { bottom: 0, right: 0, bB: 1, bR: 1 },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 22,
                height: 22,
                ...(s.top !== undefined ? { top: s.top } : {}),
                ...(s.bottom !== undefined ? { bottom: s.bottom } : {}),
                ...(s.left !== undefined ? { left: s.left } : {}),
                ...(s.right !== undefined ? { right: s.right } : {}),
                borderTop: s.bT
                  ? "2.5px solid rgba(255,255,255,0.7)"
                  : undefined,
                borderBottom: s.bB
                  ? "2.5px solid rgba(255,255,255,0.7)"
                  : undefined,
                borderLeft: s.bL
                  ? "2.5px solid rgba(255,255,255,0.7)"
                  : undefined,
                borderRight: s.bR
                  ? "2.5px solid rgba(255,255,255,0.7)"
                  : undefined,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.16)",
              fontSize: 10,
              letterSpacing: 2,
              fontWeight: 500,
            }}
          >
            QR / BARCODE
          </div>
        </div>
      )}

      {mode === "cinema" && (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "13%",
              background: "#000",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "13%",
              background: "#000",
            }}
          />
        </>
      )}

      {mode === "pano" && (
        <>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 1,
              background: "rgba(255,255,255,0.12)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 1.5,
              height: 16,
              background: "rgba(255,255,255,0.5)",
              borderRadius: 1,
            }}
          />
        </>
      )}

      {mode === "object" && (
        <div
          style={{
            position: "absolute",
            top: "14%",
            left: "14%",
            right: "14%",
            height: "50%",
            border: "1px dashed rgba(255,255,255,0.22)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: -22,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(10px)",
              borderRadius: 18,
              padding: "2px 12px",
              fontSize: 10,
              color: "rgba(255,255,255,0.6)",
              whiteSpace: "nowrap",
            }}
          >
            Apontando para objeto...
          </div>
        </div>
      )}

      {mode === "pro" &&
        [33, 66].map((p) => (
          <div key={p}>
            <div
              style={{
                position: "absolute",
                top: `${p}%`,
                left: 0,
                right: 0,
                height: 1,
                background: "rgba(255,255,255,0.04)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${p}%`,
                top: 0,
                bottom: 0,
                width: 1,
                background: "rgba(255,255,255,0.04)",
              }}
            />
          </div>
        ))}

      {mode === "slow" && (
        <div
          style={{
            position: "absolute",
            top: "8%",
            right: "6%",
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            borderRadius: 8,
            padding: "3px 9px",
            fontSize: 10,
            color: "rgba(255,255,255,0.55)",
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          240 FPS
        </div>
      )}

      {mode === "video" && isRecording && (
        <div
          style={{
            position: "absolute",
            top: "8%",
            right: "6%",
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
            borderRadius: 18,
            padding: "3px 10px",
          }}
        >
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
              fontSize: 10,
              color: "rgba(255,255,255,0.8)",
              fontWeight: 600,
              fontFamily: "monospace",
            }}
          >
            REC
          </span>
        </div>
      )}

      {mode === "video" && captionsOn && captionText && (
        <div
          style={{
            position: "absolute",
            bottom: "22%",
            left: "8%",
            right: "8%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              borderRadius: 6,
              padding: "5px 14px",
              fontSize: 13,
              color: "#fff",
              fontWeight: 400,
              lineHeight: 1.4,
              textAlign: "center",
              maxWidth: "90%",
            }}
          >
            {captionText}
          </div>
        </div>
      )}
    </div>
  );
}
