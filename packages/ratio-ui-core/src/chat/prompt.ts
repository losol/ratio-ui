// ratio-ui · design system for knowledge sharing
// SPDX-FileCopyrightText: 2026 Losol AS
// SPDX-License-Identifier: MPL-2.0

import type { ChatPrompt, ChatPromptResponse, ChatPromptStatus } from './types';

/**
 * A prompt's status with the default applied: a prompt that carries a
 * `response` and no `status` is answered, any other is open.
 * @beta May change before release.
 */
export const promptStatus = (prompt: ChatPrompt): ChatPromptStatus =>
  prompt.status ?? (prompt.response ? 'answered' : 'open');

/**
 * The renderer's own words for an answer, used where the prompt brings none.
 * @beta Shape may change before release.
 */
export interface ChatPromptAnswerLabels {
  confirm: string;
  decline: string;
  dismissed: string;
}

/**
 * An answer in words, for the receipt: the confirming or declining label,
 * or the picked options' labels. A value with no option is shown as it is.
 * Empty for a response `kind` this version does not know.
 * @beta May change before release.
 */
export const describePromptResponse = (
  prompt: ChatPrompt,
  response: ChatPromptResponse,
  labels: ChatPromptAnswerLabels,
): string => {
  switch (response.kind) {
    case 'dismissed':
      return labels.dismissed;
    case 'confirm': {
      const own = prompt.kind === 'confirm' ? prompt : undefined;
      return response.accepted
        ? own?.confirmLabel || labels.confirm
        : own?.declineLabel || labels.decline;
    }
    case 'choice': {
      const options = prompt.kind === 'choice' ? prompt.options : [];
      return response.values
        .map(value => options.find(option => option.value === value)?.label ?? value)
        .join(', ');
    }
    default:
      return '';
  }
};
