Đúng. Mấy file phase của m đang **đúng về quy trình**, nhưng quá specific cho FruitGame: Phase 2A/2B/3A/3C… bị khóa theo tên file, tên hook, tên phase nên khi qua game khác sẽ phải viết lại rất lâu. Pattern chung nên giữ là: mỗi phase có mục tiêu, scope được sửa/không được sửa, ownership, stop condition, verify command và graph gate. Đây là pattern đã lặp lại trong các file phase của m. 

Điểm quan trọng nhất: đừng đưa prompt tổng quá dài cho agent, vì agent có thể tự chạy tiếp phase sau. File Phase 2B của m đã chỉ ra lỗi này: prompt tổng chứa 2A–2F khiến agent có thể chạy lố phase, nên phải dùng prompt từng sub-phase riêng. 

Dưới đây là **bảng checklist chung**, dùng được cho mọi web game React/PixiJS/Canvas/DOM game. M chỉ cần thay tên file cụ thể theo project.

# UNIVERSAL GAME REFACTOR CHECKLIST

Dùng cho mọi dự án web game khi refactor bằng AI, Codex, Mimo, Claude, Gemini hoặc bất kỳ agent nào.

Mục tiêu của checklist này là tránh các lỗi:

* Sửa quá rộng trong một lần.
* Đổi gameplay khi chỉ muốn sửa UI.
* Đổi UI khi chỉ muốn sửa core.
* Tự ý thêm dependency.
* Tự ý xóa feature.
* Tách file nhưng làm bẩn dependency graph.
* Làm build pass nhưng architecture vẫn sai.
* Agent tự proceed sang phase tiếp theo.

---

# 0. Luật tối cao

| Mục                 | Checklist                                                                                      | PASS/FAIL |
| ------------------- | ---------------------------------------------------------------------------------------------- | --------- |
| Contract            | Task có đủ `Goal`, `Non-goals`, `Allowed files`, `Forbidden files`, `Definition of done` chưa? |           |
| Scope               | Checklist chỉ dùng để kiểm tra, không được mở rộng file được sửa.                              |           |
| Out-of-scope        | Nếu bug nằm ngoài allowed files, chỉ report follow-up, không patch.                            |           |
| One task            | Một task chỉ nên tạo một diff/commit có cùng mục tiêu.                                         |           |
| No proceed          | Agent phải dừng sau phase hiện tại, không tự làm phase tiếp theo.                              |           |
| No destructive fix  | Không được xóa feature, comment code, disable test/lint để “fix nhanh”.                        |           |
| No dependency drift | Không thêm/xóa dependency nếu task không cho phép.                                             |           |
| Dirty tree          | Không reset, checkout, xóa file chưa tracking nếu chưa được yêu cầu.                           |           |

---

# 1. Template contract bắt buộc cho mọi task

```txt
Goal:
- ...

Non-goals:
- ...

Allowed files:
- ...

Forbidden files:
- ...

Definition of done:
- ...
```

Nếu không viết được 5 phần này thì chưa được refactor.

---

# 2. Bảng checklist trước khi sửa code

| Nhóm             | Câu hỏi kiểm tra                                           | PASS/FAIL |
| ---------------- | ---------------------------------------------------------- | --------- |
| Repo discovery   | Đã đọc `package.json` để biết script thật chưa?            |           |
| Entrypoint       | Đã biết app chạy từ file nào chưa?                         |           |
| Game core        | Đã biết gameplay source of truth nằm ở đâu chưa?           |           |
| Render layer     | Đã biết render/canvas/Pixi layer nằm ở đâu chưa?           |           |
| UI owner         | Đã biết component nào chỉ render UI chưa?                  |           |
| Data owner       | Đã biết Firebase/localStorage/API nằm ở đâu chưa?          |           |
| Audio owner      | Đã biết audio manager/hook nằm ở đâu chưa?                 |           |
| Current behavior | Đã ghi behavior hiện tại cần giữ chưa?                     |           |
| Baseline         | Đã chạy baseline build/test/typecheck nếu có chưa?         |           |
| Dirty files      | Đã check `git status` chưa?                                |           |
| Existing failure | Nếu baseline fail sẵn, đã ghi rõ lỗi trước khi patch chưa? |           |

---

# 3. Bảng chọn loại phase chung

| Loại phase              | Khi nào dùng                                                             | Được sửa                              | Không được sửa                               |
| ----------------------- | ------------------------------------------------------------------------ | ------------------------------------- | -------------------------------------------- |
| Boundary phase          | Khi dependency graph bẩn, type nằm sai layer, data hook import component | types, core boundary, lib/data helper | UI lớn, render lifecycle, gameplay feel      |
| Orchestrator extraction | Khi component chính ôm session/input/ticker/render/data                  | component orchestrator + hook mới     | core rules, UI redesign, backend             |
| Runtime phase           | Khi cần tách session, timer, game loop, replay, game over                | runtime hooks                         | render resource, visual style, Firebase      |
| Input phase             | Khi cần tách pointer/touch/keyboard/drag/swipe                           | input hook, coordinate helper         | ticker, scoring, sprite lifecycle            |
| Render lifecycle phase  | Khi cần ổn định Pixi/canvas/app/layer/resize/DPR                         | render hook liên quan                 | gameplay, input, storage, UI                 |
| Texture/asset phase     | Khi có leak, black texture, asset load sai                               | texture/asset hook                    | sprite gameplay, app lifecycle nếu không cần |
| Sprite/object phase     | Khi object duplicate/leak/stale sau replay                               | sprite/object hook                    | texture generation, gameplay rules           |
| Effects phase           | Khi particle/feedback/slice/trail bị leak hoặc stale                     | effect hook                           | app creation, core, scoring                  |
| Data phase              | Khi score/auth/leaderboard/local fallback lẫn lộn                        | lib/data hooks                        | game loop, render, UI redesign               |
| Audio phase             | Khi BGM/SFX/mute/autoplay lẫn component                                  | audio manager/hook                    | core, render, UI lớn                         |
| UI phase                | Khi layout/overlay/responsive sai                                        | UI components/CSS trong scope         | core, ticker, data, render lifecycle         |
| Cleanup phase           | Khi legacy/mock/dependency làm AI hiểu nhầm                              | unused files/deps trong scope         | feature đang dùng, test để fake pass         |
| Audit phase             | Khi chưa chắc lỗi nằm đâu                                                | không sửa code                        | không patch, không refactor                  |
| Final gate phase        | Khi phase đã xong và cần xác nhận sạch                                   | không sửa hoặc chỉ fix conflict thật  | không làm phase tiếp theo                    |

---

# 4. Bảng ownership chung

| Layer             | Được sở hữu                                                  | Không được sở hữu                                  |
| ----------------- | ------------------------------------------------------------ | -------------------------------------------------- |
| `core`            | gameplay rule, simulation, scoring rule, win/lose condition  | React, Pixi, DOM, Firebase, localStorage, audio    |
| `types`           | shared domain types                                          | runtime side effect                                |
| `config`          | balance, tuning, constants                                   | UI state, storage                                  |
| `runtime hooks`   | session, timer, replay, game over, ticker orchestration      | sprite/texture ownership, Firebase                 |
| `input hooks`     | keyboard, pointer, touch, drag, swipe, coordinate input      | scoring formula, ticker ownership, render resource |
| `render app hook` | canvas/app/stage/layer/resize/DPR cleanup                    | gameplay rules, input events, score saving         |
| `texture hook`    | generated textures, asset load, texture cleanup              | sprite lifecycle, app creation, gameplay           |
| `sprite hook`     | active sprite/object creation, sync, cleanup                 | texture destruction, gameplay mutation             |
| `effect hook`     | particle, feedback, trail, temporary visual object lifecycle | app creation, score, storage                       |
| `UI components`   | JSX, buttons, overlays, panels, layout                       | gameplay simulation, network save                  |
| `data hooks`      | Firebase/API/local fallback orchestration                    | Pixi objects, game loop, UI layout                 |
| `lib`             | low-level API/storage/audio implementation                   | React component rendering                          |
| `docs`            | current architecture, target architecture if labeled         | fake claims not matching code                      |

---

# 5. Bảng forbidden dependency chung

| Rule             | Forbidden edge                                         |
| ---------------- | ------------------------------------------------------ |
| Core purity      | `core -> React`                                        |
| Core purity      | `core -> PixiJS/Canvas engine`                         |
| Core purity      | `core -> Firebase/API`                                 |
| Core purity      | `core -> localStorage/window/document`                 |
| Data isolation   | `data hook -> UI component`                            |
| Render isolation | `render hook -> Firebase/API`                          |
| Input isolation  | `input hook -> score persistence`                      |
| UI isolation     | `button/panel component -> game core mutation`         |
| Audio isolation  | `core -> audio manager`                                |
| Test integrity   | `production code -> test helper`                       |
| Docs safety      | `docs claim architecture that code does not implement` |

---

# 6. Bảng lifecycle checklist

| Khu vực    | Checklist                                                          | PASS/FAIL |
| ---------- | ------------------------------------------------------------------ | --------- |
| App/canvas | Tạo app/canvas đúng một lần mỗi mount.                             |           |
| App/canvas | Cleanup app/canvas khi unmount.                                    |           |
| StrictMode | Mount/unmount/remount không tạo duplicate app/listener/ticker.     |           |
| Resize     | ResizeObserver hoặc resize listener được disconnect.               |           |
| Ticker     | Ticker add/remove đúng handler reference.                          |           |
| Timer      | `setTimeout`, `setInterval`, `requestAnimationFrame` được cleanup. |           |
| Event      | pointer/touch/keyboard listener được remove.                       |           |
| Texture    | Texture tạo ở đâu thì cleanup ở đó.                                |           |
| Sprite     | Sprite cleanup không destroy texture không sở hữu.                 |           |
| Particle   | Particle expired được remove và destroy.                           |           |
| Feedback   | Feedback/timer/text không stale sau replay.                        |           |
| State      | Không setState sau unmount.                                        |           |
| Replay     | Replay 3 lần không duplicate object/ticker/listener.               |           |

---

# 7. Bảng game loop/performance checklist

| Mục          | Checklist                                                    | PASS/FAIL |
| ------------ | ------------------------------------------------------------ | --------- |
| React state  | Không setState mỗi frame nếu không cần.                      |           |
| Allocation   | Không tạo Sprite/Graphics/Texture mỗi frame nếu tránh được.  |           |
| Object pool  | Có reuse hoặc cap object với particle/effect nhiều.          |           |
| Delta time   | Dùng delta time nhất quán.                                   |           |
| Pause/resume | Ticker/game loop tôn trọng pause/game over.                  |           |
| Spawn timing | Không đổi spawn timing nếu task không yêu cầu.               |           |
| Physics      | Không đổi gravity/speed/hitbox nếu task không yêu cầu.       |           |
| Input feel   | Không đổi threshold/swipe/click feel nếu task không yêu cầu. |           |
| Cleanup      | Game over/replay clear runtime visual state đúng.            |           |

---

# 8. Bảng input/coordinate checklist

| Mục          | Checklist                                                        | PASS/FAIL |
| ------------ | ---------------------------------------------------------------- | --------- |
| Normalize    | Pointer/mouse/touch/keyboard được normalize.                     |           |
| Coordinate   | Có `screenToWorld`/`worldToScreen` hoặc equivalent rõ ràng.      |           |
| Scale        | Không tự nhân scale rải rác nhiều file.                          |           |
| Hitbox       | Hitbox dùng cùng coordinate system với input.                    |           |
| Mobile       | Touch listener cần preventDefault thì dùng `{ passive: false }`. |           |
| Scroll       | Canvas có `touch-action: none` nếu game cần swipe/drag.          |           |
| Cleanup      | Listener remove đầy đủ.                                          |           |
| Double input | Không bị bắn double do mouse + touch cùng lúc.                   |           |

---

# 9. Bảng UI/layout checklist

| Mục              | Checklist                                             | PASS/FAIL |
| ---------------- | ----------------------------------------------------- | --------- |
| Game-first       | Màn chơi là trung tâm.                                |           |
| No landing drift | Không tự biến game thành landing page/marketing site. |           |
| Overlay          | Modal/panel/game over/HUD có z-index rõ.              |           |
| Pointer events   | Overlay không bị canvas ăn click.                     |           |
| Mobile           | Mobile ưu tiên vùng chơi trước.                       |           |
| Responsive       | Dùng `100dvh`/safe area nếu cần.                      |           |
| Button           | Button đủ lớn để chạm.                                |           |
| HUD              | HUD không che vùng thao tác chính.                    |           |
| Design tokens    | Không hard-code style lệch theme nếu đã có token.     |           |
| UI-only task     | Không sửa core/ticker/storage trong UI-only task.     |           |

---

# 10. Bảng data/backend/storage checklist

| Mục            | Checklist                                                   | PASS/FAIL |
| -------------- | ----------------------------------------------------------- | --------- |
| Offline        | Game vẫn chơi được khi chưa login/mất mạng.                 |           |
| Save score     | Save lỗi thì show non-blocking error, không crash game.     |           |
| Local fallback | LocalStorage helper nằm ở lib/helper riêng nếu phình.       |           |
| Core purity    | Core không import Firebase/localStorage.                    |           |
| Network        | Game loop không chờ network.                                |           |
| Naming         | Dùng tên rõ: `savingScore`, `saveError`, `scoreSubmitted`.  |           |
| Anti-cheat     | Không overengineer anti-cheat ở v1 nếu không cần.           |           |
| Race           | Có cancel guard nếu user/session đổi khi request đang chạy. |           |

---

# 11. Bảng audio checklist

| Mục             | Checklist                                                                            | PASS/FAIL |
| --------------- | ------------------------------------------------------------------------------------ | --------- |
| Low-level owner | AudioContext/BGM/SFX buffer nằm trong audio manager/lib.                             |           |
| React wrapper   | Component gọi audio qua hook/callback, không import engine trực tiếp nếu tránh được. |           |
| Core isolation  | Core không biết audio tồn tại.                                                       |           |
| User gesture    | BGM/autoplay được unlock bằng user gesture.                                          |           |
| Mute            | Mute state không phá preload/playback state.                                         |           |
| Cleanup         | Stop BGM/SFX và close/cleanup đúng nếu app teardown.                                 |           |
| SFX             | Có giới hạn polyphony nếu spam hiệu ứng.                                             |           |

---

# 12. Bảng asset/render-art checklist

| Mục          | Checklist                                                           | PASS/FAIL |
| ------------ | ------------------------------------------------------------------- | --------- |
| Asset format | Biết asset dùng PNG/WebP/SVG/spritesheet.                           |           |
| Ownership    | File art chỉ vẽ/render, không chứa gameplay rule.                   |           |
| Texture load | Không dùng texture/image trước khi load xong.                       |           |
| Fallback     | Asset fail có fallback an toàn.                                     |           |
| Naming       | File art không quá rộng kiểu `utils` chứa cả art + type + gameplay. |           |
| Split later  | Nếu file art quá rộng, tách `art/`, `types/`, `coordinates/`.       |           |

---

# 13. Bảng verification chung

| Nhóm             | Command/check                                        | PASS/FAIL |
| ---------------- | ---------------------------------------------------- | --------- |
| Package scripts  | Đọc `package.json` trước, chỉ chạy script tồn tại.   |           |
| Typecheck        | `npm run typecheck` nếu có.                          |           |
| Test             | `npm test` nếu có.                                   |           |
| Build            | `npm run build`.                                     |           |
| Lint             | `npm run lint` nếu có.                               |           |
| Diff whitespace  | `git diff --check`.                                  |           |
| Dependency graph | Kiểm tra import edges/forbidden edges/circular deps. |           |
| Manual smoke     | Start game, replay, game over, resize, mobile input. |           |
| Console          | Không crash/spam warning/error mới.                  |           |
| Report missing   | Nếu không chạy được command, phải ghi lý do.         |           |

---

# 14. Bảng stop condition

| Stop khi                         | Hành động                           |
| -------------------------------- | ----------------------------------- |
| Cần sửa file ngoài allowed files | Dừng và report file + lý do + risk. |
| UI-only task cần sửa gameplay    | Dừng, tách task mới.                |
| Core-only task cần sửa UI        | Dừng, tách task mới.                |
| Cần thêm dependency              | Dừng, xin scope riêng.              |
| Test cần đổi expected behavior   | Dừng, xác nhận behavior change.     |
| Baseline build đã fail sẵn       | Ghi baseline fail, không sửa lan.   |
| Diff vượt quá scope              | Dừng, split task.                   |
| Agent muốn làm phase tiếp theo   | Dừng sau report hiện tại.           |
| Không xác định ownership         | Audit trước, không patch.           |

---

# 15. Format phase prompt chung

```txt
Bạn là senior TypeScript/React/Game architect.

Nhiệm vụ hiện tại:
PHASE X — <tên phase>

Chỉ làm Phase X.
Không làm Phase X+1.
Không refactor ngoài scope.
Stop after Phase X report.

Current locked state:
- <phase trước đã PASS>
- <ownership đã khóa>

Goal:
- <mục tiêu đúng 1 lớp>

Allowed files:
- <file được sửa>

Forbidden files:
- <file không được sửa>

Ownership contract:
<file/hook/component này được sở hữu gì>
<file/hook/component này không được sở hữu gì>

Required checks:
- <lifecycle/input/render/data checks>

Stop conditions:
- Nếu cần sửa ngoài scope, dừng và report.
- Nếu cần đổi behavior, dừng và report.
- Nếu cần thêm dependency, dừng và report.

Verification:
- npm run typecheck nếu có
- npm test nếu có
- npm run build
- git diff --check
- dependency graph check

Output required:
1. Changed files
2. Why each file changed
3. Preserved behavior
4. Ownership/boundary result
5. Commands run + result
6. Follow-up risks
7. Final PASS/FAIL
```

---

# 16. Bảng output report chung

| Mục report           | Nội dung bắt buộc                                |
| -------------------- | ------------------------------------------------ |
| Changed files        | Liệt kê file đã sửa/tạo/xóa.                     |
| Scope check          | Tất cả file có nằm trong allowed files không?    |
| Behavior preserved   | Gameplay/UI/data behavior nào được giữ nguyên?   |
| Ownership result     | File/hook có còn đúng trách nhiệm không?         |
| Forbidden edge check | Có import edge sai không?                        |
| Lifecycle check      | Có cleanup listener/timer/ticker/resource không? |
| Commands run         | Typecheck/test/build/lint/diff check.            |
| Manual checks        | Nếu có, ghi rõ đã check gì.                      |
| Risks                | Rủi ro còn lại hoặc out-of-scope follow-up.      |
| Final status         | PASS hoặc FAIL.                                  |

---

# 17. Phase order chung cho game mới

```txt
PHASE 0 — Audit only
  -> Không sửa code
  -> Xác định architecture hiện tại
  -> Tìm file phình, dependency xấu, lifecycle risk

PHASE 1 — Contract / boundary stabilization
  -> Shared types
  -> Core purity
  -> Data/helper boundary
  -> Config cleanup

PHASE 2 — Extract orchestrator/runtime
  -> Session
  -> Input
  -> Ticker/game loop
  -> Trail/effect runtime nếu cần

PHASE 3 — Render lifecycle cleanup
  -> App/canvas/stage/layer
  -> Textures/assets
  -> Sprites/objects
  -> Particles/effects/feedback

PHASE 4 — Data/audio/bootstrap cleanup
  -> Score/auth/storage
  -> Audio manager/hook
  -> App bootstrap/loading

PHASE 5 — UI polish
  -> Overlay
  -> Responsive
  -> Buttons/panels
  -> Accessibility
  -> CSS/theme tokens

PHASE 6 — Final architecture gate
  -> Dependency graph
  -> Circular dependency
  -> Manual smoke
  -> Docs update
```

---

# 18. Checklist ngắn để dán vào mọi prompt

```txt
RULES:
- One phase only.
- Do not proceed to next phase.
- Do not change gameplay unless task says so.
- Do not change UI unless task says so.
- Do not add/remove dependency unless task says so.
- Do not edit tests just to make them pass.
- Do not remove features to fix bugs.
- Allowed files are strict.
- Checklist does not expand allowed files.
- Out-of-scope issues must be reported, not patched.
- Verify with existing package scripts only.
- Report PASS/FAIL.
```

Cách dùng thực tế: m đừng viết prompt kiểu “Phase 2 tổng” nữa. Hãy dùng bảng trên để tạo **một phase nhỏ duy nhất**. Các file của m đã cho thấy format tốt nhất là “chỉ làm Phase X, không làm Phase X+1, stop after report”, như Phase 3A và Phase 3C đều khóa rất rõ scope allowed/not allowed và ownership.  

Cái nên giữ bắt buộc cho mọi game là **MCP/code graph gate**: build/test pass chưa đủ, vì code có thể chạy nhưng dependency vẫn bẩn. File Phase 1 của m đã ghi rõ sau mỗi phase phải check import edges, reverse references, circular dependencies và forbidden edges. 
