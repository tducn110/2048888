import Mascot from "./Mascot";

export default function GameHeader({ bgId }: { bgId: number }) {
  const activeIndex = bgId - 1;

  const renderNode = (id: number, size: number) => {
    const imgStyle = { width: "100%", height: "100%", objectFit: "contain" as const };
    const base = import.meta.env.BASE_URL;
    switch(id) {
      case 0: return <Mascot width={size} height={size} />;
      case 1: return <img src={`${base}assets/optimized/035_avatar_dogoin_nobg-180.webp`} width={90} height={90} decoding="async" fetchPriority="high" className="mascot-animate" alt="Yellow Dog" style={imgStyle} />;
      case 2: return <img src={`${base}assets/optimized/016_avatar_banhtung_nobg-180.webp`} width={90} height={90} decoding="async" fetchPriority="high" className="mascot-animate" alt="Bamboo Gift" style={imgStyle} />;
      case 3: return <img src={`${base}assets/optimized/017_avatar_tiguayel_nobg-180.webp`} width={90} height={90} decoding="async" fetchPriority="high" className="mascot-animate" alt="Orange Tabby" style={imgStyle} />;
      default: return null;
    }
  };

  const mascotsConfig = [
    { id: 0, bg: "var(--mascot-yellow)" },
    { id: 1, bg: "var(--theme-dog)" },
    { id: 2, bg: "var(--theme-bamboo)" },
    { id: 3, bg: "var(--theme-cat)" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Active Mascot Display */}
      <div 
        style={{ 
          width: 90, 
          height: 90, 
          minWidth: 90,
          flexShrink: 0,
          borderRadius: 20, 
          background: mascotsConfig[activeIndex].bg, 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          position: "relative"
        }}
      >
        {renderNode(activeIndex, 90)}
      </div>
    </div>
  );
}
