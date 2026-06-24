# Daily Report - June 24, 2026

## Summary

Today the Peanut 2048 game was finalized, pushed to GitHub, deployed to Vercel production, and checked against the remote `origin/main`.

## GitHub Sync Check

- Branch: `main`
- Local commit before this report: `5413a79ea63b3e5f60b19e8b55c121e868e859ef`
- GitHub `origin/main` commit before this report: `5413a79ea63b3e5f60b19e8b55c121e868e859ef`
- Ahead/behind before this report: `0 / 0`
- Local working tree before this report: clean
- GitHub repository: `https://github.com/tducn110/2048888.git`

Conclusion: local source and GitHub were fully synced before this report file was added.

## Commit Comparison

Compared product commit before today's full update against the shipped commit:

- Previous commit: `3eba46c` - `fix: address exhaustive-deps warnings in GameBoard and missing react dependencies`
- Current shipped commit: `5413a79` - `Ship peanut 2048 game updates`
- Diff size: `142 files changed`, `21794 insertions`, `6105 deletions`
- Report commit: this file is added as a follow-up documentation commit after the shipped product commit.

Main differences from `3eba46c` to `5413a79`:

- App shell and screen flow:
  - Before: app entered directly into the 2048 game layout.
  - After: app has a screen state router for `login`, `dashboard`, `game`, `leaderboards`, and `settings`.
  - Added guest flow from login into game.
  - Added logged-in name state and dashboard route.
  - Added quit behavior: guest returns to login, logged-in player returns to dashboard.
  - Added screen switching from the game header into leaderboard, settings, and account/login.
  - Lazy-loaded non-game screens so the first game screen remains the initial experience.
- Game menu/header changes:
  - Added a top header area inside the game card.
  - Added header action buttons:
    - Trophy button for leaderboards
    - Settings button for settings
    - User button for login/account
  - Added accessible names for icon-only header buttons.
  - Added `Về Làng` action below HUD for leaving the game screen.
  - Kept the current board controls and swipe/keyboard movement behavior.
- Mascot and character work:
  - Added `GameHeader` to show the active mascot beside the title.
  - Added Pixi-based `Mascot` component for the peanut idle/wave spritesheet.
  - Added static avatar mascots for dog, bamboo gift, and orange tabby themes.
  - Added mascot-specific background color tokens in the header tile.
  - Added optimized 180px mascot variants for the header image path.
  - Kept original full-size mascot/avatar assets in `public/assets` for reuse.
- Game renderer and board changes:
  - Replaced the old React tile component path with Pixi board rendering.
  - Added `Pixi2048Renderer` for board cells, tile rendering, movement animation, merge pop animation, pooling, and resize handling.
  - Updated `GameBoard` to mount and sync Pixi rendering while preserving swipe handling.
  - Removed old `Tile.tsx` because tile drawing moved into Pixi renderer.
- Screens added:
  - `Login`: player name entry and guest play entry.
  - `Dashboard`: player overview and play/logout actions.
  - `Leaderboards`: leaderboard presentation screen.
  - `Settings`: sound toggle and notifications toggle UI.
- Game state and overlay behavior:
  - Added revive flow for lost state.
  - Added double-score flow from the win overlay.
  - Preserved result recording on terminal states.
  - Reset now refreshes the active theme id within the existing four-theme background system.
- Audio system:
  - Added `useGameAudio`.
  - Added background music from `music.mp3`.
  - Added SFX for move, merge, win, lose, and tap actions.
  - Added Kenney UI Audio CC0 license file.
  - Connected settings sound toggle to real audio behavior.
  - Changed music to lazy-load after first trusted user interaction so initial load is not blocked by the large music file.
- Visual/background/theme work:
  - Updated `CountrysideBackdrop` with theme variants tied to `bgId`.
  - Added `PixiBackground` file as an available background renderer, but the active app path remains `CountrysideBackdrop` after the accidental background swap was reverted.
  - Added public background images `bg-1.webp` through `bg-8.webp` for asset availability.
  - Updated global styles and font setup for the final game presentation.
- Public asset package:
  - Added avatar images and no-background avatar variants.
  - Added peanut idle/wave spritesheet PNG/WebP and JSON.
  - Added background image assets.
  - Added audio assets.
  - Added self-hosted Be Vietnam Pro font files.
  - Added optimized LCP-friendly mascot images.
- Lighthouse and SEO fixes:
  - Removed external Google Fonts request from HTML/CSS.
  - Self-hosted fonts with `font-display: swap`.
  - Removed `maximum-scale=1.0` and `user-scalable=no` from viewport.
  - Added valid `public/robots.txt`.
  - Added accessible labels to icon-only buttons.
  - Improved reported contrast issues in HUD label and hint text.
  - Avoided eager music download on initial page load.
- Repo/documentation cleanup:
  - Added docs/workflow/reporting material.
  - Removed unused Figma Make debris under `src/_unused/figma-make`.
  - Removed pasted import notes under `src/imports/pasted_text`.
  - Added ignore rules for local runtime/tool folders.

Impact:

- The current shipped commit is substantially larger than the previous commit because it includes the complete app update, asset package, docs package, audio system, and Lighthouse fixes.
- Core game verification still passed after the update: build passed, tests passed, production deploy returned `READY`.

## Production Deploy

- Vercel project: `peanut-2048-game`
- Production URL: `https://peanut-2048-game.vercel.app`
- Deployment URL: `https://peanut-2048-game-4ja8h03mg-ntduc011006dn-3691s-projects.vercel.app`
- Deployment ID: `dpl_25wSNeffYUj6ur2inUp8ZeLYLmYy`
- Vercel state: `READY`
- Live URL check: `HTTP/2 200`

## Work Completed

- Navigation/menu and screens:
  - Added a real app-level screen flow instead of only rendering the game.
  - Added login, dashboard, leaderboard, settings, account/login routing, and quit-to-village behavior.
  - Added in-game header menu buttons for leaderboard, settings, and account/login.
  - Added the `Về Làng` control in the game screen.
- Mascot system:
  - Added active mascot display in the game header.
  - Added peanut Pixi mascot animation from spritesheet.
  - Added dog, bamboo gift, and orange tabby mascot image variants.
  - Added optimized header mascot assets for Lighthouse/LCP.
- Pixi/game rendering:
  - Added Pixi-based board renderer for cells, tiles, movement, merge animation, and resize sync.
  - Replaced the old React tile render path with Pixi rendering.
  - Kept current keyboard and mobile swipe controls.
- Added game audio support:
  - Background music from `public/assets/audio/music.mp3`
  - SFX files from Kenney UI Audio, with CC0 license included
  - Lazy music loading after user interaction so the large music file does not block initial load
  - Settings toggle now controls actual sound behavior
- Preserved current game/background behavior after reverting the accidental background route change.
- Improved Lighthouse-related areas:
  - Removed external Google Fonts render-blocking requests
  - Self-hosted Be Vietnam Pro font files
  - Added valid `public/robots.txt`
  - Removed mobile viewport zoom lock
  - Added accessible labels for header icon buttons
  - Optimized header mascot images for the displayed size
  - Lazy-loaded non-game screens while keeping the game as the first screen
  - Improved small text contrast reported by Lighthouse
- Added full game/public asset set and documentation package to the repository.

## Verification

- `npm run build`: passed
- `npm test`: passed
  - 17 test cases passed
- Targeted ESLint on changed TS/TSX files: passed
- Production Vercel URL returned `HTTP/2 200`

## Lighthouse Production Preview

Measured against production preview, not the Vite dev server.

Latest recorded Lighthouse CLI result:

- Performance: `85`
- Accessibility: `95`
- Best Practices: `96`
- SEO: `100`
- FCP: `2.8s`
- LCP: `2.9s`
- TBT: `250ms`
- CLS: `0.013`
- Speed Index: `2.8s`
- Total byte weight: `665 KiB`

Previous clean production run in the same session varied slightly:

- Performance: `89`
- Accessibility: `96`
- Best Practices: `96`
- SEO: `100`

Note: Lighthouse scores vary between runs. The original `36` Performance score came from auditing the Vite dev server with Chrome extension/storage noise, so production preview is the correct baseline.

## Remaining Notes

- Full `npm run lint` still needs a repo-level ignore/config cleanup if it should be used globally, because the project has local/vendor-like directories that should not be linted.
- `npm run typecheck` still needs TypeScript/react type cleanup if the project wants strict typecheck as a hard CI gate.
- Vite still warns that the main JS chunk is larger than 500 KiB because PixiJS remains part of the first-screen game renderer. This was not changed to avoid affecting current gameplay.
