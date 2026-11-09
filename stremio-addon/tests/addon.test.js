'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { isAllowedLicense, isVideoFile, safeArchiveUrl } = require('../addon');

test('accepts only public-domain or Creative Commons license metadata', () => {
  assert.equal(isAllowedLicense('http://creativecommons.org/licenses/by/4.0/'), true);
  assert.equal(isAllowedLicense('https://creativecommons.org/publicdomain/zero/1.0/'), true);
  assert.equal(isAllowedLicense('all rights reserved'), false);
  assert.equal(isAllowedLicense(undefined), false);
});

test('recognizes supported video extensions case-insensitively', () => {
  assert.equal(isVideoFile('movie.MP4'), true);
  assert.equal(isVideoFile('movie.webm'), true);
  assert.equal(isVideoFile('cover.jpg'), false);
  assert.equal(isVideoFile('../movie.mp4'), false);
  assert.equal(isVideoFile('folder\\\\movie.mp4'), false);
});

test('builds safe encoded Archive download URLs and rejects invalid identifiers', () => {
  assert.equal(safeArchiveUrl('sample_item', 'movie file.mp4'), 'https://archive.org/download/sample_item/movie%20file.mp4');
  assert.equal(safeArchiveUrl('../private', 'movie.mp4'), null);
  assert.equal(safeArchiveUrl('sample_item', 'poster.jpg'), null);
  assert.equal(safeArchiveUrl('sample_item', '../movie.mp4'), null);
});
