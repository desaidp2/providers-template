"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { addonBuilder } = require("stremio-addon-sdk");

const STREAMS_FILE = process.env.STREAMS_FILE || path.join(__dirname, "streams.json");
const STREAMS_URL = process.env.STREAMS_URL;

const manifest = {
  id: "community.desai.authorized-streams",
  version: "0.1.0",
  name: "Vega Streams (Personal)",
  description: "Personal Stremio adapter for direct HTTP(S) streams you own or are authorized to use.",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: []
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

async function loadStreams() {
  if (STREAMS_URL) {
    const response = await fetch(STREAMS_URL, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`STREAMS_URL returned HTTP ${response.status}`);
    return response.json();
  }
  if (!fs.existsSync(STREAMS_FILE)) return {};
  return JSON.parse(fs.readFileSync(STREAMS_FILE, "utf8"));
}

const builder = new addonBuilder(manifest);
builder.defineStreamHandler(async ({ type, id }) => {
  try {
    if (!["movie", "series"].includes(type) || typeof id !== "string") return { streams: [] };
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

module.exports = { addonInterface: builder.getInterface(), manifest, validateStream, loadStreams };
