import { useState } from "react";
import Button from "@/components/ui/Button";
import { Settings as SettingsIcon, Volume2, VolumeX, Bell, BellOff } from "lucide-react";

interface SettingsProps {
  soundEnabled: boolean;
  onSoundChange: (enabled: boolean) => void;
  onBack: () => void;
}

export default function Settings({ soundEnabled, onSoundChange, onBack }: SettingsProps) {
  const [notifications, setNotifications] = useState(true);

  return (
    <div
      style={{
        background: "var(--cream-card)",
        borderRadius: 24,
        padding: "32px 24px",
        border: "2px solid rgba(42,36,24,0.14)",
        boxShadow: "0 14px 40px rgba(42,36,24,0.18), 0 2px 0 rgba(255,255,255,0.6) inset",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
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
          padding: "16px",
          background: "rgba(138,125,101,0.08)",
          borderRadius: 16
        }}>
          <div style={{ fontWeight: 600, color: "var(--ink-dark)", display: "flex", alignItems: "center", gap: 8 }}>
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            Âm thanh
          </div>
          <Button 
            variant={soundEnabled ? "primary" : "secondary"} 
            size="sm" 
            onClick={() => onSoundChange(!soundEnabled)}
          >
            {soundEnabled ? "Bật" : "Tắt"}
          </Button>
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
          background: "rgba(138,125,101,0.08)",
          borderRadius: 16
        }}>
          <div style={{ fontWeight: 600, color: "var(--ink-dark)", display: "flex", alignItems: "center", gap: 8 }}>
            {notifications ? <Bell size={20} /> : <BellOff size={20} />}
            Thông báo
          </div>
          <Button 
            variant={notifications ? "primary" : "secondary"} 
            size="sm" 
            onClick={() => setNotifications(!notifications)}
          >
            {notifications ? "Bật" : "Tắt"}
          </Button>
        </div>
      </div>

      <Button onClick={onBack} size="md" variant="secondary" style={{ marginTop: 8 }}>
        ← Quay lại
      </Button>
    </div>
  );
}
