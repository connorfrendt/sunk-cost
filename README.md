# Phaser Jam Starter

A minimal Phaser 3 + Vite skeleton, pre-wired for a browser-only itch.io submission.

## Get running

```bash
npm install
npm run dev
```

Opens a dev server with hot reload. Edit anything in `src/` and it updates instantly.

## Project structure

```
src/
  main.js              # boots the game
  config.js            # Phaser game config (resolution, physics, scene list)
  scenes/
    BootScene.js        # loads assets needed for the loading bar itself
    PreloadScene.js      # loads all your real assets — put load calls here
    MenuScene.js          # title screen
    GameScene.js           # <-- your actual game goes here
    GameOverScene.js        # end screen, shows score, restarts
  utils/
    constants.js         # tunable numbers in one place
```

`GameScene.js` currently ships with a placeholder move + collect loop (rectangle player,
circle collectible) just so the project runs immediately. Replace that with your real
mechanic once the theme drops — the loading bar, scene flow, and score UI are already wired up.

## Building for itch.io

```bash
npm run build
```

This outputs a static build to `dist/`. itch.io needs a **zip of the contents of `dist/`**
(not the `dist` folder itself) uploaded as an HTML game.

Shortcut that builds and zips it for you in one step:

```bash
npm run zip
```

Then on your itch.io project page:
1. Set **Kind of project** to "HTML".
2. Upload `itch-build.zip`, check **"This file will be played in the browser"**.
3. Set the embed viewport to match `GAME_WIDTH` / `GAME_HEIGHT` in `constants.js` (960x540 by default) — or leave "Automatically fit" checked.
4. Playtest the actual itch.io page before submitting — local `npm run dev` can behave slightly differently from a hosted static build.

## Notes for jam scoring

- **Playability is the top-weighted category.** A small, polished, bug-free loop beats an ambitious broken one. Cut scope before cutting stability.
- Keep this README's `GameScene.js` swap-in-mind: the fastest path to a working submission is bolting your theme mechanic onto the existing move/collect skeleton rather than rebuilding scene flow from scratch.
- Remember: **no AI-generated content** is allowed per the jam rules — art/audio need to be made by you or be properly licensed.
