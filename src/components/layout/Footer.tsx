import LogoBubble from "@/components/ui/LogoBubble";
import { Heart } from "lucide-react";

const NAV_LINKS = [
  "Chơi Ngay", "Tiến Hoá", "Bảng Điểm", "Nhiệm Vụ", "Phần Thưởng", "Về Chúng Tôi",
];

export default function Footer() {
  return (
    <footer
      id="about"
      style={{
        background: "linear-gradient(180deg, #efe3c4 0%, #e6d8b2 100%)",
        borderTop: "2px dashed rgba(42,36,24,0.15)",
        padding: "56px 24px 32px",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 48,
            marginBottom: 48,
          }}
        >
          {/* Brand col */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <LogoBubble size={40} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--pencil-gray)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Bộ Lạc</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink-dark)", lineHeight: 1 }}>Đậu Phộng</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--pencil-gray)", lineHeight: 1.7, maxWidth: 220 }}>
              Trò chơi hoài niệm tuổi thơ, lấy cảm hứng từ làng quê Việt Nam. Gộp đậu, lớn mạnh, trở thành huyền thoại!
            </p>
            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--pencil-gray)" }}>
              <Heart size={12} fill="var(--alert-red)" color="var(--alert-red)" />
              Làm với tình yêu quê hương
            </div>
          </div>

          {/* Nav col */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--pencil-gray)", marginBottom: 16 }}>
              Điều Hướng
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {NAV_LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    style={{
                      fontSize: 14,
                      color: "var(--body-text)",
                      textDecoration: "none",
                      fontWeight: 500,
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--orange-cta)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--body-text)")}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* App badges mock */}
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--pencil-gray)", marginBottom: 16 }}>
              Tải Về
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["App Store", "Google Play"].map((store) => (
                <div
                  key={store}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "var(--ink-dark)",
                    borderRadius: 12,
                    cursor: "pointer",
                    opacity: 0.85,
                    width: "fit-content",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{store === "App Store" ? "🍎" : "▶"}</span>
                  <div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>SẮP RA MẮT</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{store}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--pencil-gray)", marginBottom: 10 }}>
                Cộng Đồng
              </h3>
              <div style={{ display: "flex", gap: 8 }}>
                {["FB", "TT", "YT"].map((s) => (
                  <div key={s} style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--cream-card)", border: "1.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--pencil-gray)", cursor: "pointer" }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px dashed rgba(42,36,24,0.15)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "var(--pencil-gray)", margin: 0 }}>
            © 2024 Bộ Lạc Đậu Phộng. Bảo lưu mọi quyền.
          </p>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--pencil-gray)" }}>
            {["Chính sách bảo mật", "Điều khoản sử dụng"].map((t) => (
              <a key={t} href="#" style={{ color: "inherit", textDecoration: "none" }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
