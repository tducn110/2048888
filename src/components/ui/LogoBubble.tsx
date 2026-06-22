export default function LogoBubble({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, #f8c860, #d99820)",
        border: "2px solid #2a2418",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 2px 0 #8e4e22, inset 0 1px 0 rgba(255,255,255,0.4)",
      }}
    >
      <span
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: 800,
          fontSize: size * 0.45,
          color: "#fff",
          textShadow: "0 1px 2px rgba(42,36,24,0.4)",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        L
      </span>
    </div>
  );
}
