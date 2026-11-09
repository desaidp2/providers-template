# Vega Public Video — Stremio addon

This standalone addon exposes Internet Archive videos whose item metadata declares a Public Domain or Creative Commons license. It is deliberately separate from the Vega provider-template runtime.

## Run locally

```sh
cd stremio-addon
npm install
npm test
npm start
```

Open `http://localhost:7000/manifest.json` in Stremio to install it.

## Scope and limitations

- The addon searches Internet Archive's public Advanced Search API and re-checks item metadata before exposing streams.
- License labels are supplied by uploaders; this filter is not independent legal verification. Check the item's rights information before use.
- Only direct video files hosted by Internet Archive are listed. No third-party streaming-site scraping, DRM circumvention, or access-control bypass is implemented.
- This repository currently contains a provider template/example, not the full Vega upstream provider source tree. Vega manifest entries are not automatically runnable adapters; each needs its actual source implementation and compatible authorization/terms.
- This addon does not modify Doom Lite or Doom TorBox.
