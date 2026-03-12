import { INK } from "../constants/theme";

export function PulseShutter({ mode, isRecording, onPress }) {
  const isVideo = mode === "video";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 40,
      }}
    >
      <button
        type="button"
        onClick={onPress}
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          border: `3px solid ${isVideo && isRecording ? INK.danger : "rgba(255,255,255,0.4)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          background: "transparent",
          transition: "border-color 0.25s, box-shadow 0.25s",
          boxShadow: isVideo && isRecording ? "0 0 0 2px rgba(255,59,48,0.3)" : "none",
          padding: 0,
          fontFamily: "inherit",
        }}
      >
        <span
          style={{
            width: 56,
            height: 56,
            borderRadius: isVideo && isRecording ? 8 : "50%",
            background:
              isVideo && isRecording ? INK.danger : "rgba(255,255,255,0.95)",
            transition: "border-radius 0.2s, background 0.2s",
          }}
        />
      </button>
    </div>
  );
}
