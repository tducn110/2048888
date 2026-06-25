import Mascot from "./Mascot";

export default function GameHeader({ bgId }: { bgId: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", pointerEvents: "none" }}>
      <div 
        style={{ 
          width: 118, 
          height: 118, 
          minWidth: 118,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 3,
        }}
      >
        <Mascot width={118} height={118} themeId={bgId} />
      </div>
    </div>
  );
}
