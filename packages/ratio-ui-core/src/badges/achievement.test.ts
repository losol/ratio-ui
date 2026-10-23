// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import {
  achievementOf,
  defineAchievement,
  defineCredential,
  isAchievement,
  isOpenBadgeCredential,
} from './achievement';
import { OB_CONTEXT } from './types';

const gangemester = defineAchievement({
  id: 'https://civitas.example/achievements/gangemester',
  name: 'Gangemester',
  description: 'Kan gangetabellen fra 1 til 10.',
  criteria: { narrative: 'Alle gangestykkene fra 1·1 til 10·10 riktig, to ganger på rad.' },
  achievementType: 'Competency',
  inLanguage: 'nb',
});

describe('defineAchievement', () => {
  it('fills in the type and keeps the rest', () => {
    expect(gangemester.type).toEqual(['Achievement']);
    expect(gangemester.achievementType).toBe('Competency');
    expect(isAchievement(gangemester)).toBe(true);
  });

  it('keeps a type the caller spells out', () => {
    const a = defineAchievement({ ...gangemester, type: ['Achievement', 'ext:Civitas'] });
    expect(a.type).toEqual(['Achievement', 'ext:Civitas']);
  });
});

describe('isAchievement', () => {
  it('rejects what is missing a required field or the type', () => {
    expect(isAchievement({ ...gangemester, criteria: undefined })).toBe(false);
    expect(isAchievement({ ...gangemester, type: ['Profile'] })).toBe(false);
    expect(isAchievement(null)).toBe(false);
    expect(isAchievement('Gangemester')).toBe(false);
  });
});

describe('defineCredential', () => {
  const credential = defineCredential({
    id: 'urn:uuid:3b7a0c2e-0000-4000-8000-000000000001',
    issuer: { id: 'https://civitas.example', name: 'Civitas skole' },
    achievement: gangemester,
    subject: { id: 'https://civitas.example/users/42' },
    validFrom: '2026-10-23T00:00:00Z',
  });

  it('is an Open Badges 3.0 credential with the contexts and types the spec requires', () => {
    expect(credential['@context']).toEqual([...OB_CONTEXT]);
    expect(credential.type).toEqual(['VerifiableCredential', 'OpenBadgeCredential']);
    expect(credential.issuer.type).toEqual(['Profile']);
    expect(credential.credentialSubject.type).toEqual(['AchievementSubject']);
    expect(credential.credentialSubject.id).toBe('https://civitas.example/users/42');
    expect(achievementOf(credential)).toEqual(gangemester);
    expect(isOpenBadgeCredential(credential)).toBe(true);
  });

  it('leaves out what was not given rather than writing undefined', () => {
    const bare = defineCredential({ issuer: { id: 'https://x' }, achievement: gangemester });
    expect('id' in bare).toBe(false);
    expect('name' in bare).toBe(false);
    expect(Date.parse(bare.validFrom)).not.toBeNaN();
  });

  it('round-trips through JSON', () => {
    expect(isOpenBadgeCredential(JSON.parse(JSON.stringify(credential)))).toBe(true);
  });
});

describe('isOpenBadgeCredential', () => {
  it('accepts the AchievementCredential alias and refuses other credentials', () => {
    const credential = defineCredential({ issuer: { id: 'https://x' }, achievement: gangemester });
    expect(
      isOpenBadgeCredential({ ...credential, type: ['VerifiableCredential', 'AchievementCredential'] }),
    ).toBe(true);
    expect(
      isOpenBadgeCredential({ ...credential, type: ['VerifiableCredential', 'DriverLicence'] }),
    ).toBe(false);
    expect(isOpenBadgeCredential({ ...credential, credentialSubject: {} })).toBe(false);
  });
});
