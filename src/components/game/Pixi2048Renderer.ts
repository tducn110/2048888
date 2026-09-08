import { Application, Container, Graphics, Text, Sprite, Spritesheet, Assets, Texture } from "pixi.js";
import gsap from "gsap";
import type { TileCell } from "@/types";
import { getTileConfig } from "@/constants/tileConfig";

const GAP = 10;
const PADDING = 10;
const GRID_SIZE = 4;

let radialGlowTexture: Texture | null = null;

function getRadialGlowTexture(): Texture {
  if (radialGlowTexture) return radialGlowTexture;
  if (typeof document === "undefined") return Texture.WHITE;

  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Texture.WHITE;

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  // Target curve per user specification:
  // 0.00 -> alpha 0.60 (warm luminous white-golden core)
  // 0.18 -> alpha 0.45
  // 0.32 -> alpha 0.30 (gentle reduction, golden aura)
  // 0.60 -> alpha 0.10 (sharp decay, amber atmosphere)
  // 0.82 -> alpha 0.03 (feathered taper)
  // 1.00 -> alpha 0.00 (completely transparent edge, no circular border)
  grad.addColorStop(0.00, "rgba(255, 252, 228, 0.60)");
  grad.addColorStop(0.18, "rgba(255, 230, 130, 0.45)");
  grad.addColorStop(0.32, "rgba(255, 198, 55, 0.30)");
  grad.addColorStop(0.60, "rgba(255, 150, 25, 0.10)");
  grad.addColorStop(0.82, "rgba(245, 125, 15, 0.03)");
  grad.addColorStop(1.00, "rgba(240, 110, 10, 0.00)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  radialGlowTexture = Texture.from(canvas);
  return radialGlowTexture;
}

export class Pixi2048Renderer {
  public app: Application;
  private container: HTMLDivElement;
  private tilesContainer: Container;
  private bgContainer: Container;
  private celebrationContainer: Container;
  private celebrationContent: Container;
  private dimLayer: Graphics;
  private glowSprite: Sprite;
  private raysGraphics: Graphics;
  private foxSprite: Sprite;
  private bannerSprite: Sprite;
  private valueContainer: Container;
  private digitTexts: Text[] = [];
  private currentMilestoneValue: number = 2048;
  private confettiGraphics: Graphics;
  private sparklesGraphics: Graphics;
  private celebrateSheet: Spritesheet | null = null;
  private celebrateTimeline: gsap.core.Timeline | null = null;
  private tileMap: Map<string, Container> = new Map();
  private tilePool: Container[] = [];
  private boardSize: number = 320;
  private currentTiles: TileCell[] = [];
  private paused = false;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.app = new Application();
    this.bgContainer = new Container();
    this.tilesContainer = new Container();

    // Celebration container setup (single instance, reused across milestones)
    this.celebrationContainer = new Container();
    this.celebrationContainer.visible = false;
    this.celebrationContainer.eventMode = "none";

    this.dimLayer = new Graphics();
    this.dimLayer.eventMode = "none";
    this.celebrationContainer.addChild(this.dimLayer);

    this.celebrationContent = new Container();
    this.celebrationContent.eventMode = "none";
    this.celebrationContainer.addChild(this.celebrationContent);

    this.glowSprite = new Sprite(getRadialGlowTexture());
    this.glowSprite.anchor.set(0.5);
    this.raysGraphics = new Graphics();
    this.foxSprite = new Sprite();
    this.foxSprite.anchor.set(0.5);
    this.bannerSprite = new Sprite();
    this.bannerSprite.anchor.set(0.5);

    this.valueContainer = new Container();
    this.valueContainer.eventMode = "none";

    this.confettiGraphics = new Graphics();
    this.sparklesGraphics = new Graphics();

    // Z-order: glow -> rays -> fox -> banner -> text -> confetti -> sparkles
    this.celebrationContent.addChild(this.glowSprite);
    this.celebrationContent.addChild(this.raysGraphics);
    this.celebrationContent.addChild(this.foxSprite);
    this.celebrationContent.addChild(this.bannerSprite);
    this.celebrationContent.addChild(this.valueContainer);
    this.celebrationContent.addChild(this.confettiGraphics);
    this.celebrationContent.addChild(this.sparklesGraphics);
  }

  public setPaused(paused: boolean) {
    this.paused = paused;
    if (!this.app?.renderer) return;
    if (this.paused) {
      this.app.stop();
    } else {
      this.app.start();
    }
  }

  public async init() {
    this.boardSize = this.container.offsetWidth || 320;

    await this.app.init({
      width: this.boardSize,
      height: this.boardSize,
      background: 0x2a2418,
      backgroundAlpha: 0.0,
      antialias: true,
      resolution: window.devicePixelRatio || 2,
      autoDensity: true,
      // Tuning GC for better memory management
      gcActive: true,
      gcMaxUnusedTime: 60000,
      gcFrequency: 30000,
    });

    this.container.appendChild(this.app.canvas);
    this.app.canvas.style.position = "absolute";
    this.app.canvas.style.inset = "0";
    this.app.canvas.style.width = "100%";
    this.app.canvas.style.height = "100%";
    this.app.canvas.style.touchAction = "none";

    this.app.stage.addChild(this.bgContainer);
    this.app.stage.addChild(this.tilesContainer);
    this.app.stage.addChild(this.celebrationContainer);

    this.drawBackground();
    this.setPaused(this.paused);

    // Preload celebration atlas asynchronously before init completes
    try {
      const sheet = await Assets.load<Spritesheet>("/celebrate/celebrate1.json");
      this.celebrateSheet = sheet;
      if (sheet?.textures) {
        if (sheet.textures["fox.png"]) {
          this.foxSprite.texture = sheet.textures["fox.png"];
        }
        if (sheet.textures["celebrate.png"]) {
          this.bannerSprite.texture = sheet.textures["celebrate.png"];
        }
      }
    } catch (err) {
      console.warn("[Pixi2048Renderer] Could not load celebration spritesheet:", err);
    }
  }

  public resize(newSize: number) {
    if (!this.app?.renderer) return;
    if (newSize === this.boardSize || newSize === 0) return;
    this.boardSize = newSize;
    this.app.renderer.resize(this.boardSize, this.boardSize);
    this.drawBackground();
    
    // Clear pool on resize since cell sizes change
    this.tilePool.forEach(t => t.destroy({ children: true }));
    this.tilePool = [];

    // Re-layout all existing active tiles with the new cell size immediately
    const cellSize = this.getCellSize();
    const tileMapData = new Map(this.currentTiles.map(t => [t.id, t]));
    for (const [id, tileContainer] of this.tileMap.entries()) {
      const tile = tileMapData.get(id);
      if (tile) {
        this.layoutTile(tileContainer, tile, cellSize, false);
      }
    }

    if (this.celebrationContainer.visible) {
      this.layoutCelebration(this.currentMilestoneValue);
    }
  }

  private drawBackground() {
    // Disable caching before clearing
    this.bgContainer.cacheAsTexture(false);
    this.bgContainer.removeChildren();
    
    const cellSize = this.getCellSize();

    // OPTIMIZATION: Single Graphics object for all background cells (Batching)
    const bgGraphics = new Graphics();
    
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const row = Math.floor(i / GRID_SIZE);
      const col = i % GRID_SIZE;
      const x = PADDING + col * (cellSize + GAP);
      const y = PADDING + row * (cellSize + GAP);

      bgGraphics.roundRect(x, y, cellSize, cellSize, 14);
    }
    
    bgGraphics.fill({ color: 0x2a2418, alpha: 0.06 });
    bgGraphics.stroke({ color: 0x2a2418, alpha: 0.1, width: 1.5 });
    
    this.bgContainer.addChild(bgGraphics);
    
    // OPTIMIZATION: Cache complex static subtree as a single texture
    this.bgContainer.cacheAsTexture(true);
  }

  private getCellSize() {
    return (this.boardSize - 2 * PADDING - (GRID_SIZE - 1) * GAP) / GRID_SIZE;
  }

  private getPooledTile(): Container {
    const pooled = this.tilePool.pop();
    if (pooled) {
      pooled.visible = true;
      return pooled;
    }

    const tileContainer = new Container();
    
    const bg = new Graphics();
    bg.label = "bg";
    tileContainer.addChild(bg);



    const valueText = new Text({
      text: "",
      style: {
        fontFamily: "'Be Vietnam Pro', sans-serif",
        fontWeight: "800",
        fontSize: 16,
      }
    });
    valueText.label = "valueText";
    valueText.anchor.set(0.5);
    tileContainer.addChild(valueText);

    return tileContainer;
  }

  private releasePooledTile(tileContainer: Container) {
    tileContainer.visible = false;
    this.tilePool.push(tileContainer);
  }

  private layoutTile(
    tileContainer: Container,
    tile: TileCell,
    cellSize: number,
    animateMove = false
  ) {
    const targetX = PADDING + tile.col * (cellSize + GAP) + cellSize / 2;
    const targetY = PADDING + tile.row * (cellSize + GAP) + cellSize / 2;
    const cfg = getTileConfig(tile.value);

    tileContainer.pivot.set(cellSize / 2, cellSize / 2);

    if (animateMove) {
      gsap.to(tileContainer, {
        x: targetX,
        y: targetY,
        duration: tile.isMerged ? 0.1 : 0.13,
        ease: "power2.out",
      });
    } else {
      gsap.killTweensOf(tileContainer);
      tileContainer.x = targetX;
      tileContainer.y = targetY;
    }

    const bg = tileContainer.getChildByLabel("bg") as Graphics;
    if (bg) {
      bg.clear();
      bg.roundRect(0, 0, cellSize, cellSize, 16);
      bg.fill(cfg.colorBg);
      bg.stroke({ color: 0x2a2418, alpha: 0.18, width: 2 });
    }

    const valueText = tileContainer.getChildByLabel("valueText") as Text;
    if (valueText) {
      if (valueText.text !== tile.value.toString()) {
        valueText.text = tile.value.toString();
      }
      valueText.style.fill = cfg.colorText;
      valueText.style.fontSize =
        cellSize < 80
          ? tile.value >= 1000 ? 11 : tile.value >= 100 ? 13 : 14
          : tile.value >= 1000 ? 14 : tile.value >= 100 ? 16 : 18;
      valueText.x = cellSize / 2;
      valueText.y = cellSize / 2;
    }
  }

  public renderTiles(tiles: TileCell[]) {
    this.currentTiles = tiles;
    const cellSize = this.getCellSize();
    const currentIds = new Set(tiles.map(t => t.id));

    // Remove deleted tiles (Recycle to pool instead of destroying)
    for (const [id, tileContainer] of this.tileMap.entries()) {
      if (!currentIds.has(id)) {
        gsap.killTweensOf(tileContainer);
        gsap.killTweensOf(tileContainer.scale);
        this.tilesContainer.removeChild(tileContainer);
        this.releasePooledTile(tileContainer);
        this.tileMap.delete(id);
      }
    }

    // Add or update tiles
    tiles.forEach((tile) => {
      if (!this.tileMap.has(tile.id)) {
        // Create or get pooled tile
        const tileContainer = this.getPooledTile();
        this.layoutTile(tileContainer, tile, cellSize, false);

        this.tilesContainer.addChild(tileContainer);
        this.tileMap.set(tile.id, tileContainer);

        // Spawn animation
        if (tile.isNew) {
          tileContainer.scale.set(0);
          gsap.to(tileContainer.scale, { x: 1, y: 1, duration: 0.2, ease: "back.out(1.7)" });
        } else {
          tileContainer.scale.set(1);
        }

      } else {
        // Update existing tile position and properties
        const tileContainer = this.tileMap.get(tile.id)!;
        this.layoutTile(tileContainer, tile, cellSize, true);

        tileContainer.zIndex = tile.isMerged ? 10 : 1;

        if (tile.isMerged) {
          // Pop animation
          gsap.timeline()
            .to(tileContainer.scale, { x: 1.15, y: 1.15, duration: 0.1 })
            .to(tileContainer.scale, { x: 1, y: 1, duration: 0.1 });
        }
      }
    });

    // Sort by zIndex
    this.tilesContainer.children.sort((a, b) => a.zIndex - b.zIndex);
  }

  private layoutCelebration(value: number) {
    const size = this.boardSize;
    const cx = size / 2;
    const cy = size / 2;

    // 1. Dim layer
    this.dimLayer.clear();
    this.dimLayer.rect(0, 0, size, size);
    this.dimLayer.fill({ color: 0x000000, alpha: 0.28 });

    // 2. Base scale and responsive dimensions
    const baseScale = Math.min(Math.max(size / 360, 0.72), 1.25);
    const bannerW = Math.min(size * 0.76, 280 * baseScale);
    const bannerH = bannerW * (362 / 1086); // aspect ratio ~3:1
    const foxSize = Math.min(size * 0.38, 140 * baseScale);

    // Glow diameter ≈ 1.38–1.45 × banner width per user target (no visible circular boundary)
    const glowDiameter = bannerW * 1.42;
    const glowRadius = glowDiameter / 2;

    // Center positioning: Fox sits behind upper banner with ~15-20% overlap
    const totalH = foxSize * 0.75 + bannerH;
    const topY = cy - totalH / 2;
    const foxY = topY + foxSize / 2;
    const bannerY = foxY + foxSize * 0.36 + bannerH / 2;

    // 3. Ambient Center Glow (feathered procedural radial gradient)
    const glowCenterY = foxY + foxSize * 0.08;
    this.glowSprite.width = glowDiameter;
    this.glowSprite.height = glowDiameter;
    this.glowSprite.x = cx;
    this.glowSprite.y = glowCenterY;

    // 4. Light Rays (8 soft rays radiating outward from behind fox)
    this.raysGraphics.clear();
    const rayCount = 8;
    const rayLength = glowRadius * 0.95;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i * Math.PI * 2) / rayCount;
      const spread = 0.10;
      const x1 = cx + Math.cos(angle - spread) * 20;
      const y1 = glowCenterY + Math.sin(angle - spread) * 20;
      const x2 = cx + Math.cos(angle + spread) * 20;
      const y2 = glowCenterY + Math.sin(angle + spread) * 20;
      const x3 = cx + Math.cos(angle) * rayLength;
      const y3 = glowCenterY + Math.sin(angle) * rayLength;

      this.raysGraphics.poly([x1, y1, x2, y2, x3, y3]);
    }
    this.raysGraphics.fill({ color: 0xfff6b8, alpha: 0.13 });

    // 5. Fox
    this.foxSprite.width = foxSize;
    this.foxSprite.height = foxSize;
    this.foxSprite.x = cx;
    this.foxSprite.y = foxY;

    // 6. Banner
    this.bannerSprite.width = bannerW;
    this.bannerSprite.height = bannerH;
    this.bannerSprite.x = cx;
    this.bannerSprite.y = bannerY;

    // 7. Arched Hero Value Typography (following the plaque's curve)
    this.currentMilestoneValue = value;
    const numStr = value.toString();
    const nDigits = numStr.length;

    // Dynamic sizing based on number of digits:
    // 4 digits (2048, 4096, 8192): prominent font
    // 5 digits (16384, 32768, 65536): scaled to fit comfortably inside arch
    const fontSize = Math.round(nDigits <= 4 ? bannerH * 0.38 : bannerH * 0.30);
    const strokeWidth = Math.max(Math.round(fontSize * 0.11), 3);
    const spacing = Math.max(Math.round(bannerW * 0.008), 2);

    // Ensure we have enough Text objects in pool
    while (this.digitTexts.length < nDigits) {
      const dt = new Text({
        text: "",
        style: {
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontWeight: "900",
          fontSize: fontSize,
          fill: 0x542200,
          stroke: { color: 0xffffff, width: strokeWidth },
          dropShadow: {
            color: 0x5a2000,
            alpha: 0.35,
            blur: 3,
            distance: 3,
            angle: Math.PI / 2,
          },
          align: "center",
        },
      });
      dt.anchor.set(0.5, 0.5);
      this.digitTexts.push(dt);
      this.valueContainer.addChild(dt);
    }

    // Hide unused digits
    for (let i = nDigits; i < this.digitTexts.length; i++) {
      this.digitTexts[i].visible = false;
    }

    for (let i = 0; i < nDigits; i++) {
      const dt = this.digitTexts[i];
      dt.visible = true;
      dt.text = numStr[i];
      dt.style.fontSize = fontSize;
      dt.style.stroke = { color: 0xffffff, width: strokeWidth };
    }

    // Measure total width
    const widths: number[] = [];
    let totalW = 0;
    for (let i = 0; i < nDigits; i++) {
      const w = this.digitTexts[i].width;
      widths.push(w);
      totalW += w;
    }
    totalW += spacing * (nDigits - 1);

    // Plaque curve geometry:
    // In normalized banner space, plaque center crest is at -0.21 * bannerH
    const plaqueCenterY = bannerY - bannerH * 0.21;
    // Curvature in screen coordinates:
    const curvature = 0.00028 / (bannerW / 1086);
    const startX = cx - totalW / 2;

    let currX = startX;
    for (let i = 0; i < nDigits; i++) {
      const dt = this.digitTexts[i];
      const w = widths[i];
      const midX = currX + w / 2;
      const dx = midX - cx;

      // Parabolic arch following plaque contour
      const arcY = plaqueCenterY + curvature * (dx * dx);
      const slope = 2 * curvature * dx;
      const angle = Math.atan(slope);

      dt.x = midX;
      dt.y = arcY;
      dt.rotation = angle;

      currX += w + spacing;
    }

    // 9. Confetti (colorful decorative pieces)
    this.confettiGraphics.clear();
    const confettiColors = [0xff5252, 0xffd000, 0x4caf50, 0x2196f3, 0xff9800, 0xe040fb];
    const pieces = [
      { dx: -bannerW * 0.42, dy: -foxSize * 0.5, w: 8, h: 14, color: confettiColors[0] },
      { dx: -bannerW * 0.35, dy: foxSize * 0.2, w: 7, h: 12, color: confettiColors[1] },
      { dx: -bannerW * 0.46, dy: bannerH * 0.3, w: 9, h: 15, color: confettiColors[2] },
      { dx: bannerW * 0.42, dy: -foxSize * 0.45, w: 8, h: 13, color: confettiColors[3] },
      { dx: bannerW * 0.36, dy: foxSize * 0.15, w: 7, h: 14, color: confettiColors[4] },
      { dx: bannerW * 0.45, dy: bannerH * 0.35, w: 9, h: 12, color: confettiColors[5] },
      { dx: -bannerW * 0.18, dy: -foxSize * 0.72, w: 6, h: 11, color: confettiColors[1] },
      { dx: bannerW * 0.2, dy: -foxSize * 0.68, w: 7, h: 12, color: confettiColors[0] },
      { dx: 0, dy: -foxSize * 0.82, w: 8, h: 13, color: confettiColors[2] },
    ];
    for (const p of pieces) {
      this.confettiGraphics.rect(cx + p.dx, cy + p.dy, p.w * baseScale, p.h * baseScale);
      this.confettiGraphics.fill({ color: p.color, alpha: 0.88 });
    }

    // 10. Sparkles (4-pointed star shapes)
    this.sparklesGraphics.clear();
    const sparkleOffsets = [
      { dx: -bannerW * 0.3, dy: -foxSize * 0.65, size: 7 },
      { dx: bannerW * 0.28, dy: -foxSize * 0.6, size: 8 },
      { dx: -bannerW * 0.48, dy: 0, size: 6 },
      { dx: bannerW * 0.48, dy: -bannerH * 0.1, size: 7 },
      { dx: bannerW * 0.05, dy: -foxSize * 0.75, size: 9 },
    ];
    for (const s of sparkleOffsets) {
      const sx = cx + s.dx;
      const sy = cy + s.dy;
      const r = s.size * baseScale;
      this.sparklesGraphics.poly([
        sx, sy - r,
        sx + r * 0.3, sy,
        sx, sy + r,
        sx - r * 0.3, sy,
      ]);
      this.sparklesGraphics.poly([
        sx - r, sy,
        sx, sy + r * 0.3,
        sx + r, sy,
        sx, sy - r * 0.3,
      ]);
    }
    this.sparklesGraphics.fill({ color: 0xffffff, alpha: 0.9 });
  }

  public showMilestone(value: number, autoHide = true) {
    if (!this.app?.renderer) return;

    if (this.celebrateTimeline) {
      this.celebrateTimeline.kill();
      this.celebrateTimeline = null;
    }
    gsap.killTweensOf(this.celebrationContainer);
    gsap.killTweensOf(this.celebrationContent);
    gsap.killTweensOf(this.celebrationContent.scale);
    gsap.killTweensOf(this.dimLayer);

    // Ensure textures are assigned if loaded after init
    if (this.celebrateSheet?.textures) {
      if (!this.foxSprite.texture || this.foxSprite.texture === Texture.EMPTY) {
        this.foxSprite.texture = this.celebrateSheet.textures["fox.png"];
      }
      if (!this.bannerSprite.texture || this.bannerSprite.texture === Texture.EMPTY) {
        this.bannerSprite.texture = this.celebrateSheet.textures["celebrate.png"];
      }
    }

    this.layoutCelebration(value);

    this.celebrationContainer.visible = true;
    this.celebrationContainer.alpha = 1;
    this.dimLayer.alpha = 0;
    this.celebrationContent.alpha = 0;
    this.celebrationContent.scale.set(0.85);

    const tl = gsap.timeline({
      onComplete: () => {
        if (autoHide) {
          this.celebrationContainer.visible = false;
          this.celebrationContainer.alpha = 1;
          this.celebrateTimeline = null;
        }
      },
    });
    this.celebrateTimeline = tl;

    // 0-150ms: crisp pop-in
    tl.to(this.dimLayer, { alpha: 0.28, duration: 0.15, ease: "power2.out" }, 0)
      .to(this.celebrationContent, { alpha: 1, duration: 0.15, ease: "power2.out" }, 0)
      .to(this.celebrationContent.scale, { x: 1, y: 1, duration: 0.25, ease: "back.out(1.4)" }, 0);

    if (autoHide) {
      // Hold 2.6s then fade out in 250ms (total on-screen duration ~3.0s per user request)
      tl.to(this.celebrationContainer, { alpha: 0, duration: 0.25, ease: "power2.in" }, "+=2.6");
    }
  }

  public dismissCelebration() {
    if (!this.celebrationContainer.visible) return;
    if (this.celebrateTimeline) {
      this.celebrateTimeline.kill();
      this.celebrateTimeline = null;
    }
    gsap.killTweensOf(this.celebrationContainer);
    gsap.to(this.celebrationContainer, {
      alpha: 0,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        this.celebrationContainer.visible = false;
        this.celebrationContainer.alpha = 1;
      },
    });
  }

  public destroy() {
    if (this.celebrateTimeline) {
      this.celebrateTimeline.kill();
      this.celebrateTimeline = null;
    }
    gsap.killTweensOf(this.celebrationContainer);
    gsap.killTweensOf(this.celebrationContent);
    gsap.killTweensOf(this.dimLayer);

    for (const tileContainer of this.tileMap.values()) {
      gsap.killTweensOf(tileContainer);
      gsap.killTweensOf(tileContainer.scale);
    }
    this.tileMap.clear();
    this.tilePool.forEach(t => t.destroy({ children: true }));
    this.tilePool = [];
    this.digitTexts = [];
    
    // OPTIMIZATION: Critical flag releaseGlobalResources avoids memory leaks on unmount
    if (this.app.renderer) {
      this.app.destroy({ releaseGlobalResources: true }, { children: true });
    }
  }
}
