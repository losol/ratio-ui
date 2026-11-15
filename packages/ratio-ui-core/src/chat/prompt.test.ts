// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from 'vitest';
import { describePromptResponse, promptStatus } from './prompt';
import type { ChatChoicePrompt, ChatConfirmPrompt, ChatPromptResponse } from './types';

const labels = { confirm: 'OK', decline: 'Cancel', dismissed: 'Skipped' };

const confirm: ChatConfirmPrompt = { kind: 'confirm' };
const rooms: ChatChoicePrompt = {
  kind: 'choice',
  options: [
    { value: 'a', label: 'Room A' },
    { value: 'b', label: 'Room B' },
  ],
};

describe('promptStatus', () => {
  it('is open with no status and no response', () => {
    expect(promptStatus(confirm)).toBe('open');
  });

  it('is answered once there is a response', () => {
    expect(promptStatus({ ...confirm, response: { kind: 'confirm', accepted: false } })).toBe('answered');
  });

  it('lets a status outrank the response', () => {
    const response: ChatPromptResponse = { kind: 'confirm', accepted: true };
    expect(promptStatus({ ...confirm, status: 'sending', response })).toBe('sending');
    expect(promptStatus({ ...confirm, status: 'closed', response })).toBe('closed');
    expect(promptStatus({ ...confirm, status: 'open', response })).toBe('open');
  });
});

describe('describePromptResponse', () => {
  it("uses the renderer's labels for a confirm that brings none", () => {
    expect(describePromptResponse(confirm, { kind: 'confirm', accepted: true }, labels)).toBe('OK');
    expect(describePromptResponse(confirm, { kind: 'confirm', accepted: false }, labels)).toBe('Cancel');
  });

  it("prefers the prompt's own labels", () => {
    const own: ChatConfirmPrompt = { kind: 'confirm', confirmLabel: 'Delete', declineLabel: 'Keep' };
    expect(describePromptResponse(own, { kind: 'confirm', accepted: true }, labels)).toBe('Delete');
    expect(describePromptResponse(own, { kind: 'confirm', accepted: false }, labels)).toBe('Keep');
  });

  it('falls back from an empty own label', () => {
    const own: ChatConfirmPrompt = { kind: 'confirm', confirmLabel: '' };
    expect(describePromptResponse(own, { kind: 'confirm', accepted: true }, labels)).toBe('OK');
  });

  it("names a choice by its options' labels", () => {
    expect(describePromptResponse(rooms, { kind: 'choice', values: ['b'] }, labels)).toBe('Room B');
    expect(describePromptResponse(rooms, { kind: 'choice', values: ['a', 'b'] }, labels)).toBe('Room A, Room B');
  });

  it('shows a value with no option as it is', () => {
    expect(describePromptResponse(rooms, { kind: 'choice', values: ['a', 'gone'] }, labels)).toBe('Room A, gone');
  });

  it('says a dismissed prompt was skipped, whatever its kind', () => {
    expect(describePromptResponse(confirm, { kind: 'dismissed' }, labels)).toBe('Skipped');
    expect(describePromptResponse(rooms, { kind: 'dismissed' }, labels)).toBe('Skipped');
  });

  it('reads a response whose kind is not the prompt’s', () => {
    expect(describePromptResponse(confirm, { kind: 'choice', values: ['a'] }, labels)).toBe('a');
    expect(describePromptResponse(rooms, { kind: 'confirm', accepted: true }, labels)).toBe('OK');
  });

  it('is empty for a response kind it does not know', () => {
    const later = { kind: 'fields', values: {} } as unknown as ChatPromptResponse;
    expect(describePromptResponse(confirm, later, labels)).toBe('');
  });
});
