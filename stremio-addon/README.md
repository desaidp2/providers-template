# Personal Stremio adapter

A separate Stremio addon inside this Vega provider-template repository. It does not alter the existing Vega provider build or either Doom project.

It serves **only direct HTTP(S) URLs that you own or are authorized to distribute**. It does not scrape third-party streaming sites, bypass access controls, or decrypt DRM.

## Run locally

```sh
cd stremio-addon
npm install
cp streams.example.json streams.json
# Edit streams.json with authorized direct media URLs.
npm start
```

Open `http://localhost:7000/manifest.json` or add it to Stremio.

## Stream map

The JSON object is keyed by Stremio IMDb ID. For series, use `tt1234567:season:episode`.

```json
{
  "tt0133093": [{ "url": "https://media.example.org/movie.m3u8", "title": "1080p • HLS" }],
  "tt0903747:1:1": [{ "url": "https://media.example.org/show-s01e01.mp4", "title": "1080p • MP4" }]
}
```

Only `http:` and `https:` URLs are accepted. Do not commit private URLs, credentials, or a real `streams.json` file.

## Vercel deployment

1. Create a Vercel project linked to this GitHub repository.
2. Set **Root Directory** to `stremio-addon`.
3. Set the Production Branch to `stremio-addon-bootstrap` (or merge this branch when ready).
4. Deploy. The manifest endpoint is `https://YOUR-PROJECT.vercel.app/api/manifest.json`.
5. Add that HTTPS URL in Stremio.

Set `STREAMS_URL` in Vercel Environment Variables to a private JSON endpoint for production mappings. Without a mapping, the addon returns an empty stream list.

## Tests

Run `npm test`. The test suite checks the addon manifest and rejects unsafe/non-HTTP stream URLs.
