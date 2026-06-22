import { useEffect, useRef, useState } from "react";
import type { TileCell, Direction } from "@/types";
import Tile from "./Tile";

const GAP = 10;
const PADDING = 10;
const GRID_SIZE = 4;

interface GameBoardProps {
  tiles: TileCell[];
  onSwipe: (dir: Direction) => void;
}

export default function GameBoard({ tiles, onSwipe }: GameBoardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(320);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

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

  const cellSize = (boardSize - 2 * PADDING - (GRID_SIZE - 1) * GAP) / GRID_SIZE;

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
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
      onSwipe(dx > 0 ? "right" : "left");
    } else {
      onSwipe(dy > 0 ? "down" : "up");
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  // Background cells
  const bgCells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;
    return { row, col };
  });

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        background: "rgba(42,36,24,0.08)",
        borderRadius: 20,
        padding: PADDING,
        boxSizing: "border-box",
        border: "2px solid rgba(42,36,24,0.12)",
        touchAction: "none",
        userSelect: "none",
      }}
      aria-label="Bàn chơi 2048"
      role="grid"
    >
      {/* Background cells */}
      {bgCells.map(({ row, col }) => (
        <div
          key={`bg-${row}-${col}`}
          style={{
            position: "absolute",
            left: PADDING + col * (cellSize + GAP),
            top: PADDING + row * (cellSize + GAP),
            width: cellSize,
            height: cellSize,
            borderRadius: 14,
            background: "rgba(42,36,24,0.06)",
            border: "1.5px dashed rgba(42,36,24,0.1)",
          }}
        />
      ))}

      {/* Tiles */}
      {tiles.map((tile) => (
        <Tile
          key={tile.id}
          tile={tile}
          cellSize={cellSize}
          gap={GAP}
          padding={PADDING}
        />
      ))}
    </div>
  );
}
