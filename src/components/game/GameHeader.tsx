import Mascot from "./Mascot";

export default function GameHeader({ bgId }: { bgId: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", pointerEvents: "none" }}>
      <div 
        style={{ 
          width: "clamp(64px, min(28vw, 18dvh), 118px)",
          height: "clamp(64px, min(28vw, 18dvh), 118px)",
          minWidth: 0,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 3,
        }}
      >
        <Mascot width="100%" height="100%" themeId={bgId} />
      </div>
    </div>
  );
}
