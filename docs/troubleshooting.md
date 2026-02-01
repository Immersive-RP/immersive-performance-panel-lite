---
title: Troubleshooting
nav_order: 5
---

# Troubleshooting

## Panel does not open

- Make sure the resource is started and shows no errors in server console.
- Confirm `ensure Immersive_Performance_Panel-LITE` is in `server.cfg`.
- Check that no other resource is blocking the keybind.

## Cursor or input feels stuck

- Press Esc to close the UI.
- Restart the resource to force cleanup.

## Visual setting does not appear to apply

- Some changes are frame-based and only apply while the client script is running.
- Artificial Lights affects a global lighting state and may be overridden by other resources.
