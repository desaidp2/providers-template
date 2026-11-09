# Vega provider audit

Audit date: 2026-11-10  
Upstream inspected: https://github.com/Zenda-Cross/vega-providers  
Manifest entries: 64; marked enabled: 40; marked disabled: 24.

## What was checked

- Read the upstream `manifest.json`: all 64 provider entries and their enabled/disabled flags.
- Read the recursive Git tree: each manifest entry has a matching provider directory and a `stream.ts` module.
- Inspected representative stream implementations for Internet Archive, YouTube, MX Player, Torrentio, VMovies, MultiStream, MoviesDrive, 4khdHub, Anikoto, AnimeSub+, and Everything.
- Checked the upstream repository metadata and root files for a standalone license. No root `LICENSE` file was present; `package.json` declares ISC, but the scope/permission to reuse provider implementations and scrape third-party services is not established by that alone.
- This was a source/manifest audit, **not a live end-to-end uptime test of every external provider endpoint**. Upstream enabled flags do not prove that a source is currently reachable or authorized.

## Manifest entries marked enabled (40)

- VMovies (`vega`)
- MultiStream (`autoEmbed`)
- MoviesDrive (`drive`)
- 4khdHub (`4khdhub`)
- Cinewood (`1cinevood`)
- World4uFree (`world4u`)
- KatMoviesHd (`katmovies`)
- MoviesMod (`mod`)
- UHDMovies (`uhd`)
- MovieBox Web (`movieBoxWeb`)
- GokuHD (`gokuHD`)
- DramaCool (`dramacool`)
- EonMovies (`eonMovies`)
- Movies4U (`movies4u`)
- KmMovies (`kmMovies`)
- Zeefliz (`zeefliz`)
- NetflixMirror (`netflixMirror`)
- PrimeMirror (`primeMirror`)
- DisneyMirror (`disneyMirror`)
- HdHub4u (`hdhub4u`)
- MoviezWap (`moviezwap`)
- ShowBox (`showbox`)
- KissKh (`kissKh`)
- RogMovies (`luxMovies`)
- TopMovies (`topmovies`)
- Torrentio (`torrentio`)
- Anikoto (`anikoto`)
- KickAssAnime (`kickAssAnime`)
- AnimeSub+ (`animesub`)
- Everything (`everything`)
- Castle TV (`castle`)
- AnimeSalt (`animesalt`)
- AnimeWorld (`animeworld`)
- MovieLinkBD (`movielinkdb`)
- MX Player (`mxplayer`)
- YouTube (`youtube`)
- Kartoons (`kartoons`)
- 1Flex (`1flex`)
- Internet Archive (`internetArchive`)
- Rareanimes (`rareanimes`)

## Manifest entries marked disabled (24)

- MultiMovies (`multi`)
- ProtonMovies (`protonMovies`)
- CinemaLuxe (`cinemaLuxe`)
- FilmyFly (`filmyfly`)
- MovieBox App (`movieBox`)
- MKVDrama (`mkvDrama`)
- KatMovieFix (`katMovieFix`)
- Ringz (`ringz`)
- Ogomovies (`ogomovies`)
- A.111477 (`a111477`)
- VadaPav (`vadapav`)
- MoviesApi (`moviesApi`)
- RidoMovies (`ridoMovies`)
- FlixHQ (`flixhq`)
- Primewire (`primewire`)
- HiAnime (`hiAnime`)
- Animetsu (`animetsu`)
- TokyoInsider (`tokyoInsider`)
- Dooflix (`dooflix`)
- GuardaHD (`guardahd`)
- SkyMovieHD (`skyMovieHD`)
- Joya9tv (`Joya9tv`)
- AnimeStream (`uniquestream`)
- CineFreak (`cinefreak`)

## Integration decision

- Internet Archive is the only upstream provider currently represented by a standalone integration in this addon. Its uploader-supplied rights metadata is filtered for Public Domain / Creative Commons labels and re-checked before streams are returned; this is not independent legal verification.
- YouTube's inspected stream implementation calls undocumented InnerTube player endpoints and impersonates client profiles to obtain direct media URLs. It is not copied into this addon.
- Torrentio / AnimeSub+ include torrent-index/debrid flows; they are not added as generic direct-file sources.
- The inspected Everything implementation includes Cloudflare Turnstile handling; no anti-bot or access-control workarounds are imported.
- MX Player uses a web API and stream URLs, but the inspected upstream module does not itself establish a permission/license for rehosting those streams through this addon.
- Other third-party providers are predominantly website/host extractors. They are not considered safe to port merely because a manifest entry is enabled or a `stream.ts` exists.

## Result

No additional third-party scraping adapters are added based only on manifest presence or apparent technical functionality. Candidate sources can be integrated when their API/source terms authorize this use and their stream URLs can be tested without bypassing access controls. No Doom Lite or Doom TorBox files are touched.
