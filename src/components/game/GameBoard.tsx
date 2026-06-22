import { useEffect, useRef, useState, useCallback } from "react";
import type { TileCell, Direction } from "@/types";
import { Application, Container, Graphics, Text } from "pixi.js";
import { getTileConfig } from "@/constants/tileConfig";
import gsap from "gsap";

const GAP = 10;
const PADDING = 10;
const GRID_SIZE = 4;

interface GameBoardProps {
  tiles: TileCell[];
  onSwipe: (dir: Direction) => void;
}



export default function GameBoard({ tiles, onSwipe }: GameBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pixiAppRef = useRef<Application | null>(null);
  const tilesContainerRef = useRef<Container | null>(null);
  const tileSpritesRef = useRef<Map<string, Container>>(new Map());
  const [boardSize, setBoardSize] = useState(320);
  const onSwipeRef = useRef(onSwipe);

  // Keep refs updated to avoid re-binding or exhaustive-deps triggers
  const onSwipeRef = useRef(onSwipe);
  const tilesRef = useRef(tiles);

  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  // Resize observer for board Size
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setBoardSize(containerRef.current.offsetWidth);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const renderTiles = useCallback((currentTiles: TileCell[], cellSize: number) => {
    if (!tilesContainerRef.current) return;
    const container = tilesContainerRef.current;
    const map = tileSpritesRef.current;

    // Remove old tiles
    const currentIds = new Set(currentTiles.map((t) => t.id));
    for (const [id, sprite] of map.entries()) {
      if (!currentIds.has(id)) {
        // Animate out
        gsap.to(sprite.scale, { x: 0, y: 0, duration: 0.15, onComplete: () => {
            sprite.destroy({ children: true });
        }});
        map.delete(id);
      }
    }

    // Add or update tiles
    currentTiles.forEach((tile) => {
      const x = PADDING + tile.col * (cellSize + GAP);
      const y = PADDING + tile.row * (cellSize + GAP);
      const cfg = getTileConfig(tile.value);

      if (!map.has(tile.id)) {
        // Create new tile
        const tileContainer = new Container();
        tileContainer.x = x + cellSize / 2;
        tileContainer.y = y + cellSize / 2;
        tileContainer.pivot.set(cellSize / 2, cellSize / 2);
        
        // Background
        const bg = new Graphics();
        bg.roundRect(0, 0, cellSize, cellSize, 16);
        bg.fill(cfg.colorBg);
        bg.stroke({ color: 0x2a2418, alpha: 0.18, width: 2 });
        tileContainer.addChild(bg);



        // Label
        if (cellSize >= 72) {
          const labelText = new Text({
            text: cfg.label.toUpperCase(),
            style: {
              fontFamily: "sans-serif",
              fontWeight: "700",
              fontSize: 9,
              letterSpacing: 0.4, // rough approximation of 0.04em
              fill: cfg.colorText,
            }
          });
          labelText.alpha = 0.75;
          labelText.anchor.set(0.5);
          labelText.x = cellSize / 2;
          labelText.y = 12;
          tileContainer.addChild(labelText);
        }

        // Value Text
        const fontSize = cellSize < 80 ? (tile.value >= 1000 ? 11 : tile.value >= 100 ? 13 : 14) : (tile.value >= 1000 ? 14 : tile.value >= 100 ? 16 : 18);
        const text = new Text({
          text: tile.value.toString(),
          style: {
            fontFamily: "'Be Vietnam Pro', sans-serif",
            fontWeight: "800",
            fontSize: fontSize,
            fill: cfg.colorText,
          }
        });
        text.anchor.set(0.5);
        text.x = cellSize / 2;
        text.y = cellSize / 2;
        tileContainer.addChild(text);

        container.addChild(tileContainer);
        map.set(tile.id, tileContainer);

        // Spawn animation
        if (tile.isNew) {
          tileContainer.scale.set(0);
          gsap.to(tileContainer.scale, { x: 1, y: 1, duration: 0.2, ease: "back.out(1.7)" });
        }

      } else {
        // Update existing tile position
        const tileContainer = map.get(tile.id)!;
        
        // animate to new position
        const targetX = x + cellSize / 2;
        const targetY = y + cellSize / 2;
        
        gsap.to(tileContainer, {
          x: targetX,
          y: targetY,
          duration: 0.13,
          ease: "power2.out",
        });

        // zIndex management for merged tiles
        tileContainer.zIndex = tile.isMerged ? 10 : 1;

        if (tile.isMerged) {
          // Pop animation
          gsap.timeline()
            .to(tileContainer.scale, { x: 1.15, y: 1.15, duration: 0.1 })
            .to(tileContainer.scale, { x: 1, y: 1, duration: 0.1 });
        }
      }
    });

    // sort children by zIndex
    container.children.sort((a, b) => a.zIndex - b.zIndex);
  }, []);

  // Initialize Pixi App
  useEffect(() => {
    if (!containerRef.current || boardSize === 0) return;

    const app = new Application();
    pixiAppRef.current = app;

    let isDestroyed = false;
    const currentContainer = containerRef.current;
    const currentTileSprites = tileSpritesRef.current;

    const initPixi = async () => {
      // Clean up DOM if React strict mode double-invokes
      if (currentContainer) {
        currentContainer.innerHTML = "";
      }

      await app.init({
        width: boardSize,
        height: boardSize,
        background: 0x2a2418,
        backgroundAlpha: 0.0, // Transparent background, handled by CSS
        antialias: true,
        resolution: window.devicePixelRatio || 2,
        autoDensity: true,
      });

      if (isDestroyed) {
        app.destroy(true, { children: true });
        return;
      }

      if (currentContainer) {
        currentContainer.appendChild(app.canvas);
        app.canvas.style.position = "absolute";
        app.canvas.style.inset = "0";
        app.canvas.style.width = "100%";
        app.canvas.style.height = "100%";
        app.canvas.style.touchAction = "none";
      }

      const cellSize = (boardSize - 2 * PADDING - (GRID_SIZE - 1) * GAP) / GRID_SIZE;

      // Draw background cells
      const bgContainer = new Container();
      app.stage.addChild(bgContainer);

      for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const row = Math.floor(i / GRID_SIZE);
        const col = i % GRID_SIZE;
        const x = PADDING + col * (cellSize + GAP);
        const y = PADDING + row * (cellSize + GAP);

        const bgCell = new Graphics();
        bgCell.roundRect(0, 0, cellSize, cellSize, 14);
        bgCell.fill({ color: 0x2a2418, alpha: 0.06 });
        bgCell.stroke({ color: 0x2a2418, alpha: 0.1, width: 1.5 });
        bgCell.x = x;
        bgCell.y = y;
        bgContainer.addChild(bgCell);
      }

      const tilesContainer = new Container();
      app.stage.addChild(tilesContainer);
      tilesContainerRef.current = tilesContainer;
      
      // Trigger initial render
      renderTiles(tilesRef.current, cellSize);
    };

    initPixi();

    return () => {
      isDestroyed = true;
      if (app.renderer) {
        if (app.canvas && currentContainer.contains(app.canvas)) {
          currentContainer.removeChild(app.canvas);
        }
        app.destroy(true, { children: true });
      }
      pixiAppRef.current = null;
      tilesContainerRef.current = null;
      currentTileSprites.clear();
    };
  }, [boardSize, renderTiles]); // Recreate Pixi app only when boardSize changes

  // Re-render tiles on state change
  useEffect(() => {
    if (!pixiAppRef.current || !tilesContainerRef.current || boardSize === 0) return;
    const cellSize = (boardSize - 2 * PADDING - (GRID_SIZE - 1) * GAP) / GRID_SIZE;
    renderTiles(tiles, cellSize);
  }, [tiles, boardSize, renderTiles]);

  // Swipe logic
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const board = containerRef.current;
    if (!board) return;

    const handleTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      touchStart.current = null;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const THRESHOLD = 24;

      if (Math.max(absDx, absDy) < THRESHOLD) return;

      if (absDx > absDy) {
        onSwipeRef.current(dx > 0 ? "right" : "left");
      } else {
        onSwipeRef.current(dy > 0 ? "down" : "up");
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    board.addEventListener("touchstart", handleTouchStart, { passive: true });
    board.addEventListener("touchend", handleTouchEnd, { passive: true });
    board.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      board.removeEventListener("touchstart", handleTouchStart);
      board.removeEventListener("touchend", handleTouchEnd);
      board.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        background: "rgba(42,36,24,0.08)",
        borderRadius: 20,
        boxSizing: "border-box",
        border: "2px solid rgba(42,36,24,0.12)",
        touchAction: "none",
        overscrollBehavior: "contain",
        userSelect: "none",
        overflow: "hidden", // Important for PixiJS canvas rounded corners fallback
      }}
      aria-label="Bàn chơi 2048"
      role="grid"
    />
  );
}
