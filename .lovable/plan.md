## What I'll change

### 1. Send vs Dictate parity (small)
Both already `h-9 w-9`, but Send uses `overflow-hidden` + an `animate` opacity that can race with the hover scale, making it visually "pop" larger. Fix:
- Match `overflow-visible` on Send.
- Make hover scale identical (`1.04`) and only apply when enabled, on both.
- Replace `animate={{opacity}}` with a static class for disabled state — no layout-affecting motion.

### 2. Top-bar adopts the composer style
The right cluster in `TopBar` is currently raw white pills with `bg-white border-zinc-200`. Replace each control with `ctx.btn` (so it inherits btn-mech / btn-mech-light / future picked style) and group them in `ctx.panel` to match the composer chrome. Add a real Preferences button (currently inert) that opens the new panel.

### 3. New Preferences panel
- New `settingsStore` (pub/sub, persisted to localStorage): `{ themeId, hue, saturation, lightness, buttonStyleId }`.
- New `<PreferencesPanel/>` popover anchored to the prefs button in TopBar.
- **Theme presets** (4): Obsidian, Graphite Ink, Ocean Deep, Plasma Violet. Each applies a few CSS vars on `:root` (--background, --foreground, --accent, --panel-bg).
- **HSL sliders**: hue (0–360), saturation (0–100), lightness (0–100). Apply via `filter: hue-rotate()` on root + accent var derived from sliders. Live updates.
- **Button-style picker**: scroll list of 10 named styles ("Mech", "Clean", "Emboss", "3D Depth", "Penrose", "Squircle", "Liquid", "Pebble", "Inflated", + 1 new "Paper") — each shows a tiny live preview button using that style's class. Selecting one updates `ctx.btn` everywhere by reading from the store.
- Replaces the floating bottom-right Sun/Moon toggle — light/dark stays as a single segmented toggle at the top of the panel.

### 4. New `/connectors` lab page (separate route)
`src/routes/connectors.tsx` — same shape as `/buttons`. Renders the same 6 connectors (GitHub, Notion, Slack, Drive, Calendar, Postgres) in 10 visually distinct treatments, with one "Status: linked / needs auth / active" demo state per card so you can see all three:

1. **Icon Grid** — current (compact squares, dot when on, amber ! when needs auth).
2. **Pill List** — horizontal pills with label + status dot.
3. **Stacked Cards** — taller card with icon, name, "Connected"/"Connect" CTA.
4. **Mono Chips** — text-only with leading status glyph (●/○/!).
5. **Avatar Stack** — circular icon badges, overlapping.
6. **Switchboard** — grid with full toggle switch on the right of each.
7. **Terminal** — monospace rows, `[on]` / `[off]` / `[auth?]` brackets.
8. **Mech Keycap** — 3D keycap with icon, depresses on tap.
9. **Glass Tile** — frosted glass squares with glow when active.
10. **Index Card** — paper card with serif label + dotted underline status.

Each variant is wired to the same `toolsStore` so toggling works for real. After you pick one, I swap it into the composer's connectors section.

### Files
- edit `src/routes/layout.tsx` — send fix, TopBar restyle, settingsStore, PreferencesPanel, swap floating toggle.
- new `src/routes/connectors.tsx` — 10 connector variants.
- edit `src/styles.css` — add `btn-paper` (the 10th button style) + a few preset theme classes.

### Out of scope (this pass)
- I won't wire the chosen button-style into every existing `/v*` showcase route — just the `/layout` composer (which is what your screenshots show).
- Sliders won't write to every color token in the system, only the ones that visibly change the composer (bg, fg, accent, ring).
