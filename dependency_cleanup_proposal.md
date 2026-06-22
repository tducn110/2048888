# PHASE 2 — Dependency Cleanup Proposal

Generated after Phase 1 quarantine + build pass.

## Summary

After moving all `src/app/components/ui/*` and `src/app/components/figma/*` to `src/_unused/figma-make/`,
the build passes with 0 errors. The dependency audit below classifies each production dependency.

---

## ✅ Runtime-used (DO NOT REMOVE)

| Package | Evidence |
|---|---|
| `lucide-react` | Imported in `TopNav.tsx`, `LoginModal.tsx`, `Dashboard.tsx` |
| `react` / `react-dom` | Core (peerDependencies) |

## ⚠️ Scaffold-only — Verify before removing

These are imported **only** inside the quarantined `src/_unused/` files.
Build passes without them, but verify with `npm run build` after each removal.

| Package | Reason |
|---|---|
| `@radix-ui/react-accordion` | Only in `_unused/ui/accordion.tsx` |
| `@radix-ui/react-alert-dialog` | Only in `_unused/ui/alert-dialog.tsx` |
| `@radix-ui/react-aspect-ratio` | Only in `_unused/ui/aspect-ratio.tsx` |
| `@radix-ui/react-avatar` | Only in `_unused/ui/avatar.tsx` |
| `@radix-ui/react-checkbox` | Only in `_unused/ui/checkbox.tsx` |
| `@radix-ui/react-collapsible` | Only in `_unused/ui/collapsible.tsx` |
| `@radix-ui/react-context-menu` | Only in `_unused/ui/context-menu.tsx` |
| `@radix-ui/react-dialog` | Only in `_unused/ui/dialog.tsx` |
| `@radix-ui/react-dropdown-menu` | Only in `_unused/ui/dropdown-menu.tsx` |
| `@radix-ui/react-hover-card` | Only in `_unused/ui/hover-card.tsx` |
| `@radix-ui/react-label` | Only in `_unused/ui/label.tsx` |
| `@radix-ui/react-menubar` | Only in `_unused/ui/menubar.tsx` |
| `@radix-ui/react-navigation-menu` | Only in `_unused/ui/navigation-menu.tsx` |
| `@radix-ui/react-popover` | Only in `_unused/ui/popover.tsx` |
| `@radix-ui/react-progress` | Only in `_unused/ui/progress.tsx` |
| `@radix-ui/react-radio-group` | Only in `_unused/ui/radio-group.tsx` |
| `@radix-ui/react-scroll-area` | Only in `_unused/ui/scroll-area.tsx` |
| `@radix-ui/react-select` | Only in `_unused/ui/select.tsx` |
| `@radix-ui/react-separator` | Only in `_unused/ui/separator.tsx` |
| `@radix-ui/react-slider` | Only in `_unused/ui/slider.tsx` |
| `@radix-ui/react-slot` | Only in `_unused/ui/button.tsx` |
| `@radix-ui/react-switch` | Only in `_unused/ui/switch.tsx` |
| `@radix-ui/react-tabs` | Only in `_unused/ui/tabs.tsx` |
| `@radix-ui/react-toggle` | Only in `_unused/ui/toggle.tsx` |
| `@radix-ui/react-toggle-group` | Only in `_unused/ui/toggle-group.tsx` |
| `@radix-ui/react-tooltip` | Only in `_unused/ui/tooltip.tsx` |
| `class-variance-authority` | Only in `_unused/ui/button.tsx` |
| `clsx` | Only in `_unused/ui/*.tsx` |
| `tailwind-merge` | Only in `_unused/ui/utils.ts` |
| `cmdk` | Only in `_unused/ui/command.tsx` |
| `embla-carousel-react` | Only in `_unused/ui/carousel.tsx` |
| `input-otp` | Only in `_unused/ui/input-otp.tsx` |
| `next-themes` | Only in `_unused/ui/sonner.tsx` |
| `react-day-picker` | Only in `_unused/ui/calendar.tsx` |
| `react-hook-form` | Only in `_unused/ui/form.tsx` |
| `react-resizable-panels` | Only in `_unused/ui/resizable.tsx` |
| `recharts` | Only in `_unused/ui/chart.tsx` |
| `sonner` | Only in `_unused/ui/sonner.tsx` |
| `vaul` | Only in `_unused/ui/drawer.tsx` |

## ❌ Not found anywhere in source (safe to remove immediately after build verify)

| Package | Evidence |
|---|---|
| `@emotion/react` | Zero imports found in any source file |
| `@emotion/styled` | Zero imports found in any source file |
| `@mui/icons-material` | Zero imports found in any source file |
| `@mui/material` | Zero imports found in any source file |
| `@popperjs/core` | Zero imports found in any source file |
| `canvas-confetti` | Zero imports found |
| `date-fns` | Zero imports found |
| `motion` | Zero imports found |
| `react-dnd` | Zero imports found |
| `react-dnd-html5-backend` | Zero imports found |
| `react-popper` | Zero imports found |
| `react-responsive-masonry` | Zero imports found |
| `react-router` | Zero imports found |
| `react-slick` | Zero imports found |
| `tw-animate-css` | Zero imports found |

---

## Safe Removal Order

> Execute only after confirming `npm run build` passes at each step.

### Step 1 — Remove definitely unused (not-found) packages

```bash
npm uninstall \
  @emotion/react @emotion/styled \
  @mui/icons-material @mui/material \
  @popperjs/core \
  canvas-confetti \
  date-fns \
  motion \
  react-dnd react-dnd-html5-backend \
  react-popper react-responsive-masonry \
  react-router react-slick \
  tw-animate-css
npm run build
```

### Step 2 — Remove scaffold-only Radix packages

Only after Step 1 build passes and you confirm you won't reactivate any scaffold UI:

```bash
npm uninstall \
  @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-aspect-ratio @radix-ui/react-avatar \
  @radix-ui/react-checkbox @radix-ui/react-collapsible \
  @radix-ui/react-context-menu @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu @radix-ui/react-hover-card \
  @radix-ui/react-label @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu @radix-ui/react-popover \
  @radix-ui/react-progress @radix-ui/react-radio-group \
  @radix-ui/react-scroll-area @radix-ui/react-select \
  @radix-ui/react-separator @radix-ui/react-slider \
  @radix-ui/react-slot @radix-ui/react-switch \
  @radix-ui/react-tabs @radix-ui/react-toggle \
  @radix-ui/react-toggle-group @radix-ui/react-tooltip \
  class-variance-authority clsx tailwind-merge \
  cmdk embla-carousel-react input-otp next-themes \
  react-day-picker react-hook-form react-resizable-panels \
  recharts sonner vaul
npm run build
```

> **Note:** Do not remove `tailwindcss`, `@tailwindcss/vite` — they are used by devDependencies and referenced in `vite.config.ts`.
