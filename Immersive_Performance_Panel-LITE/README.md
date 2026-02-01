# Immersive Performance Panel — LITE

A lightweight, NUI-based performance panel for FiveM that lets players tune a few high-impact density/visual settings to help stabilize FPS in crowded areas and during events.

**Version:** 1.0.0  
**Author:** Immersive RP  
**License:** MIT (see `LICENSE`)

---

## Features

- Smoothed **FPS** display (updates twice per second while open)
- **Density & Distance**
  - Ped Density
  - Scenario Density
  - LOD Distance
- **Visual Toggles**
  - Decals
  - Screen Blur
  - Artificial Lights (global lighting state)
- **Per-client persistence** using Resource KVP
- **Keybind:** F10 (rebindable in FiveM keybind settings)
- **Close:** Esc or the ✕ button
- Clean NUI focus handling and resource-stop cleanup

---

## Requirements

- FiveM (fx_version `cerulean`)
- No framework dependencies

---

## Installation

1. Copy the `Immersive_Performance_Panel-LITE` folder into your server `resources/` directory.
2. Add this line to your `server.cfg`:

```
ensure Immersive_Performance_Panel-LITE
```

3. Restart the server (or start the resource).

---

## Usage

- Press **F10** to open/close the panel.
- Press **Esc** (or click ✕) to close.
- Click **Reset** to restore default values.

Settings are saved per-client automatically and re-applied on the next session.

---

## What each setting does

### Density & Distance

- **Ped Density**  
  Controls pedestrian density. Applied every frame using `SetPedDensityMultiplierThisFrame`.

- **Scenario Density**  
  Controls background scenario activity. Applied every frame using `SetScenarioPedDensityMultiplierThisFrame`.

- **LOD Distance**  
  Controls Level-of-Detail distance scaling. Applied using `SetLodScale` (clamped to 0.1–1.0).

### Visual Toggles

- **Decals**  
  When switched off, disables decal rendering for the current frame using `SetDisableDecalRenderingThisFrame`.

- **Screen Blur**  
  When switched off, disables screen blur using `SetDisableScreenBlur`.

- **Artificial Lights**  
  Toggles artificial light state using `SetArtificialLightsState`.  
  This is a **global lighting state** and may conflict with other resources that modify lighting.

---

## Notes

- This resource is **client-only** and does not add server callbacks or permissions.
- Values are stored as Resource KVP keys prefixed with `ipp_`.

---

## Support

If you run into issues, include:
- your FiveM build (server + client),
- a short description of what you expected vs. what happened,
- any relevant client console output.

---

## License

MIT License — see `LICENSE`.
