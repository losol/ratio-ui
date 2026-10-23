// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { defineAchievement, defineCredential } from './achievement';
import { OB_SVG_NAMESPACE, bakePng, bakeSvg, unbakePng, unbakeSvg } from './bake';

const credential = defineCredential({
  issuer: { id: 'https://civitas.example', name: 'Civitas' },
  achievement: defineAchievement({
    id: 'https://civitas.example/achievements/gangemester',
    name: 'Gangemester',
    description: 'Kan gangetabellen. Also "quotes" & <angles>.',
    criteria: { narrative: 'Alt riktig, to ganger.' },
  }),
  validFrom: '2026-10-23T00:00:00Z',
});

const jws = 'eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiJ4In0.c2lnbmF0dXJl';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
  '<circle cx="50" cy="50" r="46"/></svg>';

describe('bakeSvg / unbakeSvg', () => {
  it('declares the namespace and puts a JWS in verify as the first child', () => {
    const baked = bakeSvg(svg, jws);
    expect(baked).toContain(`xmlns:openbadges="${OB_SVG_NAMESPACE}"`);
    expect(baked).toMatch(/^<svg[^>]*><openbadges:credential verify="eyJ/);
    expect(unbakeSvg(baked)).toEqual({ svg, credential: jws });
  });

  it('puts a JSON credential inside, in CDATA, and reads it back', () => {
    const baked = bakeSvg(svg, credential);
    expect(baked).toContain('<openbadges:credential><![CDATA[{');
    const { svg: clean, credential: read } = unbakeSvg(baked);
    expect(clean).toBe(svg);
    expect(read).toEqual(credential);
  });

  it('replaces a credential that is already baked, once', () => {
    const twice = bakeSvg(bakeSvg(svg, jws), credential);
    expect(twice.match(/<openbadges:credential/g)).toHaveLength(1);
    expect(twice.match(/xmlns:openbadges/g)).toHaveLength(1);
    expect(unbakeSvg(twice).credential).toEqual(credential);
  });

  it('survives a self-closing root and a credential that contains "]]>"', () => {
    const odd = { ...credential, description: 'ends with ]]> inside' };
    const { credential: read } = unbakeSvg(bakeSvg('<svg xmlns="http://www.w3.org/2000/svg"/>', odd));
    expect(read).toEqual(odd);
  });

  it('refuses a string that is not a JWS, and a document without <svg>', () => {
    expect(() => bakeSvg(svg, 'not a token')).toThrow(/JWS/);
    expect(() => bakeSvg('<div/>', jws)).toThrow(/svg/);
  });

  it('gives an unbaked document back as it is', () => {
    expect(unbakeSvg(svg)).toEqual({ svg });
  });
});

// A 1×1 PNG: signature, IHDR, IDAT, IEND.
const png = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10,
  0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137,
  0, 0, 0, 13, 73, 68, 65, 84, 120, 218, 99, 248, 255, 255, 63, 0, 5, 254, 2, 254, 167, 53, 129, 132,
  0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
]);

describe('bakePng / unbakePng', () => {
  it('inserts an iTXt chunk after IHDR and reads it back', () => {
    const baked = bakePng(png, credential);
    expect(baked.length).toBeGreaterThan(png.length);
    // signature (8) + IHDR (12 + 13) = 33, then the length of our chunk and "iTXt"
    expect(String.fromCharCode(...baked.subarray(37, 41))).toBe('iTXt');
    expect(String.fromCharCode(...baked.subarray(41, 60))).toBe('openbadgecredential');
    const { png: clean, credential: read } = unbakePng(baked);
    expect(Array.from(clean)).toEqual(Array.from(png));
    expect(read).toEqual(credential);
  });

  it('bakes a JWS as the string it is', () => {
    expect(unbakePng(bakePng(png, jws)).credential).toBe(jws);
  });

  it('replaces a credential that is already baked', () => {
    const twice = bakePng(bakePng(png, jws), credential);
    expect(unbakePng(twice).credential).toEqual(credential);
    expect(Array.from(unbakePng(twice).png)).toEqual(Array.from(png));
  });

  it('refuses what is not a PNG', () => {
    expect(() => bakePng(new Uint8Array([1, 2, 3]), jws)).toThrow(/PNG/);
  });
});
