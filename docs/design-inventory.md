# Dhikr mobile app — design & styling inventory

This document inventories **current** visual patterns in `artifacts/mobile` as of the onboarding refactor. It does **not** prescribe changes; it supports future tokenization and consistency work.

**Existing theme entry points**

- `constants/colors.ts` — semantic palette (`text`, `foreground`, `primary`, `mutedForeground`, `introEmphasis`, `gold`, `glow`, etc.) plus `radius: 16`.
- `hooks/useColors.ts` — resolves `light` (and optional future `dark`) palette; exposes `radius`.
- `components/GradientBackground.tsx` — screen-level vertical gradients (`deep` default, `mid`, `card`, `gold`).
- `components/onboarding/onboardingStyles.ts` — very large `StyleSheet` for onboarding flows (typography, cards, journey board, goals lists, paywall, app lock, etc.).

Much of the UI still uses **hard-coded hex / rgba** alongside `useColors()`, so the system is **partially centralized**.

---

## Typography

### Font families

| Family | Loaded in | Usage |
|--------|-----------|--------|
| `Inter_400Regular`, `Inter_500Medium`, `Inter_600SemiBold`, `Inter_700Bold` | `app/_layout.tsx` via `@expo-google-fonts/inter` | Primary UI across onboarding (`onboardingStyles.ts`), tabs (`index`, `insights`, `settings`, `protection`), `ritual.tsx`, `PrimaryButton`, `SliderInput`, legacy `OnboardingStep3.tsx` |

**Recurring treatments**

- **Screen / section titles**: often `Inter_700Bold` at ~28px (`stepTitle`, `phoneHoursHeading`, home `greeting`-style blocks, insights/protection titles).
- **Body / subtitle**: `Inter_400Regular` at ~13–15px with lavender-muted colors (e.g. `rgba(196,162,247,0.75)`, `#9b80c8`, `mutedForeground` from tokens).
- **Emphasis / labels**: `Inter_500Medium` or `Inter_600SemiBold` for buttons, list rows, card titles.
- **Large numerics** (phone hours step): `Inter_700Bold` ~72px (`phoneHoursBigNum`).
- **Goals step title**: `Inter_700Bold` ~29px with light text shadow (`goalsStepTitle`).
- **Image intro slides**: `Inter_500Medium` ~31px intro line (`imageSlideIntroText`); small tag `Inter_400Regular` 13px (`smallTag`).
- **Verse / Arabic blocks**: `Inter_700Bold` for Arabic accent (`verseArabic`); mixed regular/italic for transliteration/translation.

### Font sizes (recurring ranges)

- **11–13px**: captions, tags, helper lines, paywall subcopy, streak/preview labels.
- **14–16px**: list labels, inputs, settings rows, primary button label (16px semibold).
- **18–22px**: section intros, reflection paragraphs (`screenTimeReflect*`), slider label.
- **28–31px**: main onboarding/screen headlines.
- **40px+**: mood tier label; **72px** hero hour readout.

### Line height & letter spacing

- Titles often **lineHeight ~37** for 28px headlines; body **~23** for 15px text.
- Tight negative **letterSpacing** on large numbers (`phoneHoursBigNum`, `phoneHoursMoodLabel`) and some titles (`imageSlideIntroText`, `goalsStepTitle`).
- Positive **letterSpacing** on small tags (`smallTag` 0.5) and primary button (0.3).

### Assessment

- **Intentional**: Inter scale + role separation (400/500/600/700) is consistent **by convention**, not via shared text style objects.
- **Ad hoc**: Same semantic roles (e.g. “subtitle”) use slightly different rgba purples and sizes between `onboardingStyles`, tab screens, and `SliderInput`.

---

## Colors

### From `constants/colors.ts` (semantic)

| Token | Value (light) | Role |
|-------|----------------|------|
| `text` / `foreground` / `cardForeground` | `#f0eaff` | Primary light text |
| `background` | `#1a0a2e` | App base |
| `primary` | `#C4A2F7` | Accent, FAB, switches ON, streak accents |
| `primaryForeground` | `#1a0a2e` | Text on primary fills |
| `mutedForeground` | `#9b80c8` | Muted UI text |
| `introEmphasis` | `#D7C0FF` | Hero/onboarding lavender highlight |
| `accent` / `gold` | `#F5C842` | Gold CTA, verse accents, flames |
| `border` / `input` | rgba lavender | Borders and inputs |
| `purpleDeep` / `purpleMid` / `purpleLight` | `#0d0620`, `#2a1050`, `#6B3FA0` | Brand depth (also align with gradients) |
| `glow` / `glowGold` | rgba | Glow hints |

### Hard-coded repeats (not all map to tokens)

- **Lavender family**: `#C4A2F7`, `rgba(196,162,247,…)` — borders, glows, progress, goal cards, back chevron `rgba(196,162,247,0.7)`.
- **Surfaces**: `rgba(45,26,74,…)` — cards, list rows, app tiles (often close to token `card` `#2d1a4a` but **not identical**).
- **Deep purple glass**: `rgba(32,14,54,0.18)` — mascot/art surfaces in onboarding.
- **Text purples**: `#f0eaff`, `#9b80c8`, `rgba(216,199,245,0.68)`, `rgba(155,128,200,0.7)` — **parallel “muted” lanes**.
- **Gold**: `#F5C842`, `#E8B84B` — verses, paywall, streak; matches tokens in places, duplicated in gradients.

### Assessment

- **Emerging standard**: `#f0eaff` + `#C4A2F7` + `#F5C842` + dark violet backgrounds.
- **Inconsistent**: Muted text sometimes from `useColors().mutedForeground`, sometimes literal `#9b80c8` or custom rgba.

---

## Gradients

| Location | Colors / usage | Notes |
|----------|----------------|--------|
| `GradientBackground` | `deep`: `#0d0620` → `#1a0a2e` → `#2a1050`; variants `mid`, `card`, `gold` | Whole-screen baseline |
| `PrimaryButton` | Primary: `#9B6FE8` → `#C4A2F7`; Gold: `#E8B84B` → `#F5C842` | Horizontal |
| Home verse card | `rgba(245,200,66,0.08)` → `rgba(45,26,74,0.8)` | Local in `index.tsx` |
| Insights / protection / settings | Various white/lavender washes on cards | Per-screen `LinearGradient` |
| Onboarding goals pick rows | `expo-linear-gradient` inside pressables | `goalsPickGradient*` in onboarding pages |
| Journey hero | `LinearGradient` inside name journey card | `OnboardingNameJourneyStep` |

**Assessment**: **Ad hoc per feature** with recurring **lavender + deep purple + gold wash** language.

---

## Spacing, layout, radii

### Safe area / page padding (repeated pattern)

- **Web**: `topPadding = 67`, `bottomPadding = 34` (onboarding, ritual); tab main screens often `insets.bottom + 84` for tab bar.
- **Native**: `insets.top` / `insets.bottom` with the same tab offset where applicable.

### Horizontal padding

- Onboarding scroll content: **24px** (`scrollContent`); header **20px**; image slides use **24px** sides for intro + FAB inset.
- Many centered columns **maxWidth ~340px** (phone hours, reflection, goals).

### Vertical rhythm

- Onboarding centered steps: `gap: 24` (`centeredStep`); phone hours column `gap: 32`.
- Goals reflect layout: specific `marginTop` / `marginBottom` pairs (e.g. subtitle rows **18px**).

### Border radii

- **28px**: primary button, image step FAB.
- **20px**: verse card, permission explainer, paywall card, some tab cards.
- **14–16px**: list rows, preview cards, inputs.
- **36px**: journey hero outer card.
- **Global token**: `colors.radius` **16** — **not** wired into most StyleSheets.

### Component dimensions

- `ProgressDots`: track `min(72% screen, 320)`, thin variant height **3**, gap **3**.
- `SliderInput`: `TRACK_WIDTH = 280`, `THUMB_SIZE = 32`.
- Mascot frames: multiple fixed sizes in `onboardingStyles` (e.g. `mascotSurface` 168, `artSurface` 236, goals header mascot 52–58).

### Assessment

- **Repeated intentionally** (24 padding, ~340 content width) but **duplicated as literals** across files.
- **Tab bar bottom inset** (`+ 84`) duplicated across tab screens.

---

## Components & motifs

### Mascot

- `MascotImage` + local **glow** (`rgba(196,162,247,0.18–0.2)` + gold-tinted `shadowColor` `#F3D792`) and **framed surface** (border `rgba(255,255,255,0.08)`, fill `rgba(32,14,54,0.18)`).
- Patterns live in `onboardingStyles` (`mascotGlow`, `mascotSurface`, `artGlow`, `artSurface`, `goalsMascot*`) and duplicated similarly on **home** (`heroGlow`, `heroFrame`) and **insights** header.

### Option rows / cards

- **Goals pick**: gradient row + check ring (`goalsPick*`), selected shadow `#C4A2F7`.
- **Legacy/simple goal row**: `goalItem` solid fill `rgba(45,26,74,0.5)`.
- **Settings**: `SettingRow` with group container; switch uses literal track `#C4A2F7`.

### Progress

- **Segmented bar**: `ProgressDots` (5 segments, step bucket mapping in component).
- **App lock step**: custom thin track `rgba(196,162,247,0.12)` + fill `rgba(235,226,255,0.46)`.
- **Goals list**: custom **scroll rail** (3px track) + animated thumb; fade at list bottom (`goalsScrollBottomFade`).

### Buttons / CTAs

- `PrimaryButton`: gradient fill, dark label `#1a0a2e`, scale press animation, haptics.
- Ghost variant: text uses `mutedForeground`.
- Onboarding image FAB: `imageStepArrowFab` — fixed 56 circle, `shadowColor: #C4A2F7`.

### Modals / overlays

- `ritual.tsx` uses full-screen flow on `GradientBackground` (modal route in `_layout`).
- No shared `Modal` sheet token; blur/overlays are local where used.

### Loading / celebration

- `PrimaryButton` `ActivityIndicator` with `#1a0a2e`.
- Ritual completion uses `FadeIn` / `ZoomIn` animations (Reanimated).

### Scroll

- Onboarding main vertical scroll: `react-native-gesture-handler` `ScrollView`; `bounces: false`.
- Goals steps: `GoalsAnimatedScrollView` + scroll lock from sliders (phone hours / mood).

### Shadows / elevation

- Mix of **lavender**, **gold**, and **black** shadow colors; many `elevation: 0` on RN with shadow* props only.
- **Assessment**: **Strong repeated motif** (soft purple glow on cards and mascot); values differ per component.

---

## Likely shared tokens already emerging

1. **Core text** `#f0eaff` and **accent** `#C4A2F7` / `#F5C842`.
2. **Background stack** aligned with `GradientBackground` deep/mid stops.
3. **Card glass** `rgba(45,26,74,0.5–0.7)` + border `rgba(196,162,247,0.12–0.18)`.
4. **Inter** role → weight mapping (body 400, label 500, emphasis 600, title 700).
5. **Content max width ~340** and **horizontal padding 24** on flows.

---

## Places with inconsistent styling

1. **Muted text**: `#9b80c8` vs `rgba(196,162,247,0.5–0.75)` vs `mutedForeground` from hook.
2. **Card background**: token `card` vs various `rgba(45,26,74,…)` opacities.
3. **Border rgba**: `0.08` vs `0.12` vs `0.15` without a single scale.
4. **Radius**: magic numbers (14, 16, 20, 28, 36) vs unused global `radius: 16`.
5. **Tab / screen padding**: same intent (`top + 12`, bottom with tab offset) copy-pasted per screen.
6. **LinearGradient on cards**: `insights` / `protection` / `settings` / `index` use different stop pairs; some TS issues exist around passing `borderRadius` on `LinearGradient` (see current `tsc` output).

---

## Good candidates for future theme/constants extraction

- **Text styles**: `title`, `subtitle`, `caption`, `numericHero` (sizes/lineHeights already repeated).
- **Surface levels**: `surface1` / `surface2` rgba tokens for cards and list rows.
- **Border + divider**: single lavender alpha scale.
- **Layout**: `screenPaddingH`, `screenMaxWidth`, `tabBarBottomInset` (84).
- **Gradients**: named presets for “card wash”, “verse gold”, “primary CTA”.
- **Mascot frame**: shared component or style factory (glow + ring + size).

---

## Things that should stay local

- **One-off marketing copy layout** (paywall badge position, journey board geometry tied to `JOURNEY_*` constants).
- **Animation-specific** styles (Reanimated-driven transforms, scroll thumb derived sizes).
- **Step-specific** spacing tweaks documented in comments in `onboardingStyles` (e.g. goals footer clearance `paddingBottom: 140`).
- **Feature-specific** charts or stats layouts in `insights`.

---

## File reference map (quick grep)

| Area | Primary files |
|------|----------------|
| Global palette | `constants/colors.ts`, `hooks/useColors.ts` |
| Screen backgrounds | `components/GradientBackground.tsx` |
| Onboarding UI | `components/onboarding/onboardingStyles.ts`, `components/onboarding/pages/*`, `constants/onboarding/*` |
| Main tabs | `app/(tabs)/index.tsx`, `insights.tsx`, `settings.tsx`, `protection.tsx` |
| Ritual | `app/ritual.tsx` |
| Shared controls | `components/PrimaryButton.tsx`, `components/SliderInput.tsx`, `components/ProgressDots.tsx` |
| Fonts | `app/_layout.tsx` |

---

*Generated as documentation only; no UI behavior was changed by adding this file.*
