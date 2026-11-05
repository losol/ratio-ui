import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import axe from 'axe-core';
import { ChatLog } from './ChatLog';
import { ChatUsers } from './ChatUsers';

const meta = {
  title: 'Chat/Nickname contrast',
  parameters: {
    theme: 'tabula',
    a11y: {
      test: 'error',
      // Only this issue's semantic-token consumers; other text tokens have
      // independent contrast requirements and must not broaden this fix.
      context: { include: ['[class*="text-(--chat-nick-voice)"]'] },
      options: { runOnly: { type: 'rule', values: ['color-contrast'] } },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Matrix() {
  return (
    <div data-contrast-fixture>
      <h1>Chat nickname contrast</h1>
      <p>Voice and self nicknames · normal text requires 4.5:1</p>
      <div className="grid grid-cols-2 gap-4">
        {['light', 'dark'].map((mode) => (
          <section
            key={mode}
            className={`surface-${mode} bg-surface p-4 text-(--text)`}
          >
            <h2>{mode}</h2>
            <div className="flex flex-col gap-2">
              {['default', 'mention', 'highlighted', 'active'].map((state) => (
                <div key={state} data-state={state}>
                  <h3>{state}</h3>
                  {(['voice', 'self', 'self-op'] as const).map((identity) => (
                    <ChatLog
                      key={identity}
                      me="self"
                      aria-label={`${mode} ${state} ${identity}`}
                      highlightedId={
                        state === 'highlighted' ? identity : undefined
                      }
                      activeId={state === 'active' ? identity : undefined}
                      onToggleReaction={() => {}}
                      messages={[
                        {
                          id: identity,
                          nick: identity === 'voice' ? 'speaker' : 'self',
                          role:
                            identity === 'voice'
                              ? 'voice'
                              : identity === 'self-op'
                                ? 'op'
                                : undefined,
                          text:
                            state === 'mention'
                              ? 'Hello @self'
                              : `${identity} nickname`,
                        },
                      ]}
                    />
                  ))}
                </div>
              ))}
              <div className="bg-(--chat-sidebar-bg)">
                <ChatUsers
                  aria-label={`${mode} people`}
                  users={[
                    { nick: 'speaker', role: 'voice' },
                    { nick: 'self', role: 'voice', you: true },
                    { nick: 'moderator', role: 'op' },
                  ]}
                />
              </div>
            </div>
          </section>
        ))}
      </div>
      <pre data-ratios aria-label="Measured nickname contrast" />
    </div>
  );
}

// Canvas converts CSS colors (including OKLCH) to rendered sRGB. Composite
// every ancestor background so translucent row hover colors are measured too.
function rgba(color: string): [number, number, number, number] {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const pixel = context.getImageData(0, 0, 1, 1).data;
  return [pixel[0]!, pixel[1]!, pixel[2]!, pixel[3]! / 255];
}
function background(element: Element | null): number[] {
  if (!element) return [255, 255, 255];
  const [r, g, b, a] = rgba(getComputedStyle(element).backgroundColor);
  const below = background(element.parentElement);
  return [r, g, b].map((v, i) => v * a + below[i]! * (1 - a));
}
function luminance(rgb: number[]): number {
  return rgb
    .slice(0, 3)
    .map((v) => v / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i]!, 0);
}
const hex = (rgb: number[]) =>
  '#' +
  rgb
    .slice(0, 3)
    .map((v) => Math.round(v).toString(16).padStart(2, '0'))
    .join('');

const play: Story['play'] = async ({ canvasElement }) => {
  const pointer =
    '__vitest_browser__' in globalThis
      ? (await import('vitest/browser')).userEvent
      : undefined;
  if (pointer) await pointer.hover(canvasElement.querySelector('h1')!);
  const violations: string[] = [];
  const checkAxe = async (element: Element) => {
    const report = await axe.run(element as HTMLElement, {
      runOnly: ['color-contrast'],
    });
    violations.push(
      ...report.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.failureSummary).join('; ')}`,
      ),
    );
  };
  const results: {
    state: string;
    foreground: string;
    background: string;
    ratio: number;
    fontSize: string;
    fontWeight: string;
  }[] = [];
  const measure = (element: Element, suffix = '') => {
    const foreground = rgba(getComputedStyle(element).color);
    const bg = background(element);
    const a = luminance(foreground),
      b = luminance(bg);
    results.push({
      state: `${element.closest('section')!.classList[0]} ${element.closest('[data-state]')?.getAttribute('data-state') ?? (element.closest('li')?.textContent?.includes('you') ? 'users self' : 'users voice')} ${element.textContent?.trim()}${suffix}`,
      fontSize: getComputedStyle(element).fontSize,
      fontWeight: getComputedStyle(element).fontWeight,
      foreground: hex(foreground),
      background: hex(bg),
      ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
    });
  };
  const targets = canvasElement.querySelectorAll(
    '[class*="text-(--chat-nick-voice)"]',
  );
  await expect(targets).toHaveLength(28);
  for (const element of targets) {
    measure(element);
    await checkAxe(element);
    if (!pointer) continue;
    const before = hex(background(element));
    const row = element.closest('[data-message-id], li')!;
    await pointer.hover(row);
    // ChatLog uses a 100ms background transition.
    await new Promise((resolve) => setTimeout(resolve, 150));
    measure(element, ' hover');
    await checkAxe(element);
    if (
      '__vitest_browser__' in globalThis &&
      element.closest('[data-state=default]')
    ) {
      await expect(hex(background(element))).not.toBe(before);
    }
    await pointer.unhover(row);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  canvasElement.querySelector('[data-ratios]')!.textContent = results
    .map(
      (r) =>
        `${r.state}: ${r.foreground} / ${r.background} = ${r.ratio.toFixed(2)}:1`,
    )
    .join('\n');
  console.info(
    JSON.stringify({ measurements: results, axeViolations: violations }),
  );
  for (const result of results)
    await expect(result.ratio, result.state).toBeGreaterThanOrEqual(4.5);
  for (const section of canvasElement.querySelectorAll('section')) {
    const style = getComputedStyle(section);
    const step = section.classList.contains('surface-dark') ? '300' : '800';
    await expect(style.getPropertyValue('--chat-nick-voice').trim()).toBe(
      style.getPropertyValue(`--color-accent-${step}`).trim(),
    );
  }
  await expect(violations).toEqual([]);
  await expect(
    canvasElement.querySelector(
      '[data-message-id="self-op"] > span.font-semibold [aria-hidden]',
    ),
  ).toHaveTextContent('@');
  // Self has no glyph; voiced and operator users retain their role glyphs.
  await expect(
    canvasElement.querySelectorAll('li [aria-hidden]')[0],
  ).toHaveTextContent('@');
};

export const Tabula: Story = { render: () => <Matrix />, play };
export const Standard: Story = {
  parameters: { theme: 'light' },
  render: () => <Matrix />,
  play,
};
