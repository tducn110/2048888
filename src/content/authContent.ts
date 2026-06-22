/**
 * authContent.ts
 * Static copy for the Login/Register modal.
 * Extracted from src/components/auth/LoginModal.tsx — Phase 3 of refactor plan.
 */

export const AUTH_CONTENT = {
  login: {
    heading:      "Chào Mừng Trở Lại!",
    subheading:   "Đăng nhập để lưu điểm số của bạn",
    submit:       "Đăng Nhập →",
    switchPrompt: "Chưa có tài khoản? ",
    switchAction: "Đăng ký ngay",
    forgotPw:     "Quên mật khẩu?",
    ariaLabel:    "Đăng nhập",
  },
  register: {
    heading:      "Tham Gia Bộ Lạc!",
    subheading:   "Tạo tài khoản để bắt đầu hành trình",
    submit:       "Tạo Tài Khoản →",
    switchPrompt: "Đã có tài khoản? ",
    switchAction: "Đăng nhập",
    ariaLabel:    "Đăng ký",
  },
  social: [
    { label: "Google",   icon: "G", bg: "#fff",     border: "#e0e0e0", color: "var(--ink-dark)" },
    { label: "Facebook", icon: "f", bg: "#1877f2",  border: "#1877f2", color: "white"           },
  ] as const,
  divider:      "HOẶC",
  placeholders: {
    username: "Tên hiển thị",
    email:    "Email",
    password: "Mật khẩu",
  },
  closeLabel:   "Đóng",
  comingSoon:   "Tính năng đăng nhập sẽ sớm ra mắt! 🥜",
} as const;
