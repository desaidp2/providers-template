# Personal Stremio adapter

A separate Stremio addon inside this Vega provider-template repository. It does not alter the existing Vega provider build or either Doom project.

## Included sources

- **Internet Archive (Open License):** searchable movie catalog filtered to items whose metadata declares a Public Domain or Creative Commons license. Before returning playable files, the addon checks the item's license metadata again. It only exposes common direct video formats.
- **Personal direct streams:** optional IMDb-keyed HTTP(S) URLs that you own or are authorized to distribute.

This addon does not scrape third-party streaming sites, bypass access controls, or decrypt DRM. Internet Archive metadata is user-contributed; the license filter reflects the item's declared metadata and is not an independent legal verification.

## Run locally

```sh
cd stremio-addon
npm install
npm start
```

Open `http://localhost:7000/manifest.json` or add it to Stremio. In Stremio's catalog search, use **Internet Archive (Open License)**.

## Personal stream map

Create `streams.json` (it is git-ignored). The JSON object is keyed by Stremio IMDb ID. For series, use `tt1234567:season:episode`.

```json
{
  "tt0133093": [{ "url": "https://media.example.org/movie.mp4", "title": "1080p • MP4" }],
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

Set `STREAMS_URL` in Vercel Environment Variables to a private JSON endpoint for production mappings. Without a mapping, personal IMDb-keyed streams return an empty list; the Internet Archive catalog remains available.

## Tests

Run `npm test`. Tests cover the manifest, URL validation, open-license filtering, supported video files, and URL encoding.
