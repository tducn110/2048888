import { forwardRef } from "react";
import { createPortal } from "react-dom";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import Button from "@/components/ui/Button";
import LogoBubble from "@/components/ui/LogoBubble";
import { useLoginModal } from "@/hooks/useLoginModal";
import { AUTH_CONTENT } from "@/content/authContent";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const {
    mode, showPw, email, password, username, firstRef,
    setShowPw, setEmail, setPassword, setUsername,
    handleSubmit, toggleMode,
  } = useLoginModal(isOpen, onClose);

  if (!isOpen) return null;

  const copy = AUTH_CONTENT[mode];

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* Backdrop */}
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(42,36,24,0.55)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.ariaLabel}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          background: "var(--cream-card)",
          borderRadius: 24,
          padding: 32,
          border: "2px solid rgba(42,36,24,0.14)",
          boxShadow: "0 24px 64px rgba(42,36,24,0.24)",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          boxSizing: "border-box",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(42,36,24,0.08)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--pencil-gray)" }}
          aria-label={AUTH_CONTENT.closeLabel}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <LogoBubble size={48} />
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: "var(--ink-dark)", margin: "0 0 4px" }}>
              {copy.heading}
            </h2>
            <p style={{ fontSize: 13, color: "var(--pencil-gray)", margin: 0 }}>
              {copy.subheading}
            </p>
          </div>
        </div>

        {/* Social login */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {AUTH_CONTENT.social.map(({ label, icon, bg, border, color }) => (
            <button
              key={label}
              type="button"
              style={{ flex: 1, padding: "10px", borderRadius: 12, background: bg, border: `1.5px solid ${border}`, cursor: "pointer", fontWeight: 700, fontSize: 13, color, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}
            >
              <span style={{ fontWeight: 900, fontSize: 16 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(42,36,24,0.12)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--pencil-gray)", letterSpacing: "0.06em" }}>
            {AUTH_CONTENT.divider}
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(42,36,24,0.12)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <FieldInput ref={firstRef} icon={<User size={16} />} placeholder={AUTH_CONTENT.placeholders.username} value={username} onChange={setUsername} type="text" required />
          )}
          <FieldInput
            ref={mode === "login" ? firstRef : undefined}
            icon={<Mail size={16} />}
            placeholder={AUTH_CONTENT.placeholders.email}
            value={email}
            onChange={setEmail}
            type="email"
            required
          />
          <div style={{ position: "relative" }}>
            <FieldInput icon={<Lock size={16} />} placeholder={AUTH_CONTENT.placeholders.password} value={password} onChange={setPassword} type={showPw ? "text" : "password"} required />
            <button
              type="button"
              onClick={() => setShowPw((p) => !p)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--pencil-gray)", padding: 0, display: "flex" }}
              aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {mode === "login" && (
            <div style={{ textAlign: "right" }}>
              <a href="#" style={{ fontSize: 12, color: "var(--orange-cta)", fontWeight: 600, textDecoration: "none" }}>
                {AUTH_CONTENT.login.forgotPw}
              </a>
            </div>
          )}
          <Button type="submit" size="lg" style={{ width: "100%", marginTop: 4 }}>
            {copy.submit}
          </Button>
        </form>

        {/* Switch mode */}
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--pencil-gray)", marginTop: 18, marginBottom: 0 }}>
          {copy.switchPrompt}
          <button
            type="button"
            onClick={toggleMode}
            style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 700, color: "var(--orange-cta)", fontFamily: "inherit", fontSize: 13, padding: 0 }}
          >
            {copy.switchAction}
          </button>
        </p>
      </div>
    </div>,
    document.body
  );
}

interface FieldInputProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}

const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(
  ({ icon, placeholder, value, onChange, type = "text", required }, ref) => (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--pencil-gray)", pointerEvents: "none", display: "flex" }}>
        {icon}
      </div>
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          width: "100%",
          padding: "12px 14px 12px 44px",
          borderRadius: 14,
          border: "1.5px solid rgba(42,36,24,0.18)",
          background: "var(--input-background)",
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontSize: 14,
          color: "var(--ink-dark)",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--orange-cta)")}
        onBlur={(e) => (e.target.style.borderColor = "rgba(42,36,24,0.18)")}
      />
    </div>
  )
);
FieldInput.displayName = "FieldInput";
