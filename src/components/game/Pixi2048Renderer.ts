import { Application, Container, Graphics, Text } from "pixi.js";
import gsap from "gsap";
import type { TileCell } from "@/types";
import { getTileConfig } from "@/constants/tileConfig";

const GAP = 10;
const PADDING = 10;
const GRID_SIZE = 4;

export class Pixi2048Renderer {
  public app: Application;
  private container: HTMLDivElement;
  private tilesContainer: Container;
  private bgContainer: Container;
  private tileMap: Map<string, Container> = new Map();
  private tilePool: Container[] = [];
  private boardSize: number = 320;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.app = new Application();
    this.bgContainer = new Container();
    this.tilesContainer = new Container();
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

    this.drawBackground();
  }

  public resize(newSize: number) {
    if (newSize === this.boardSize || newSize === 0) return;
    this.boardSize = newSize;
    this.app.renderer.resize(this.boardSize, this.boardSize);
    this.drawBackground();
    
    // Clear pool on resize since cell sizes change
    this.tilePool.forEach(t => t.destroy({ children: true }));
    this.tilePool = [];
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

    const labelText = new Text({
      text: "",
      style: {
        fontFamily: "sans-serif",
        fontWeight: "700",
        fontSize: 9,
        letterSpacing: 0.4,
      }
    });
    labelText.label = "labelText";
    labelText.alpha = 0.75;
    labelText.anchor.set(0.5);
    tileContainer.addChild(labelText);

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

  public renderTiles(tiles: TileCell[]) {
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
      const targetX = PADDING + tile.col * (cellSize + GAP) + cellSize / 2;
      const targetY = PADDING + tile.row * (cellSize + GAP) + cellSize / 2;
      const cfg = getTileConfig(tile.value);

      if (!this.tileMap.has(tile.id)) {
        // Create or get pooled tile
        const tileContainer = this.getPooledTile();
        tileContainer.x = targetX;
        tileContainer.y = targetY;
        tileContainer.pivot.set(cellSize / 2, cellSize / 2);
        
        // Update background
        const bg = tileContainer.getChildByLabel("bg") as Graphics;
        bg.clear();
        bg.roundRect(0, 0, cellSize, cellSize, 16);
        bg.fill(cfg.colorBg);
        bg.stroke({ color: 0x2a2418, alpha: 0.18, width: 2 });

        // Update Label
        const labelText = tileContainer.getChildByLabel("labelText") as Text;
        if (cellSize >= 72) {
          labelText.visible = true;
          if (labelText.text !== cfg.label.toUpperCase()) {
            labelText.text = cfg.label.toUpperCase();
          }
          labelText.style.fill = cfg.colorText;
          labelText.x = cellSize / 2;
          labelText.y = 12;
        } else {
          labelText.visible = false;
        }

        // Update Value Text
        const valueText = tileContainer.getChildByLabel("valueText") as Text;
        if (valueText.text !== tile.value.toString()) {
          valueText.text = tile.value.toString();
        }
        valueText.style.fill = cfg.colorText;
        valueText.style.fontSize = cellSize < 80 ? (tile.value >= 1000 ? 11 : tile.value >= 100 ? 13 : 14) : (tile.value >= 1000 ? 14 : tile.value >= 100 ? 16 : 18);
        valueText.x = cellSize / 2;
        valueText.y = cellSize / 2;

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
        // Update existing tile position
        const tileContainer = this.tileMap.get(tile.id)!;
        
        // Always tween position in case board was resized or tile moved
        gsap.to(tileContainer, {
          x: targetX,
          y: targetY,
          duration: tile.isMerged ? 0.1 : 0.13,
          ease: "power2.out",
        });

        tileContainer.zIndex = tile.isMerged ? 10 : 1;

        // Always ensure Text value and colors match the current tile value
        const valueText = tileContainer.getChildByLabel("valueText") as Text;
        if (valueText.text !== tile.value.toString()) {
          valueText.text = tile.value.toString();
          valueText.style.fill = cfg.colorText;
          valueText.style.fontSize = cellSize < 80 ? (tile.value >= 1000 ? 11 : tile.value >= 100 ? 13 : 14) : (tile.value >= 1000 ? 14 : tile.value >= 100 ? 16 : 18);
          
          const bg = tileContainer.getChildByLabel("bg") as Graphics;
          bg.clear();
          bg.roundRect(0, 0, cellSize, cellSize, 16);
          bg.fill(cfg.colorBg);
          bg.stroke({ color: 0x2a2418, alpha: 0.18, width: 2 });
          
          const labelText = tileContainer.getChildByLabel("labelText") as Text;
          if (cellSize >= 72) {
            labelText.text = cfg.label.toUpperCase();
            labelText.style.fill = cfg.colorText;
          }
        }

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

  public destroy() {
    for (const tileContainer of this.tileMap.values()) {
      gsap.killTweensOf(tileContainer);
      gsap.killTweensOf(tileContainer.scale);
    }
    this.tileMap.clear();
    this.tilePool.forEach(t => t.destroy({ children: true }));
    this.tilePool = [];
    
    // OPTIMIZATION: Critical flag releaseGlobalResources avoids memory leaks on unmount
    this.app.destroy({ releaseGlobalResources: true }, { children: true });
  }
}
