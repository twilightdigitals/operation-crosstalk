# 🕵️‍♂️ Operation: CrossTalk

> **Two Phones. Asymmetric Mystery. Zero Peeking.**  
> A [Twilight](https://twilight.ng) Web Product  
> Play live at: **[play.twilight.ng/operation-crosstalk](https://play.twilight.ng/operation-crosstalk/)**

An asymmetric two-player cooperative bomb defusal experience built natively for modern mobile browsers. One player operates the device console while their partner consults the classified defusal manual—all without ever looking at each other's screens.

---

## 🎮 How to Play

### The Golden Rule: NEVER Look at Each Other's Screen!
Sit side-by-side on the couch or across the table. All information, clues, numbers, and warnings must be communicated **verbally out loud**.

### 🕹️ The Roles:
1. **The Operative ("The Hands"):**
   - Holds the live bomb console with the countdown timer and strike indicators.
   - Interacts directly with the hardware: cuts wires, taps glyphs, tunes the oscilloscope, and enters memory core stages.
   - Has **no access** to the defusal manual rules.
2. **The Analyst ("The Brains"):**
   - Consults the classified Field Manual.
   - Holds the wire decision trees, rune tables, frequency matrices, and memory core sequencing rules.
   - Has **no access** to the bomb controls and cannot touch the device.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SUPABASE REALTIME CLUSTER                       │
│                        (wss://...supabase.co)                          │
│                                                                        │
│            Channel: room_KXTRA (Ephemeral Broadcast Pub/Sub)           │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │                                │
        WebSocket   │                                │  WebSocket
        Broadcast   │                                │  Broadcast
                    ▼                                ▼
       ┌────────────────────────┐       ┌────────────────────────┐
       │   PHONE 1: OPERATIVE   │       │    PHONE 2: ANALYST    │
       │    (React 19 + Vite)   │       │   (React 19 + Vite)    │
       ├────────────────────────┤       ├────────────────────────┤
       │ • Operative Console UI │       │ • Defusal Manual UI    │
       │ • Local Seed Generator │       │ • Module Reference     │
       │ • Piezo Timer Audio    │       │ • Strike / Clock Sync  │
       │ • Web Audio FX System  │       │ • Cinematic Soundtrack │
       └────────────────────────┘       └────────────────────────┘
```

### 1. Multiplayer Networking: Supabase Realtime Broadcast
- **Zero Carrier Blocking:** Replaced legacy WebRTC P2P (PeerJS) with Supabase Realtime WebSocket broadcast clustering. Operates across any cellular carrier NAT, mobile hotspot, or home Wi-Fi with sub-25ms synchronization.
- **Ephemeral & Serverless:** Zero database tables or persistence required; messages route entirely in-memory through high-availability Phoenix channels.
- **Action-Based Event Model:** State updates are broadcast as discrete event actions rather than whole-state dumps:
  - `WIRE_CUT`, `GLYPH_PRESSED`, `FREQUENCY_CHANGED`, `FREQUENCY_LOCKED`, `MEMORY_STAGE_ADVANCE`, `MEMORY_RESET`, `ROLE_SWAP`, `PLAY_AGAIN`, `DETONATED`.
- **Guaranteed 2-Way Handshake:**
  1. Phone 1 creates room `room_XXXXX` and enters waiting state.
  2. Phone 2 joins and broadcasts `PARTNER_JOINED`.
  3. Phone 1 acknowledges with `MISSION_INIT` containing the synchronized mission seed and active status.
  4. Phone 2 sends `PARTNER_READY` confirmation, transitioning both devices simultaneously to live gameplay.
- **Strict Code Sanitization:** Automatic uppercase whitespace stripping (`.trim().toUpperCase().replace(/[^A-Z]/g, '')`) prevents carrier or keyboard autocomplete mismatches.

### 2. Audio & Haptics Engine (`sound.ts`)
- **Realistic Electronic Bomb Timer Beep:**
  - Synthesized via Web Audio API using a dual-oscillator piezo tone (2093 Hz C7 fundamental + 4186 Hz square harmonic overtone through a highpass filter).
  - Dynamically escalates: clinical single beep (>30s), urgent pitch shift to 2349 Hz (≤30s), and frantic double-pip (`pip-pip`) at 2793 Hz (≤10s).
  - Clean tactile isolation: per-second timer vibration is omitted for comfort, reserving haptic feedback exclusively for tactile player actions (wire cuts, button presses, strikes, and detonation).
- **Dramatic 3-Stage Detonation:**
  - Multi-layer cinematic blast combining supersonic crack transient (500 Hz ➔ 35 Hz), deep sub-bass chest thump (170 Hz ➔ 32 Hz), and a 2.5s resonant low-pass white noise fireball rumble (1600 Hz ➔ 55 Hz).
  - Accompanied by a violent multi-pulse haptic shockwave and visual screen-shake animation (`detonation-shake`).
- **Cinematic Spy Soundtrack Player:**
  - Streams studio-recorded espionage film scores calibrated to a dialogue-safe volume (`0.12` master level) so verbal communication is never obscured.
  - In-lobby soundtrack selector with 4 distinct spy themes:
    - **Spy Groove** (Default): Groovy B3 organ, live drum kit, cellos, Latin congas.
    - **Spy Glass**: Classic 007 / James Bond brass, vibraphone, saxes, and walking bass.
    - **Covert Affair**: Film noir acoustic double-bass and muted trumpet.
    - **Volatile Reaction**: High-octane *Mission: Impossible* 7/4 blasting brass and pounding percussion.
  - Automatically fades in on mission start, fades out on victory/detonation, and supports one-tap mute toggling on both Operative and Analyst screens.

---

## 🧩 The 4 Defusal Modules

* **Mod 01: Wire Loom**  
  4 to 6 live colored wires. Cut logic evaluates total wire count, color frequency, and the final digit of the bomb's unique serial number.
* **Mod 02: Glyph Matrix**  
  4 mysterious espionage runes. The Analyst locates the unique column containing all 4 glyphs in the manual; the Operative presses them top-to-bottom (if serial ends in ODD) or bottom-to-top (if EVEN).
* **Mod 03: Radio Oscilloscope**  
  Oscilloscope frequency tuning. The Analyst cross-references the battery count, illuminated indicator tag (`SIG`, `FRK`, `CLR`, `NSA`), and serial vowels to calculate the target MHz.
* **Mod 04: Memory Core**  
  3 sequential memory stages. Requires remembering button positions and numerical labels across previous stages to survive.

---

## ⏱️ Difficulty Protocols

- **Rookie Agent:** 5m 00s (generous timer for first-time operatives)
- **Veteran Agent:** 4m 00s (balanced high-tension challenge)
- **Impossible Protocol:** 3m 00s (maximum adrenaline)

> 💡 **Solo Practice Mode:** Tap **"SOLO PRACTICE / TEST"** on any device to test modules standalone with instant role swapping.

---

## 🛠️ Tech Stack & CI/CD

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8 (Rolldown engine)
- **Styling:** Tailwind CSS v4 (CRT phosphor dark aesthetic, scanlines, responsive viewport fit)
- **Networking:** `@supabase/supabase-js` (Realtime WebSocket Broadcast)
- **Audio:** Web Audio API + HTML5 Audio streaming
- **Icons:** `lucide-react`
- **Effects:** `canvas-confetti`
- **Hosting & CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`) deploying automatically to GitHub Pages on custom domain `play.twilight.ng`.

---

## 💻 Local Development

```bash
# 1. Clone repository
git clone https://github.com/twilightdigitals/operation-crosstalk.git
cd operation-crosstalk

# 2. Install dependencies
npm install

# 3. Start local development server (accessible over Wi-Fi)
npm run dev

# 4. Build for production
npm run build
```

---

## 📄 License & Credits

- **Product:** A [Twilight](https://twilight.ng) Web Experience.
- **Soundtracks:** Composed by Kevin MacLeod ([incompetech.com](https://incompetech.com)), licensed under [Creative Commons: By Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
- **Software:** MIT License.
