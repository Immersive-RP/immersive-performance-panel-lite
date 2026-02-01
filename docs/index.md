---
title: Home
nav_order: 1
---

# Immersive Performance Panel — LITE

A lightweight, NUI-based performance panel for FiveM that lets players tune a few high-impact density and visual settings to help stabilize FPS in crowded areas and during events.

- Version: 1.0.0
- Author: Immersive RP
- License: MIT

## Quick start

1. Copy the `Immersive_Performance_Panel-LITE` folder into your server `resources/` directory.
2. Add this line to your `server.cfg`:

```
ensure Immersive_Performance_Panel-LITE
```

3. Restart the server (or start the resource).
4. Press **F10** in-game to open the panel.

## Features

- Smoothed FPS display (updates twice per second while open)
- Density and distance controls
  - Ped Density
  - Scenario Density
  - LOD Distance
- Visual toggles
  - Decals
  - Screen Blur
  - Artificial Lights (global lighting state)
- Per-client persistence using Resource KVP
- Close via Esc or the ✕ button
