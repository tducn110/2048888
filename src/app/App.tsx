import { useState, useEffect } from "react";
import CountrysideBackdrop from "@/components/background/CountrysideBackdrop";
import TopNav from "@/components/layout/TopNav";
import Footer from "@/components/layout/Footer";
import Game2048 from "@/components/game/Game2048";
import Sidebar from "@/components/sidebar/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import LoginModal from "@/components/auth/LoginModal";
import { useLocalStats } from "@/hooks/useLocalStats";
import { HOME_CONTENT } from "@/content/homeContent";

export default function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("play");
  const { stats, recordGame } = useLocalStats();

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sections = [...HOME_CONTENT.sections];
    const observers: IntersectionObserver[] = [];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-30% 0px -60% 0px" }
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--rice-paper)", fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      {/* Fixed nav */}
      <TopNav onLoginClick={() => setLoginOpen(true)} activeSection={activeSection} />

      {/* Countryside SVG backdrop — fixed behind content */}
      <CountrysideBackdrop />

      {/* Main scroll content */}
      <main style={{ position: "relative", zIndex: 1 }}>

        {/* ── Section 1: Hero / Game ── */}
        <section
          id="play"
          style={{
            minHeight: "100vh",
            paddingTop: 88,
            paddingBottom: 80,
            paddingLeft: 20,
            paddingRight: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Hero headline */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--pencil-gray)",
              marginBottom: 10,
            }}>
              {HOME_CONTENT.hero.eyebrow}
            </p>
            <h1
              style={{
                fontWeight: 800,
                fontSize: "clamp(32px, 6vw, 72px)",
                color: "var(--ink-dark)",
                margin: "0 0 8px",
                textShadow: "0 2px 0 rgba(255,255,255,0.6)",
                lineHeight: 1.05,
              }}
            >
              {HOME_CONTENT.hero.title}
            </h1>
            <p style={{ fontSize: 16, color: "var(--pencil-gray)", margin: 0, fontWeight: 500 }}>
              {HOME_CONTENT.hero.subtitle}
            </p>
          </div>

          {/* Game + Sidebar layout */}
          <div
            className="game-layout"
            style={{
              maxWidth: 940,
              margin: "0 auto",
              width: "100%",
              display: "grid",
              gridTemplateColumns: "minmax(0, 460px) minmax(260px, 340px)",
              gap: 20,
              alignItems: "start",
              justifyContent: "center",
            }}
          >
            <Game2048 bestScore={stats.bestScore} onGameEnd={recordGame} />
            <Sidebar />
          </div>
        </section>

        {/* ── Section 2: Dashboard ── */}
        <Dashboard stats={stats} />

      </main>

      {/* Footer */}
      <Footer />

      {/* Login modal (portal) */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

      {/* Responsive collapse */}
      <style>{`
        @media (max-width: 720px) {
          .game-layout {
            grid-template-columns: 1fr !important;
            max-width: 460px !important;
          }
        }
      `}</style>
    </div>
  );
}
