---
title: Settings reference
nav_order: 4
---

# Settings reference

## Density and distance

### Ped Density

Controls pedestrian density. Applied every frame using `SetPedDensityMultiplierThisFrame`.

### Scenario Density

Controls background scenario activity. Applied every frame using `SetScenarioPedDensityMultiplierThisFrame`.

### LOD Distance

Controls Level-of-Detail distance scaling. Applied using `SetLodScale` and clamped to 0.1–1.0.

## Visual toggles

### Decals

When switched off, disables decal rendering for the current frame using `SetDisableDecalRenderingThisFrame`.

### Screen Blur

When switched off, disables screen blur using `SetDisableScreenBlur`.

### Artificial Lights

Toggles artificial light state using `SetArtificialLightsState`.

This is a global lighting state and may conflict with other resources that modify lighting.
