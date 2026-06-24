import { useEffect, useRef } from "react";
import { Application, Assets, AnimatedSprite, type Spritesheet, Container } from "pixi.js";

interface MascotProps {
  width?: number;
  height?: number;
}

export default function Mascot({ width = 160, height = 160 }: MascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let destroyed = false;
    const app = new Application();
    appRef.current = app;

    const init = async () => {
      await app.init({
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 2,
        autoDensity: true,
      });

      if (destroyed) {
        app.destroy(true, { children: true });
        return;
      }

      el.innerHTML = "";
      el.appendChild(app.canvas);
      app.canvas.style.position = "absolute";
      app.canvas.style.inset = "0";
      app.canvas.style.width = "100%";
      app.canvas.style.height = "100%";
      app.canvas.style.pointerEvents = "none";

      try {
        const sheet = await Assets.load<Spritesheet>("/assets/peanut_idle_wave_spritesheet.json");
        if (destroyed) return;

        const frames = [
          sheet.textures["peanut_idle_wave_00.webp"],
          sheet.textures["peanut_idle_wave_01.webp"],
          sheet.textures["peanut_idle_wave_00.webp"],
          sheet.textures["peanut_idle_wave_04.webp"],
          sheet.textures["peanut_idle_wave_05.webp"],
          sheet.textures["peanut_idle_wave_04.webp"],
        ].filter(Boolean);

        const frameOffsets = [
          { x: 0, y: 0 },
          { x: 18, y: 1 },
          { x: 0, y: 0 },
          { x: -4, y: 2 },
          { x: 18, y: 2 },
          { x: -4, y: 2 },
        ];

        const peanut = new AnimatedSprite(frames);
        peanut.animationSpeed = 0.16;
        peanut.loop = true;
        peanut.roundPixels = true;
        // Calculate scale to fit within the container
        const baseWidth = frames[0].width;
        const baseHeight = frames[0].height;
        const scale = height / baseHeight;
        
        peanut.scale.set(scale);

        // Center it horizontally, align bottom
        const cx = width / 2;
        const cy = height;
        
        peanut.onFrameChange = (frameIndex) => {
          const offset = frameOffsets[frameIndex] ?? frameOffsets[0];
          // Multiply offset by scale because position is in parent space
          peanut.position.set(offset.x * scale, offset.y * scale);
        };

        const parentContainer = new Container();
        parentContainer.addChild(peanut);
        
        // Center horizontally and align to bottom
        parentContainer.x = cx - (baseWidth * scale) / 2;
        parentContainer.y = cy - (baseHeight * scale);

        app.stage.addChild(parentContainer);
        peanut.play();
      } catch (err) {
        console.error("Failed to load mascot spritesheet", err);
      }
    };
    init();

    return () => {
      destroyed = true;
      if (app.renderer) {
        if (app.canvas && el.contains(app.canvas)) el.removeChild(app.canvas);
        app.destroy(true, { children: true });
      }
      appRef.current = null;
    };
  }, [width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width,
        height,
      }}
      aria-label="Mascot Lạc"
    />
  );
}
