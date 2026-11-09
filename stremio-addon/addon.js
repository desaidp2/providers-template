"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { addonBuilder } = require("stremio-addon-sdk");

const STREAMS_FILE = process.env.STREAMS_FILE || path.join(__dirname, "streams.json");
const STREAMS_URL = process.env.STREAMS_URL;
const IA_BASE = "https://archive.org";
const VIDEO_EXTENSIONS = new Set([".mp4", ".m4v", ".webm", ".ogv", ".mov", ".mpeg", ".mpg"]);

const manifest = {
  id: "community.desai.authorized-streams",
  version: "0.2.0",
  name: "Vega Streams (Personal)",
  description: "Personal Stremio addon for authorized direct streams and openly licensed Internet Archive videos.",
  resources: ["catalog", "meta", "stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt", "ia:"],
  catalogs: [{
    type: "movie",
    id: "archive-open",
    name: "Internet Archive (Open License)",
    extra: [{ name: "search", isRequired: true }]
  }]
};

function validateStream(stream) {
  if (!stream || typeof stream !== "object" || typeof stream.url !== "string") return false;
  try {
    const url = new URL(stream.url);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isOpenLicense(value) {
  const licenses = Array.isArray(value) ? value : [value];
  return licenses.some((license) =>
    typeof license === "string" &&
    (/publicdomain/i.test(license) || /creativecommons\.org/i.test(license))
  );
}

function isPlayableArchiveFile(file) {
  if (!file || typeof file.name !== "string") return false;
  const extension = path.posix.extname(file.name).toLowerCase();
  return VIDEO_EXTENSIONS.has(extension) && !file.name.toLowerCase().includes(".thumbs/");
}

function archiveFileUrl(identifier, fileName) {
  const encodedName = fileName.split("/").map(encodeURIComponent).join("/");
  return `${IA_BASE}/download/${encodeURIComponent(identifier)}/${encodedName}`;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`Upstream returned HTTP ${response.status}`);
  return response.json();
}

async function getArchiveItem(identifier) {
  if (!/^[a-zA-Z0-9._-]{1,200}$/.test(identifier)) throw new Error("Invalid Internet Archive identifier");
  const data = await fetchJson(`${IA_BASE}/metadata/${encodeURIComponent(identifier)}`);
  if (!data || !data.metadata || !isOpenLicense(data.metadata.licenseurl)) {
    throw new Error("Internet Archive item is not marked public-domain or Creative Commons");
  }
  return data;
}

async function searchArchive(query) {
  const safeQuery = String(query || "").trim().slice(0, 160);
  if (!safeQuery) return [];
  const licenseQuery = 'mediatype:movies AND licenseurl:(*publicdomain* OR *creativecommons*)';
  const url = new URL(`${IA_BASE}/advancedsearch.php`);
  url.searchParams.set("q", `${licenseQuery} AND title:(${safeQuery.replace(/[\\+\-!(){}\[\]^"~*?:\/&|]/g, " ")})`);
  for (const field of ["identifier", "title", "year", "description"]) url.searchParams.append("fl[]", field);
  url.searchParams.set("rows", "20");
  url.searchParams.set("page", "1");
  url.searchParams.set("output", "json");
  url.searchParams.append("sort[]", "downloads desc");
  const data = await fetchJson(url.toString());
  return Array.isArray(data?.response?.docs) ? data.response.docs : [];
}

async function loadStreams() {
  if (STREAMS_URL) {
    const data = await fetchJson(STREAMS_URL);
    return data && typeof data === "object" ? data : {};
  }
  if (!fs.existsSync(STREAMS_FILE)) return {};
  return JSON.parse(fs.readFileSync(STREAMS_FILE, "utf8"));
}

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id, extra }) => {
  if (type !== "movie" || id !== "archive-open") return { metas: [] };
  try {
    const docs = await searchArchive(extra?.search);
    return {
      metas: docs.filter((doc) => doc.identifier).map((doc) => ({
        id: `ia:${doc.identifier}`,
        type: "movie",
        name: String(doc.title || doc.identifier),
        poster: `${IA_BASE}/services/img/${encodeURIComponent(doc.identifier)}`,
        ...(doc.year ? { releaseInfo: String(doc.year) } : {}),
        ...(doc.description ? { description: String(doc.description).slice(0, 1200) } : {})
      }))
    };
  } catch (error) {
    console.error("Internet Archive search failed:", error.message);
    return { metas: [] };
  }
});

builder.defineMetaHandler(async ({ type, id }) => {
  if (type !== "movie" || typeof id !== "string" || !id.startsWith("ia:")) return { meta: null };
  try {
    const identifier = id.slice(3);
    const item = await getArchiveItem(identifier);
    const metadata = item.metadata;
    const title = Array.isArray(metadata.title) ? metadata.title[0] : metadata.title;
    const description = Array.isArray(metadata.description) ? metadata.description.join("\n") : metadata.description;
    return {
      meta: {
        id,
        type: "movie",
        name: String(title || identifier),
        poster: `${IA_BASE}/services/img/${encodeURIComponent(identifier)}`,
        ...(metadata.year || metadata.date ? { releaseInfo: String(metadata.year || metadata.date).slice(0, 4) } : {}),
        ...(description ? { description: String(description).replace(/<[^>]*>/g, " ").slice(0, 4000) } : {})
      }
    };
  } catch (error) {
    console.error("Internet Archive metadata failed:", error.message);
    return { meta: null };
  }
});

builder.defineStreamHandler(async ({ type, id }) => {
  try {
    if (![ "movie", "series" ].includes(type) || typeof id !== "string") return { streams: [] };

    if (id.startsWith("ia:") && type === "movie") {
      const identifier = id.slice(3);
      const item = await getArchiveItem(identifier);
      const files = Array.isArray(item.files) ? item.files.filter(isPlayableArchiveFile) : [];
      return {
        streams: files.slice(0, 30).map((file) => {
          const height = Number(file.height) || 0;
          const extension = path.posix.extname(file.name).slice(1).toUpperCase();
          const quality = height ? `${height}p` : extension;
          return {
            url: archiveFileUrl(identifier, file.name),
            title: `Internet Archive · ${quality} · ${extension}`,
            ...(height ? { behaviorHints: { videoSize: Number(file.size) || undefined } } : {})
          };
        })
      };
    }

    const database = await loadStreams();
    const candidates = database[id] || [];
    const streams = Array.isArray(candidates) ? candidates : [];
    return {
      streams: streams.filter(validateStream).map((item) => ({
        url: item.url,
        title: String(item.title || item.quality || "Direct stream").slice(0, 180),
        ...(item.behaviorHints && typeof item.behaviorHints === "object"
          ? { behaviorHints: item.behaviorHints }
          : {})
      }))
    };
  } catch (error) {
    console.error("Stream lookup failed:", error.message);
    return { streams: [] };
  }
});

module.exports = {
  addonInterface: builder.getInterface(),
  manifest,
  validateStream,
  isOpenLicense,
  isPlayableArchiveFile,
  archiveFileUrl,
  searchArchive,
  getArchiveItem,
  loadStreams
};
