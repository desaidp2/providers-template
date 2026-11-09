"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
  validateStream,
  isOpenLicense,
  isPlayableArchiveFile,
  archiveFileUrl,
  manifest
} = require("../addon");

test("manifest exposes catalog, metadata, and stream resources", () => {
  assert.deepEqual(manifest.resources, ["catalog", "meta", "stream"]);
  assert.ok(manifest.catalogs.some((catalog) => catalog.id === "archive-open"));
  assert.ok(manifest.idPrefixes.includes("ia:"));
});

test("accepts direct HTTP and HTTPS URLs", () => {
  assert.equal(validateStream({ url: "https://media.example/video.m3u8" }), true);
  assert.equal(validateStream({ url: "http://media.example/video.mp4" }), true);
});

test("rejects invalid, non-HTTP, and empty stream records", () => {
  assert.equal(validateStream(null), false);
  assert.equal(validateStream({ url: "javascript:alert(1)" }), false);
  assert.equal(validateStream({ url: "file:///tmp/video.mp4" }), false);
  assert.equal(validateStream({ url: "not a URL" }), false);
  assert.equal(validateStream({ title: "missing URL" }), false);
});

test("only recognizes public-domain and Creative Commons license URLs", () => {
  assert.equal(isOpenLicense("https://creativecommons.org/licenses/by/4.0/"), true);
  assert.equal(isOpenLicense("https://creativecommons.org/publicdomain/zero/1.0/"), true);
  assert.equal(isOpenLicense("https://example.com/license"), false);
  assert.equal(isOpenLicense(undefined), false);
});

test("only exposes supported video files from Archive items", () => {
  assert.equal(isPlayableArchiveFile({ name: "film.mp4" }), true);
  assert.equal(isPlayableArchiveFile({ name: "film.mkv" }), false);
  assert.equal(isPlayableArchiveFile({ name: "thumbs/.thumbs/preview.mp4" }), false);
  assert.equal(isPlayableArchiveFile({ name: "captions.srt" }), false);
});

test("builds safely encoded Internet Archive file URLs", () => {
  assert.equal(
    archiveFileUrl("public-film", "folder/My Film.mp4"),
    "https://archive.org/download/public-film/folder/My%20Film.mp4"
  );
});
