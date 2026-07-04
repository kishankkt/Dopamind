# 🧠 DopaMind: Game Roadmap & Priority Specifications

This document outlines the first 5 mini-games for the **DopaMind** app, details the priority mechanics for **Game 1 (SpeedMatch)**, and explains how we will build/sign the macOS DMG package without an Apple Developer Account.

---

## 🍏 macOS Compiling & Ad-Hoc Signing (Self-Signing)

Since you have a Mac, you can build the `.dmg` package locally for free. 

### How We Bypass Apple Developer Gatekeeper:
1. **Compilation:** On your Mac, we run `npm run tauri build`. Tauri will output a native `.dmg` file.
2. **Ad-Hoc Signing:** We will configure Tauri to sign the app using ad-hoc codesigning (which tells macOS the code is signed, but not by a certified developer).
3. **The User Bypass Trick:** When users download your `.dmg` from your website:
   * **The Block:** Clicking the app normally will trigger: *"App cannot be opened because it is from an unidentified developer."*
   * **The Solution (Right-Click Open):** Instruct the user to **Right-Click (or Control-Click) ➡️ Open** on the app icon, then click **"Open"** in the popup. macOS remembers this approval forever, and the app will open normally from then on.

---

## 🗺️ The First 5 Games Roadmap

These 5 games are designed to train different parts of the brain while maintaining maximum visual and auditory engagement (the "positive trap").

| Game | Cognitive Focus | Gameplay Loop | Dopamine Mechanism |
| :--- | :--- | :--- | :--- |
| **1. SpeedMatch** (Priority 1) | **Processing Speed & Focus** | Compare the current symbol to the previous one. Tap "Match" or "No Match". | Pentatonic sound progression, adaptive speed spikes. |
| **2. FocusGrid** | **Working Memory** | A grid of tiles flashes a pattern. Tap them in the correct sequence. | satisfying bubble-pop visual ripples and physics. |
| **3. CountFlow** | **Mental Math & Agility** | Simple falling equations (e.g. `4 + 3 = 7`). Tap True/False before they hit the bottom. | Tetris-like pressure, visual block shatter animations. |
| **4. WordWarp** | **Cognitive Flexibility** | Stroop Effect: Read words like "BLUE" colored in RED. Answer if text matches color. | High cognitive friction release when matching correctly under speed. |
| **5. PatternPulse** | **Pattern Recognition** | A grid of cards with abstract patterns. Locate the single card that is different. | Haptic/verbal micro-affirmations ("Sharp!", "Unstoppable!"). |

---

## 🕹️ Game 1 (Priority): **SpeedMatch** Detailed Specifications

This is the first game we will build. It is designed to induce a **Flow State** where the user loses track of time.

```
                  ┌──────────────────────┐
                  │      [Timer Bar]     │
                  │                      │
                  │         (✦)          │   <-- Glowing Star
                  │                      │
                  │  [Match]   [No Match]│
                  │   (<-)        (->)   │
                  └──────────────────────┘
```

### 1. Core Mechanics
* **The Loop:** A symbol (Circle, Triangle, Star, Diamond, or Square) appears in the center of the screen for a brief window. A second later, a new symbol appears. The user must click **Match (Left Arrow)** or **No Match (Right Arrow)** to indicate if the current symbol is identical to the one *immediately before*.
* **Round Duration:** exactly **45 seconds**.

### 2. The Adaptive Difficulty Algorithm (Keep them Hooked)
To prevent the user from getting bored (too easy) or quitting in frustration (too hard):
* **Start Speed:** 2.5 seconds per card.
* **Acceleration:** For every **3 consecutive correct answers**, the speed window shrinks by **0.2 seconds** (minimum limit: 0.8 seconds).
* **Cortisol Rescue (De-escalation):** If the user makes **2 mistakes in a row**, the game immediately drops back to a slow speed (2.2 seconds) and gives them a highly obvious matching shape (e.g., Circle following Circle). This gives their brain an immediate win, releasing relief hormones and resetting the streak.

### 3. Audiovisual "Juiciness"
* **Musical Scaling:** Correct answers play a note from a clean pentatonic scale.
  * *1st correct:* C4 (chime)
  * *2nd correct:* D4 (chime)
  * *3rd correct:* E4 (chime)
  * *Streak of 10:* Plays a beautiful, fast ascending chord arpeggio.
* **Animations:**
  * When correct, the symbol flashes green and scales up by 10% with a springy bounce.
  * When incorrect, the symbol shakes horizontally (red tint) and plays a soft bubble-pop deflate sound.
