import type { CSSProperties } from "react";
import Button from "./Button";

interface ThemedBackButtonProps {
  onClick: () => void;
  size?: "md" | "lg";
  style?: CSSProperties;
}

export default function ThemedBackButton({ onClick, size = "md", style }: ThemedBackButtonProps) {
  return (
    <Button
      onClick={onClick}
      size={size}
      variant="secondary"
      style={style}
    >
      ← Quay lại
    </Button>
  );
}
