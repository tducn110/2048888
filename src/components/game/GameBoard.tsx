import { useEffect, useRef } from "react";
import type { TileCell, Direction } from "@/types";
import { Pixi2048Renderer } from "./Pixi2048Renderer";

interface GameBoardProps {
  tiles: TileCell[];
  onSwipe?: (dir: Direction) => void;
  background: string;
  paused?: boolean;
}

export default function GameBoard({ tiles, background, paused = false }: GameBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Pixi2048Renderer | null>(null);
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
    if (rendererRef.current) {
      rendererRef.current.setPaused(paused);
    }
  }, [paused]);

  // Handle ResizeObserver
  useEffect(() => {
    const update = (newSize?: number) => {
      if (containerRef.current) {
        const size = newSize ?? containerRef.current.offsetWidth;
        if (rendererRef.current) {
          rendererRef.current.resize(size);
        }
      }
    };
    update(); // Initial read is fine
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      if (entries.length > 0) {
        update(entries[0].contentRect.width);
      }
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const tilesRef = useRef(tiles);
  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  // Initialize Renderer ONLY ONCE
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create new renderer instance
    const renderer = new Pixi2048Renderer(containerRef.current);
    rendererRef.current = renderer;

    let isDestroyed = false;

    // Async init
    renderer.init().then(() => {
      if (isDestroyed) {
        return;
      }
      renderer.setPaused(pausedRef.current);
      // Render initial tiles after initialized
      renderer.renderTiles(tilesRef.current);
    });

    return () => {
      isDestroyed = true;
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Sync tiles state to renderer
  useEffect(() => {
    if (rendererRef.current && rendererRef.current.app.renderer) {
      rendererRef.current.renderTiles(tiles);
    }
  }, [tiles]);

  return (
    <div
      className="game-board"
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        background,
        borderRadius: 12,
        boxSizing: "border-box",
        border: "none",
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
