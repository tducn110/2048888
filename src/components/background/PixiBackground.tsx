import { useEffect, useRef } from "react";
import { Application, Assets, Sprite } from "pixi.js";

export default function PixiBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    
    let isDestroyed = false;
    const app = new Application();
    appRef.current = app;

    const init = async () => {
      await app.init({
        resizeTo: window,
        backgroundAlpha: 1,
        backgroundColor: 0x2a2418,
      });

      if (isDestroyed) {
        app.destroy(true, { children: true });
        return;
      }

      el.appendChild(app.canvas);
      app.canvas.style.position = "absolute";
      app.canvas.style.inset = "0";
      app.canvas.style.width = "100%";
      app.canvas.style.height = "100%";
      app.canvas.style.objectFit = "cover";
      app.canvas.style.zIndex = "0";

      // Pick a random image from bg-1.webp to bg-8.webp
      const randomId = Math.floor(Math.random() * 8) + 1;
      const bgUrl = `/assets/bg-${randomId}.webp`;

      const texture = await Assets.load(bgUrl);
      if (isDestroyed) return;

      const bgSprite = new Sprite(texture);
      bgSprite.anchor.set(0.5);
      app.stage.addChild(bgSprite);

      // Handle resize to cover screen
      const resizeBg = () => {
        bgSprite.x = app.screen.width / 2;
        bgSprite.y = app.screen.height / 2;
        const scaleX = app.screen.width / texture.width;
        const scaleY = app.screen.height / texture.height;
        bgSprite.scale.set(Math.max(scaleX, scaleY));
      };

      resizeBg();
      app.renderer.on("resize", resizeBg);
    };

    init();

    return () => {
      isDestroyed = true;
      if (app.renderer) {
        if (app.canvas && el.contains(app.canvas)) {
          el.removeChild(app.canvas);
        }
        app.destroy(true, { children: true });
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.8, // Slightly fade the background so the game board stands out
      }}
    />
  );
}
