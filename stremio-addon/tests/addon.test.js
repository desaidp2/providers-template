"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { validateStream, manifest } = require("../addon");

test("manifest exposes movie and series stream resources", () => {
  assert.deepEqual(manifest.resources, ["stream"]);
  assert.deepEqual(manifest.types, ["movie", "series"]);
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
