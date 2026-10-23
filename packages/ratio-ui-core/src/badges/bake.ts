// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

// Baking: putting the credential inside the badge's picture, so the file a
// learner downloads and shares carries its own proof. Open Badges 3.0
// defines it for SVG and PNG:
//
//  SVG  an `openbadges` namespace on the root and an `<openbadges:credential>`
//       element as the first child of `<svg>`. A JWS goes in its `verify`
//       attribute; a JSON credential (with an embedded proof) goes inside,
//       in CDATA.
//  PNG  an `iTXt` chunk with the keyword `openbadgecredential`, holding the
//       JWS or the JSON, placed after `IHDR`.
//
// https://www.imsglobal.org/spec/ob/v3p0/#baking
//
// This file does bytes and strings only. It does not sign, and it does not
// check what it is given: a baked credential is as good as its proof.

import type { OpenBadgeCredential } from './types';

/** The namespace a baked SVG declares. */
export const OB_SVG_NAMESPACE = 'https://purl.imsglobal.org/ob/v3p0';
/** The keyword of a baked PNG's `iTXt` chunk. */
export const OB_PNG_KEYWORD = 'openbadgecredential';

/**
 * What goes into the picture: a compact JWS (the signed credential as a
 * string), or the credential as JSON with its `proof` inside.
 */
export type BakedCredential = string | OpenBadgeCredential;

const isJws = (value: string): boolean => /^[\w-]+\.[\w-]+\.[\w-]*$/.test(value);

const escapeAttribute = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function credentialElement(credential: BakedCredential): string {
  if (typeof credential === 'string') {
    if (!isJws(credential)) throw new Error('bakeSvg: a string credential must be a compact JWS');
    return `<openbadges:credential verify="${escapeAttribute(credential)}"/>`;
  }
  // `]]>` cannot appear inside CDATA; split it the standard way.
  const json = JSON.stringify(credential).replace(/\]\]>/g, ']]]]><![CDATA[>');
  return `<openbadges:credential><![CDATA[${json}]]></openbadges:credential>`;
}

/**
 * The SVG with the credential baked in. Takes the whole document as a
 * string (a renderer's `renderToStaticMarkup` of the badge's art, with the
 * `xmlns` on the root) and gives it back with the namespace declared and
 * the credential as the first child. A previously baked credential is
 * replaced.
 */
export function bakeSvg(svg: string, credential: BakedCredential): string {
  const clean = unbakeSvg(svg).svg;
  const open = clean.match(/<svg\b[^>]*>/);
  if (!open || open.index === undefined) throw new Error('bakeSvg: no <svg> root element');
  let tag = open[0];
  if (!/\sxmlns:openbadges=/.test(tag)) {
    tag = tag.replace(/\s*(\/?)>$/, ` xmlns:openbadges="${OB_SVG_NAMESPACE}"$1>`);
  }
  const at = open.index + open[0].length;
  return clean.slice(0, open.index) + tag + credentialElement(credential) + clean.slice(at);
}

export interface UnbakedSvg {
  /** The document without the credential element. */
  svg: string;
  /** The JWS, or the JSON parsed; `undefined` when nothing was baked. */
  credential?: BakedCredential;
}

/**
 * The credential out of a baked SVG, and the picture without it — the
 * element and the namespace both gone, so a bake and an unbake give the
 * document back as it was. Parses the JSON form; the JWS is returned as
 * the string it is, for a verifier.
 */
export function unbakeSvg(svg: string): UnbakedSvg {
  const match = svg.match(
    /<openbadges:credential\b([^>]*?)(?:\/>|>([\s\S]*?)<\/openbadges:credential>)/,
  );
  if (!match || match.index === undefined) return { svg };
  const rest = (svg.slice(0, match.index) + svg.slice(match.index + match[0].length)).replace(
    /(<svg\b[^>]*?)\s+xmlns:openbadges="[^"]*"/,
    '$1',
  );
  const verify = match[1]?.match(/\sverify="([^"]*)"/);
  if (verify) {
    const jws = verify[1]!.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
    return { svg: rest, credential: jws };
  }
  const body = (match[2] ?? '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
  if (!body) return { svg: rest };
  try {
    return { svg: rest, credential: JSON.parse(body) as OpenBadgeCredential };
  } catch {
    return { svg: rest, credential: body };
  }
}

// --- PNG ---------------------------------------------------------------

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const readU32 = (bytes: Uint8Array, at: number): number =>
  ((bytes[at]! << 24) | (bytes[at + 1]! << 16) | (bytes[at + 2]! << 8) | bytes[at + 3]!) >>> 0;

const u32 = (value: number): number[] => [
  (value >>> 24) & 0xff,
  (value >>> 16) & 0xff,
  (value >>> 8) & 0xff,
  value & 0xff,
];

interface Chunk {
  type: string;
  /** Offset of the length field. */
  start: number;
  /** Offset just past the CRC. */
  end: number;
  data: Uint8Array;
}

function* chunks(png: Uint8Array): Generator<Chunk> {
  if (png.length < 8 || PNG_SIGNATURE.some((b, i) => png[i] !== b)) {
    throw new Error('not a PNG');
  }
  let at = 8;
  while (at + 12 <= png.length) {
    const length = readU32(png, at);
    const type = String.fromCharCode(...png.subarray(at + 4, at + 8));
    const end = at + 12 + length;
    if (end > png.length) throw new Error('PNG: truncated chunk');
    yield { type, start: at, end, data: png.subarray(at + 8, at + 8 + length) };
    at = end;
  }
}

function itxtChunk(text: string): Uint8Array {
  // keyword, NUL, compression flag 0, compression method 0, language tag
  // (empty), NUL, translated keyword (empty), NUL, text
  const data = new Uint8Array([
    ...encoder.encode(OB_PNG_KEYWORD),
    0,
    0,
    0,
    0,
    0,
    ...encoder.encode(text),
  ]);
  const typeAndData = new Uint8Array([...encoder.encode('iTXt'), ...data]);
  return new Uint8Array([...u32(data.length), ...typeAndData, ...u32(crc32(typeAndData))]);
}

/** The keyword of an `iTXt` chunk, and its text. */
function readItxt(data: Uint8Array): { keyword: string; text: string } | undefined {
  const nul = data.indexOf(0);
  if (nul < 0 || nul + 5 > data.length) return undefined;
  const keyword = decoder.decode(data.subarray(0, nul));
  const compressed = data[nul + 1] === 1;
  if (compressed) return undefined; // the spec bakes uncompressed
  let at = nul + 3;
  at = data.indexOf(0, at) + 1; // past the language tag
  at = data.indexOf(0, at) + 1; // past the translated keyword
  if (at <= 0) return undefined;
  return { keyword, text: decoder.decode(data.subarray(at)) };
}

/**
 * The PNG with the credential baked in, as a new byte array: an `iTXt`
 * chunk right after `IHDR`. A previously baked credential is replaced.
 */
export function bakePng(png: Uint8Array, credential: BakedCredential): Uint8Array {
  const clean = unbakePng(png).png;
  const text = typeof credential === 'string' ? credential : JSON.stringify(credential);
  if (typeof credential === 'string' && !isJws(credential)) {
    throw new Error('bakePng: a string credential must be a compact JWS');
  }
  let ihdrEnd = -1;
  for (const chunk of chunks(clean)) {
    if (chunk.type === 'IHDR') {
      ihdrEnd = chunk.end;
      break;
    }
  }
  if (ihdrEnd < 0) throw new Error('bakePng: no IHDR chunk');
  const inserted = itxtChunk(text);
  const out = new Uint8Array(clean.length + inserted.length);
  out.set(clean.subarray(0, ihdrEnd));
  out.set(inserted, ihdrEnd);
  out.set(clean.subarray(ihdrEnd), ihdrEnd + inserted.length);
  return out;
}

export interface UnbakedPng {
  /** The bytes without the credential chunk. */
  png: Uint8Array;
  credential?: BakedCredential;
}

/** The credential out of a baked PNG, and the picture without it. */
export function unbakePng(png: Uint8Array): UnbakedPng {
  for (const chunk of chunks(png)) {
    if (chunk.type !== 'iTXt') continue;
    const itxt = readItxt(chunk.data);
    if (itxt?.keyword !== OB_PNG_KEYWORD) continue;
    const rest = new Uint8Array(png.length - (chunk.end - chunk.start));
    rest.set(png.subarray(0, chunk.start));
    rest.set(png.subarray(chunk.end), chunk.start);
    const text = itxt.text;
    if (isJws(text)) return { png: rest, credential: text };
    try {
      return { png: rest, credential: JSON.parse(text) as OpenBadgeCredential };
    } catch {
      return { png: rest, credential: text };
    }
  }
  return { png };
}
