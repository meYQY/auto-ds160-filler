
## Development & Debugging

Since this is a Chrome Extension, you can't run it directly in Node.js.

1. **Watch Mode**: Run `npm run dev` to watch for file changes.
2. **Chrome Logs**:
   - Right-click the extension icon -> **Inspect Popup** to debug the React UI.
   - On the DS-160 page, open DevTools (`F12`) to see logs from the Content Script (e.g., "Filling #surname with ZHANG").
3. **Reload**: After code changes, go to `chrome://extensions/` and click the refresh icon on the card.

## License

Distributed under the MIT License. See `LICENSE` for more information.
