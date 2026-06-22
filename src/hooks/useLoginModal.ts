import { useEffect, useRef, useState } from "react";

export type AuthMode = "login" | "register";

export interface LoginModalState {
  mode: AuthMode;
  showPw: boolean;
  email: string;
  password: string;
  username: string;
  firstRef: React.RefObject<HTMLInputElement>;
  setMode: (mode: AuthMode) => void;
  setShowPw: React.Dispatch<React.SetStateAction<boolean>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => void;
  toggleMode: () => void;
}

/**
 * useLoginModal
 * Encapsulates all non-JSX logic for LoginModal:
 * - form field state
 * - scroll lock
 * - Escape key handler
 * - focus management on open
 * - form submit handler
 *
 * Extracted from LoginModal.tsx — Phase 4 of refactor plan.
 */
export function useLoginModal(isOpen: boolean, onClose: () => void): LoginModalState {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const firstRef = useRef<HTMLInputElement>(null);

  // Focus first field & lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Tính năng đăng nhập sẽ sớm ra mắt! 🥜");
    onClose();
  };

  const toggleMode = () => setMode((m) => (m === "login" ? "register" : "login"));

  return {
    mode, showPw, email, password, username, firstRef,
    setMode, setShowPw, setEmail, setPassword, setUsername,
    handleSubmit, toggleMode,
  };
}
