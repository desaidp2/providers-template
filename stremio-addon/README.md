# Personal Stremio adapter

This is a separate, minimal Stremio addon inside the Vega provider template repo. It does not change the existing Vega provider build or either Doom project.

It serves **only direct HTTP(S) URLs that you own or are authorized to distribute**. It does not scrape third-party streaming sites, bypass access controls, or decrypt DRM.

## Run locally

```sh
cd stremio-addon
npm install
cp streams.example.json streams.json
# Edit streams.json and replace example URLs with your authorized direct media URLs.
npm start
```

The addon manifest is available at:

`http://localhost:7000/manifest.json`

Add that URL in Stremio's Addons page (use your server's reachable HTTPS URL when running remotely).

## Stream map format

The JSON object is keyed by Stremio IMDb ID. For series, use the episode ID format `tt1234567:season:episode`.

```json
{
  "tt0133093": [
    { "url": "https://media.example.org/movie.m3u8", "title": "1080p • HLS" }
  ],
  "tt0903747:1:1": [
    { "url": "https://media.example.org/show-s01e01.mp4", "title": "1080p • MP4" }
  ]
}
```

Only `http:` and `https:` URLs are accepted. Keep private stream URLs and credentials out of public repositories. For production, set `STREAMS_URL` to a private JSON endpoint or mount a private `streams.json` file using `STREAMS_FILE`.

## Deploy

Use any Node.js host that supports a persistent HTTP process. Set the service root directory to `stremio-addon`, install with `npm install`, and start with `npm start`. Set `PORT` if your host provides one.

This is the first safe adapter scaffold; it does not include Vega's third-party provider implementations or guarantee any streams until you add authorized stream mappings.
