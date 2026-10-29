# 🕵️‍♂️ Operation: CrossTalk

> **Two Phones. Asymmetric Mystery. Zero Peeking.**
> An asymmetric 2-player cooperative escape game designed for couples, friends, and family.

---

## 🎮 How to Play with Your Wife / Partner

### Rule #1: NEVER Look at Each Other's Screen!
All information must be communicated verbally out loud across the couch or table.

### 🕹️ The Roles:
1. **The Operative ("The Hands"):**
   - Sees the live device console with the ticking countdown clock and strikes indicator.
   - Interacts directly with the hardware: cuts wires, taps glyphs, tunes the oscilloscope, and enters memory sequences.
   - Has **NO idea** what the rules mean!
2. **The Analyst ("The Brains"):**
   - Holds the classified Field Manual.
   - Has access to wire logic, rune matrices, frequency tables, and memory sequencing instructions.
   - **CANNOT touch** the device!

---

## 🚀 Quick Start (Running Locally & On Phones)

### 1. Start the Dev Server
From the project folder:
```bash
npm run dev
```

Vite is configured with `--host`, which will print out your local network IP in your terminal:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.XX:5173/
```

### 2. Connect Your Phones
1. Connect both phones to your home Wi-Fi network.
2. Open Safari / Chrome on Phone 1 and Phone 2 to `http://192.168.1.XX:5173` (or scan the terminal QR code).
3. **Phone 1 (Player 1):** Tap **"HOST MISSION"**, choose your role (e.g. Operative), and read out the 4-letter room code (e.g. `HAWK`).
4. **Phone 2 (Player 2):** Tap **"JOIN MISSION"**, type in the room code, and choose the opposite role (Analyst).
5. Both phones connect via direct WebRTC / P2P sync.

> 💡 **Tip:** You can also tap **"SOLO PRACTICE / TEST"** on a computer or phone to test out all 4 puzzle modules and switch between roles with one click!

---

## 🧩 The 4 Defusal Modules

* **Mod 01: Wire Loom** (4 to 6 colored wires; logic based on serial number and wire counts).
* **Mod 02: Glyph Matrix** (4 mysterious espionage runes; must be pressed in the column order given in the Analyst's manual).
* **Mod 03: Radio Oscilloscope** (Adjust frequency slider to match target MHz using Indicator code & Battery count).
* **Mod 04: Memory Core** (3 sequential stages; requires remembering button positions and labels from previous stages).

---

## 🛠️ Tech Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (Retro CRT dark theme with scanlines and tactile skeuomorphism)
- **Audio & Haptics:** Web Audio API procedural synthesis + `navigator.vibrate`
- **Multiplayer Networking:** PeerJS (Zero-server WebRTC P2P direct data sync)
- **Celebration:** Canvas Confetti
