'use strict';

const { addonBuilder } = require('stremio-addon-sdk');

const LICENSE_QUERY = '(licenseurl:*publicdomain* OR licenseurl:*creativecommons.org*)';
const VIDEO_EXTENSIONS = new Set(['mp4', 'm4v', 'webm', 'ogv', 'mov', 'mkv']);
const LICENSE_RE = /(?:publicdomain|creativecommons\.org)/i;
const MAX_RESULTS = 40;

function isAllowedLicense(value) {
  return typeof value === 'string' && LICENSE_RE.test(value);
}

function isVideoFile(name) {
  if (typeof name !== 'string') return false;
  const ext = name.split('.').pop().toLowerCase();
  return VIDEO_EXTENSIONS.has(ext);
}

function safeArchiveUrl(identifier, filename) {
  if (!/^[A-Za-z0-9._-]+$/.test(identifier) || !isVideoFile(filename) || filename.includes('..')) return null;
  return 'https://archive.org/download/' + encodeURIComponent(identifier) + '/' +
    filename.split('/').map(encodeURIComponent).join('/');
}

function makeBuilder(fetchImpl = globalThis.fetch) {
  const manifest = {
    id: 'community.desai.vega-public-catalog',
    version: '1.0.0',
    name: 'Vega Public Video',
    description: 'Public-domain and Creative Commons videos from Internet Archive',
    resources: ['catalog', 'meta', 'stream'],
    types: ['movie'],
    idPrefixes: ['ia:'],
    catalogs: [{ type: 'movie', id: 'ia-public', name: 'Internet Archive — Open License', extra: [{ name: 'search', isRequired: false }] }]
  };

  async function archiveSearch(search, skip = 0) {
    const terms = typeof search === 'string' ? search.trim().slice(0, 120) : '';
    const q = 'mediatype:movies AND ' + LICENSE_QUERY + (terms ? ' AND title:(' + terms.replace(/[(){}\[\]^"~*?:\\/]/g, ' ') + ')' : '');
    const url = new URL('https://archive.org/advancedsearch.php');
    url.searchParams.set('q', q);
    url.searchParams.set('fl[]', 'identifier,title,description,year,licenseurl');
    url.searchParams.set('rows', String(Math.min(MAX_RESULTS, MAX_RESULTS)));
    url.searchParams.set('page', String(Math.floor(Math.max(0, skip) / MAX_RESULTS) + 1));
    url.searchParams.set('output', 'json');
    const response = await fetchImpl(url);
    if (!response.ok) throw new Error('Internet Archive search failed: HTTP ' + response.status);
    const body = await response.json();
    return (body.response?.docs || []).filter(item => item.identifier && isAllowedLicense(item.licenseurl));
  }

  async function metadata(identifier) {
    if (typeof identifier !== 'string' || !/^[A-Za-z0-9._-]+$/.test(identifier)) return null;
    const response = await fetchImpl('https://archive.org/metadata/' + encodeURIComponent(identifier));
    if (!response.ok) return null;
    const data = await response.json();
    if (!isAllowedLicense(data.metadata?.licenseurl)) return null;
    return data;
  }

  const builder = new addonBuilder(manifest);
  builder.defineCatalogHandler(async ({ extra = {}, skip = 0 }) => {
    const docs = await archiveSearch(extra.search, skip);
    return { metas: docs.map(item => ({
      id: 'ia:' + item.identifier,
      type: 'movie',
      name: item.title || item.identifier,
      description: typeof item.description === 'string' ? item.description.slice(0, 3000) : undefined,
      releaseInfo: item.year ? String(item.year) : undefined,
      poster: 'https://archive.org/services/img/' + encodeURIComponent(item.identifier)
    })) };
  });

  builder.defineMetaHandler(async ({ id }) => {
    if (typeof id !== 'string' || !id.startsWith('ia:')) return { meta: null };
    const identifier = id.slice(3);
    const data = await metadata(identifier);
    if (!data) return { meta: null };
    const m = data.metadata || {};
    return { meta: {
      id, type: 'movie', name: m.title || identifier,
      description: typeof m.description === 'string' ? m.description.slice(0, 5000) : undefined,
      releaseInfo: m.year ? String(m.year) : undefined,
      poster: 'https://archive.org/services/img/' + encodeURIComponent(identifier)
    } };
  });

  builder.defineStreamHandler(async ({ id }) => {
    if (typeof id !== 'string' || !id.startsWith('ia:')) return { streams: [] };
    const identifier = id.slice(3);
    const data = await metadata(identifier);
    if (!data) return { streams: [] };
    const files = (data.files || []).filter(file => isVideoFile(file.name) && !file.source?.includes('metadata'));
    const streams = files.slice(0, 20).map(file => {
      const url = safeArchiveUrl(identifier, file.name);
      if (!url) return null;
      const resolution = String(file.name).match(/(?:2160|1080|720|480)p?/i)?.[0] || '';
      return { name: 'Internet Archive', title: [file.name, resolution].filter(Boolean).join(' · '), url };
    }).filter(Boolean);
    return { streams };
  });

  return { builder, manifest };
}

module.exports = { makeBuilder, isAllowedLicense, isVideoFile, safeArchiveUrl };
