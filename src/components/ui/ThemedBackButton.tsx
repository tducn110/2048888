import type { CSSProperties } from "react";
import Button from "./Button";
import { useTranslation } from "react-i18next";

interface ThemedBackButtonProps {
  onClick: () => void;
  size?: "md" | "lg";
  style?: CSSProperties;
}

export default function ThemedBackButton({ onClick, size = "md", style }: ThemedBackButtonProps) {
  const { t } = useTranslation();
  return (
    <Button
      onClick={onClick}
      size={size}
      variant="secondary"
      style={style}
    >
      {t("common.back")}
    </Button>
  );
}
