# 0. Primary Rule

```txt
No phase is complete without a phase report.
No next phase is allowed unless this phase is PASS.
```

If the phase is `FAIL` or `BLOCKED`:

```txt
Do not proceed.
Do not start the next phase.
Do not patch unrelated issues.
Explain what failed or blocked the phase.
```

---

# 1. Phase Identity

```txt
Phase:

Sub-phase, if any:

Task name:

Task type:
[ ] analysis-only
[ ] docs-only
[ ] UI/layout
[ ] component extraction
[ ] game core
[ ] runtime/session
[ ] input
[ ] render/PixiJS
[ ] data/storage
[ ] audio
[ ] cleanup
[ ] final verification
[ ] other:

Date:

Agent/tool:
```

---

# 2. Status

```txt
Final status:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
```

## Status reason

```txt
Reason:
- ...
```

## Can proceed to next phase?

```txt
Can proceed:
[ ] Yes
[ ] No
```

If `No`:

```txt
Blocking reason:
- ...

Required fix before next phase:
- ...
```

---

# 3. Original Task Contract

Reference the task contract used for this phase.

```txt
Task contract:
- ...

Goal:
- ...

Non-goals:
- ...

Allowed files:
- ...

Forbidden files:
- ...

Behavior to preserve:
- ...

Validation commands:
- ...
```

If no task contract existed:

```txt
[ ] BLOCKED: No task contract was provided.
```

---

# 4. Summary Of Work

Write a short summary.

```txt
Summary:
- ...
```

Good summary:

```txt
Extracted GameHUD from GameScreen without changing gameplay behavior.
Preserved score/timer display and responsive order.
No core/render/data files were changed.
```

Bad summary:

```txt
Cleaned things up.
Improved code.
Made UI better.
```

---

# 5. Changed Files

List every changed file.

|File|Change type|Why changed|In allowed scope?|
|---|---|---|---|
||created / modified / moved / deleted||yes/no|

## Changed files list

```txt
Changed files:
- ...
```

## New files

```txt
New files:
- ...
```

## Deleted files

```txt
Deleted files:
- ...
```

## Moved / renamed files

```txt
Moved / renamed files:
- from:
  to:
  reason:
```

---

# 6. Scope Result

```txt
Scope result:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
```

Checklist:

```txt
[ ] Only allowed files changed.
[ ] No forbidden files changed.
[ ] No unexpected files changed.
[ ] No package/config/test/docs/global CSS files changed unless allowed.
[ ] No dependency or lockfile changed unless this was a dependency task.
```

If unexpected files changed:

```txt
Unexpected changed files:
- ...

Reason:
- ...

Action taken:
[ ] stopped
[ ] reverted
[ ] reported only
[ ] needs user decision
```

---

# 7. Behavior Preserved

List behavior that was preserved.

## Game behavior

```txt
[ ] Game starts.
[ ] Game can be played.
[ ] Score updates.
[ ] Win/lose condition unchanged.
[ ] Game over works.
[ ] Replay works.
[ ] Desktop input works.
[ ] Mobile input works.
[ ] Save score behavior unchanged.
[ ] Leaderboard/localStorage behavior unchanged.
[ ] Audio behavior unchanged.
[ ] Not applicable.
```

Notes:

```txt
- ...
```

## UI behavior

```txt
[ ] Product type preserved.
[ ] Game-first hierarchy preserved.
[ ] Game board/canvas remains primary.
[ ] Responsive behavior preserved.
[ ] Existing visual style preserved.
[ ] No landing-page drift.
[ ] Not applicable.
```

Notes:

```txt
- ...
```

## Route/app behavior

```txt
[ ] Route behavior unchanged.
[ ] App shell still renders.
[ ] Navigation still works.
[ ] Modal/panel behavior unchanged.
[ ] Not applicable.
```

Notes:

```txt
- ...
```

---

# 8. Design Compliance, If UI Task

```txt
Design compliance:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
[ ] NOT APPLICABLE
```

Design source used:

```txt
[ ] docs/05-DESIGN.md
[ ] docs/06-DESIGN-APPLICATION-GATE.md
[ ] Figma frame
[ ] Screenshot
[ ] Existing UI
[ ] User instruction
```

Checklist:

```txt
[ ] DESIGN.md was checked.
[ ] Design Application Gate was checked.
[ ] Product type preserved.
[ ] Visual hierarchy preserved.
[ ] Game-first layout preserved if applicable.
[ ] Existing tokens used where possible.
[ ] No random new colors/fonts/spacing introduced.
[ ] No hero/CTA/feature-card/landing drift added.
[ ] Responsive behavior preserved.
```

Visual drift risks:

```txt
- ...
```

---

# 9. Architecture / Ownership Result

```txt
Architecture result:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
[ ] NOT APPLICABLE
```

Layer touched:

```txt
[ ] core
[ ] runtime
[ ] input
[ ] render/PixiJS
[ ] UI
[ ] data/storage
[ ] audio
[ ] docs
[ ] cleanup
```

Ownership result:

```txt
[ ] Core remains gameplay source of truth.
[ ] Runtime only orchestrates.
[ ] Input only sends actions/intents.
[ ] Render/PixiJS only renders state.
[ ] React UI only displays state and sends events.
[ ] Data/storage only owns persistence.
[ ] Audio only owns sound.
[ ] Not applicable.
```

Architecture notes:

```txt
- ...
```

---

# 10. Dependency Graph / Code Graph Result

This section is required for architecture, core, runtime, input, render, data, cleanup, dependency, or component extraction phases.

```txt
Code graph result:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
[ ] NOT APPLICABLE
```

## Changed graph

```txt
Import edges:
- ...

Reverse references:
- ...

Circular dependency check:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
[ ] NOT AVAILABLE
```

## Forbidden edge check

```txt
[PASS/FAIL/NA] core does not import React
[PASS/FAIL/NA] core does not import PixiJS
[PASS/FAIL/NA] core does not import Firebase/API
[PASS/FAIL/NA] core does not reference window/document
[PASS/FAIL/NA] core does not use localStorage/sessionStorage
[PASS/FAIL/NA] core does not import audio
[PASS/FAIL/NA] render does not import Firebase/API
[PASS/FAIL/NA] render does not save score
[PASS/FAIL/NA] input does not save score
[PASS/FAIL/NA] data layer does not import UI component
[PASS/FAIL/NA] UI primitive does not import game-specific mutation logic
[PASS/FAIL/NA] no new circular dependencies
```

## MCP / graph tool output, if available

```txt
MCP/code graph evidence:
- ...
```

If graph tool was not available:

```txt
Graph tool:
[ ] NOT AVAILABLE

Fallback checks used:
- rg import checks
- manual import review
- TypeScript compile
```

---

# 11. Runtime / Lifecycle Result

Required for runtime, input, PixiJS/render, timer, ticker, event, effect, feedback, particle, or animation phases.

```txt
Lifecycle result:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
[ ] NOT APPLICABLE
```

Checklist:

```txt
[ ] Ticker add/remove ownership clear.
[ ] DOM listeners cleaned up.
[ ] Timers cleaned up.
[ ] requestAnimationFrame cleaned up if used.
[ ] Pixi Application owned and destroyed by render owner.
[ ] No duplicate canvas after remount.
[ ] No duplicate ticker/listener after replay.
[ ] Texture ownership clear.
[ ] Sprite ownership clear.
[ ] Shared textures not destroyed by wrong owner.
[ ] Async texture/image assignment guarded after unmount.
[ ] Effects/particles expire or clean up.
[ ] Screen shake resets.
[ ] No stale state after replay/home.
```

Notes:

```txt
- ...
```

---

# 12. Data / Storage Result

Required for score, leaderboard, localStorage, Firebase, API, auth, or persistence tasks.

```txt
Data/storage result:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
[ ] NOT APPLICABLE
```

Checklist:

```txt
[ ] Game remains playable without login/network.
[ ] Score saving is non-blocking.
[ ] localStorage fallback preserved.
[ ] Firebase/API behavior preserved.
[ ] playTimeSec behavior preserved or intentionally changed.
[ ] Save score does not fire twice.
[ ] Data layer does not import UI component.
[ ] Render layer does not import score saving.
```

Notes:

```txt
- ...
```

---

# 13. Audio Result

Required for audio-manager, useGameSound, mute UI, BGM/SFX changes.

```txt
Audio result:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
[ ] NOT APPLICABLE
```

Checklist:

```txt
[ ] Mute behavior preserved.
[ ] User gesture unlock preserved.
[ ] BGM behavior preserved.
[ ] SFX behavior preserved.
[ ] No duplicate SFX after replay/remount.
[ ] Core does not import audio.
[ ] Audio does not own gameplay rules.
```

Notes:

```txt
- ...
```

---

# 14. Dependency / Cleanup Result

Required for cleanup, scaffold, package, lockfile, or dependency changes.

```txt
Dependency/cleanup result:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
[ ] NOT APPLICABLE
```

Checklist:

```txt
[ ] Cleanup was isolated.
[ ] No gameplay/UI behavior changed.
[ ] No dependency removed without proof.
[ ] Runtime import check completed.
[ ] Scaffold import check completed.
[ ] Build passed after cleanup.
[ ] Lockfile change intentional.
[ ] Scaffold deletion/quarantine approved.
```

Notes:

```txt
- ...
```

---

# 15. Verification Commands

List all commands run.

```txt
Verification commands:
[PASS/FAIL/NA] npm run typecheck
[PASS/FAIL/NA] npm test
[PASS/FAIL/NA] npm run build
[PASS/FAIL/NA] npm run lint
[PASS/FAIL/NA] git diff --check
[PASS/FAIL/NA] git status --short reviewed
[PASS/FAIL/NA] git diff --stat reviewed
```

## Command output summary

```txt
npm run typecheck:
- ...

npm test:
- ...

npm run build:
- ...

npm run lint:
- ...

git diff --check:
- ...

git status --short:
- ...

git diff --stat:
- ...
```

If a script does not exist:

```txt
Command:
- ...

Status:
- NOT AVAILABLE

Evidence:
- script not present in package.json
```

If a command could not run:

```txt
Command:
- ...

Status:
- BLOCKED

Reason:
- ...
```

---

# 16. Manual Smoke Result

Required if phase affects UI, game, runtime, render, input, data, or audio.

```txt
Manual smoke:
[ ] PASS
[ ] FAIL
[ ] BLOCKED
[ ] NOT APPLICABLE
```

## Generic app checks

```txt
[PASS/FAIL/NA] App loads without blank screen.
[PASS/FAIL/NA] Main route renders.
[PASS/FAIL/NA] Navigation works.
[PASS/FAIL/NA] No console crash/spam.
[PASS/FAIL/NA] Responsive layout not obviously broken.
```

## Game checks

```txt
[PASS/FAIL/NA] Game starts.
[PASS/FAIL/NA] Game can be played.
[PASS/FAIL/NA] HUD updates.
[PASS/FAIL/NA] Game over works.
[PASS/FAIL/NA] Replay works.
[PASS/FAIL/NA] Desktop input works.
[PASS/FAIL/NA] Mobile input works.
[PASS/FAIL/NA] Overlay/panels clickable.
[PASS/FAIL/NA] No duplicate canvas/ticker/listener after replay/remount.
```

## UI checks

```txt
[PASS/FAIL/NA] Desktop layout OK.
[PASS/FAIL/NA] Tablet layout OK.
[PASS/FAIL/NA] Mobile layout OK.
[PASS/FAIL/NA] Game board/canvas remains primary.
[PASS/FAIL/NA] TopNav/Footer do not block play.
[PASS/FAIL/NA] Modal/panel clickable.
```

Notes:

```txt
- ...
```

---

# 17. Risk / Regression Notes

```txt
Remaining risks:
- ...

Regression risks:
- ...

Known limitations:
- ...

Follow-up needed:
- ...
```

Severity:

```txt
[ ] Low
[ ] Medium
[ ] High
[ ] Blocking
```

---

# 18. Out-Of-Scope Findings

List anything discovered but not patched.

```txt
Out-of-scope findings:
- file:
  issue:
  why out of scope:
  suggested separate task:
  priority:
```

Rule:

```txt
Out-of-scope findings must be reported, not patched.
```

---

# 19. Commit Recommendation

```txt
Commit recommendation:
[ ] SAFE TO COMMIT
[ ] DO NOT COMMIT
[ ] NO COMMIT NEEDED
```

Reason:

```txt
- ...
```

Suggested commit message:

```bash
git commit -m "..."
```

Only suggest commit if:

```txt
[ ] Phase status is PASS.
[ ] Scope is clean.
[ ] Verification passed or unavailable scripts were clearly reported.
[ ] No unexpected files changed.
```

---

# 20. Next Recommended Patch

Recommend only one next patch.

```txt
Next recommended patch:
- ...

Why:
- ...

Suggested phase:
- ...

Suggested allowed files:
- ...

Suggested non-goals:
- ...
```

Rule:

```txt
Recommend next patch only.
Do not start it.
Do not proceed automatically.
```

---

# 21. Final Phase Decision

```txt
Final phase decision:
[ ] PASS — phase complete, user may approve next phase.
[ ] FAIL — phase has issues caused by this patch.
[ ] BLOCKED — phase cannot be completed due to missing info/tool/scope/baseline issue.
```

## Final reason

```txt
Reason:
- ...
```

## Required action

```txt
Required action:
[ ] User may approve next phase.
[ ] Fix current phase first.
[ ] Clarify scope.
[ ] Run missing verification.
[ ] Resolve baseline issue.
[ ] Create separate task for out-of-scope change.
```

---

# 22. Final Reminder

```txt
A phase report records what actually happened.
It does not hide failed checks.
It does not authorize the next phase by itself.
The next phase starts only after user approval.
```