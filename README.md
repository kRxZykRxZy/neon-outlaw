# NEON OUTLAW

A browser-native 3D open-world action game built with HTML, CSS, JavaScript and Three.js for CrazyGames.

## Current build

- Procedural 2,600m-class city with six districts
- Neon landmarks, skyscrapers, roads, windows, water and elevated highway
- Third-person character controller
- Mouse aiming, shooting, reloads and damage/armor
- Five weapons and five vehicles
- Enter/exit/drivable vehicles
- Vehicle health and destruction effects
- Enemy AI with chase and ranged attacks
- Boss enemies
- Wanted system and police-style pursuit spawns
- Ambient traffic
- Pedestrian simulation
- Collectable cash pickups
- Rain/weather particle system
- Minimap
- 25-mission campaign skeleton with chapters and unlock progression
- Mission rewards, XP, cash economy and garage
- Persistent local save
- Responsive HUD and mobile-safe layout foundation
- CrazyGames HTML5 SDK v3 initialization
- CrazyGames gameplayStart/gameplayStop
- CrazyGames midgame ad integration at mission completion

## Controls

WASD — move/drive
Shift — sprint
Mouse — aim
Left click — fire
R — reload
F — enter/exit vehicle
Space — fire/brake depending on state

## Run locally

Serve the repository through a local HTTP server instead of opening `index.html` directly.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

Three.js is currently loaded through an import map from jsDelivr. For production, vendor/cache the dependency for predictable deployment and download-size control.

## CrazyGames monetization

The game uses the CrazyGames HTML5 SDK v3. Only CrazyGames SDK ads should be used for CrazyGames monetization. The current implementation requests a midgame ad after mission completion and pauses the game while the ad is active. Rewarded-ad hooks can be added to specific player-consented rewards later.

Do not add AdSense, AdMob, or another external ad network to the CrazyGames build.

## Architecture

`src/content.js` — weapons, vehicles, districts, campaign data and loot

`src/world.js` — procedural city and environment

`src/systems.js` — saves, player, vehicles, enemies, missions, wanted system and effects

`src/traffic.js` — traffic, pedestrians, pickups and weather

`src/main.js` — renderer, input, game loop, UI and platform bridge

`styles.css` — HUD, menus and responsive presentation

`index.html` — boot document and CrazyGames SDK loading

## Production roadmap

The current repository is asset-free and procedural so it can be played without a large asset download. A commercial release should add optimized authored vehicle/character models, animation sets, audio, music, richer mission scripting, checkpoint logic, mobile touch controls, accessibility, quality settings, cloud saves and CrazyGames QA validation.

Test the final build through the CrazyGames Preview tool before launch. Keep ads at logical breaks and never interrupt active gameplay.
