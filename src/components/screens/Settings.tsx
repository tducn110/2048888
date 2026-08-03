import Button from "@/components/ui/Button";
import ThemedBackButton from "@/components/ui/ThemedBackButton";
import { Music, Settings as SettingsIcon, Volume2, VolumeX } from "lucide-react";

interface SettingsProps {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onMusicChange: (enabled: boolean) => void;
  onSfxChange: (enabled: boolean) => void;
  onBack: () => void;
}

export default function Settings({ musicEnabled, sfxEnabled, onMusicChange, onSfxChange, onBack }: SettingsProps) {
  return (
    <div
      style={{
        background: "var(--cream-card)",
        borderRadius: 24,
        padding: "clamp(20px, 6vw, 32px) clamp(14px, 5vw, 24px)",
        border: "2px solid rgba(42,36,24,0.14)",
        boxShadow: "0 14px 40px rgba(42,36,24,0.18), 0 2px 0 rgba(255,255,255,0.6) inset",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        position: "relative",
        width: "100%",
        maxHeight: "calc(100dvh - 20px - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, minWidth: 0 }}>
        <SettingsIcon size={28} color="var(--ink-dark)" />
        <h1
          style={{
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(24px, 5vw, 28px)",
            color: "var(--ink-dark)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Cài Đặt
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "16px",
          background: "rgba(138,125,101,0.08)",
          borderRadius: 16
        }}>
          <div style={{ fontWeight: 600, color: "var(--ink-dark)", display: "flex", alignItems: "center", gap: 8, minWidth: 0, lineHeight: 1.25 }}>
            {musicEnabled ? <Music size={20} /> : <VolumeX size={20} />}
            Nhạc nền
          </div>
          <Button 
            variant={musicEnabled ? "primary" : "secondary"} 
            size="sm" 
            onClick={() => onMusicChange(!musicEnabled)}
          >
            {musicEnabled ? "Bật" : "Tắt"}
          </Button>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          padding: "16px",
          background: "rgba(138,125,101,0.08)",
          borderRadius: 16
        }}>
          <div style={{ fontWeight: 600, color: "var(--ink-dark)", display: "flex", alignItems: "center", gap: 8, minWidth: 0, lineHeight: 1.25 }}>
            {sfxEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            Hiệu ứng âm thanh
          </div>
          <Button 
            variant={sfxEnabled ? "primary" : "secondary"} 
            size="sm" 
            onClick={() => onSfxChange(!sfxEnabled)}
          >
            {sfxEnabled ? "Bật" : "Tắt"}
          </Button>
        </div>
      </div>

      <ThemedBackButton onClick={onBack} size="md" style={{ marginTop: 8 }} />
    </div>
  );
}
