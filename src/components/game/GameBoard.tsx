import { useEffect, useRef } from "react";
import type { TileCell, Direction } from "@/types";
import { Pixi2048Renderer } from "./Pixi2048Renderer";

interface GameBoardProps {
  tiles: TileCell[];
  onSwipe: (dir: Direction) => void;
  background: string;
}

export default function GameBoard({ tiles, onSwipe, background }: GameBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Pixi2048Renderer | null>(null);

  // Keep ref to avoid binding closures to resize event
  const onSwipeRef = useRef(onSwipe);
  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  // Handle ResizeObserver
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const newSize = containerRef.current.offsetWidth;
        if (rendererRef.current) {
          rendererRef.current.resize(newSize);
        }
      }
    };
    update();
    const ro = new ResizeObserver(update);
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
        renderer.destroy();
        return;
      }
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
