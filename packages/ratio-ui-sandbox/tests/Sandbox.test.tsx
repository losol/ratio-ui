import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Sandbox } from '../src/Sandbox/Sandbox';

const SRC = 'https://sandbox.example/0.1.0/frame.html';
const ORIGIN = 'https://sandbox.example';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.colorScheme;
});

const frame = () => screen.getByTitle('Counter') as HTMLIFrameElement;

const fromFrame = (
  iframe: HTMLIFrameElement,
  message: Record<string, unknown>,
  overrides: { origin?: string; source?: Window | null } = {},
) =>
  act(() => {
    window.dispatchEvent(
      new MessageEvent('message', {
        data: { source: 'ratio-ui-sandbox', ...message },
        origin: overrides.origin ?? ORIGIN,
        source: overrides.source === undefined ? iframe.contentWindow : overrides.source,
      }),
    );
  });

const spyOnPost = (iframe: HTMLIFrameElement) =>
  vi.spyOn(iframe.contentWindow as Window, 'postMessage').mockImplementation(() => {});

describe('Sandbox', () => {
  it('loads the frame from the sandbox origin with a fixed set of permissions', () => {
    render(<Sandbox src={SRC} title="Counter" code="export default () => null;" />);
    expect(frame().getAttribute('src')).toBe(SRC);
    expect(frame().getAttribute('sandbox')).toBe('allow-scripts allow-same-origin');
    expect(frame().getAttribute('referrerpolicy')).toBe('no-referrer');
    expect(frame().style.height).toBe('120px');
  });

  it('refuses a frame on the page’s own origin', () => {
    render(<Sandbox src={`${window.location.origin}/frame.html`} title="Counter" code="" />);
    expect(screen.queryByTitle('Counter')).toBeNull();
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it.each(['/sandbox/frame.html', 'javascript:alert(1)', 'data:text/html,hi', ''])(
    'refuses a frame URL that is not absolute http(s): %j',
    (src) => {
      render(<Sandbox src={src} title="Counter" code="" />);
      expect(screen.queryByTitle('Counter')).toBeNull();
      expect(screen.getByRole('alert')).toBeTruthy();
    },
  );

  it('sends the code when the frame says hello, to the sandbox origin only', () => {
    document.documentElement.dataset.theme = 'bureau';
    render(
      <Sandbox src={SRC} title="Counter" code="export default 1;" props={{ start: 3 }} lang="nb" />,
    );
    const post = spyOnPost(frame());

    fromFrame(frame(), { type: 'hello' });

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith(
      {
        source: 'ratio-ui-sandbox-host',
        type: 'run',
        code: 'export default 1;',
        props: { start: 3 },
        lang: 'nb',
        theme: 'bureau',
        colorScheme: undefined,
      },
      ORIGIN,
    );
  });

  it('does not send code to anything but its own frame on the sandbox origin', () => {
    render(<Sandbox src={SRC} title="Counter" code="secret" />);
    const iframe = frame();
    const post = spyOnPost(iframe);

    fromFrame(iframe, { type: 'hello' }, { origin: 'https://elsewhere.example' });
    fromFrame(iframe, { type: 'hello' }, { source: window });
    fromFrame(iframe, { type: 'hello', source: 'someone-else' });

    expect(post).not.toHaveBeenCalled();
  });

  it('follows the height the content reports, within its bounds', () => {
    render(<Sandbox src={SRC} title="Counter" code="" minHeight={100} maxHeight={500} />);
    const iframe = frame();

    fromFrame(iframe, { type: 'resize', height: 240 });
    expect(iframe.style.height).toBe('240px');

    fromFrame(iframe, { type: 'resize', height: 90000 });
    expect(iframe.style.height).toBe('500px');

    fromFrame(iframe, { type: 'resize', height: 3 });
    expect(iframe.style.height).toBe('100px');

    fromFrame(iframe, { type: 'resize', height: 300 }, { origin: 'https://elsewhere.example' });
    expect(iframe.style.height).toBe('100px');
  });

  it('replaces the frame with a message when the code fails', () => {
    const onError = vi.fn();
    render(
      <Sandbox
        src={SRC}
        title="Counter"
        code=""
        onError={onError}
        labels={{ error: 'Eksempelet kunne ikke vises.' }}
      />,
    );
    fromFrame(frame(), { type: 'error', message: 'boom' });

    expect(screen.queryByTitle('Counter')).toBeNull();
    expect(screen.getByRole('alert').textContent).toBe('Eksempelet kunne ikke vises.');
    expect(onError).toHaveBeenCalledWith('boom');
  });

  it('gives up on a frame that loads but never starts the code', () => {
    vi.useFakeTimers();
    const onError = vi.fn();
    render(<Sandbox src={SRC} title="Counter" code="" timeout={2000} onError={onError} />);

    fireEvent.load(frame());
    act(() => vi.advanceTimersByTime(1999));
    expect(screen.queryByRole('alert')).toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(onError).toHaveBeenCalledWith('The sandbox did not start within 2000 ms.');
  });

  it('does not give up on a frame that started', () => {
    vi.useFakeTimers();
    render(<Sandbox src={SRC} title="Counter" code="" timeout={2000} />);

    fireEvent.load(frame());
    fromFrame(frame(), { type: 'ready' });
    act(() => vi.advanceTimersByTime(5000));

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('posts theme changes on the page into a running frame', async () => {
    render(<Sandbox src={SRC} title="Counter" code="" />);
    const post = spyOnPost(frame());
    fromFrame(frame(), { type: 'ready' });
    post.mockClear();

    await act(async () => {
      document.documentElement.dataset.colorScheme = 'dark';
      await Promise.resolve();
    });

    expect(post).toHaveBeenLastCalledWith(
      { source: 'ratio-ui-sandbox-host', type: 'theme', theme: undefined, colorScheme: 'dark' },
      ORIGIN,
    );
  });

  it('lets explicit theme props win over the page', () => {
    document.documentElement.dataset.theme = 'bureau';
    render(<Sandbox src={SRC} title="Counter" code="" theme="atelier" colorScheme="light" />);
    const post = spyOnPost(frame());

    fromFrame(frame(), { type: 'hello' });

    expect(post.mock.calls[0][0]).toMatchObject({ theme: 'atelier', colorScheme: 'light' });
  });

  it('loads a fresh frame when the code changes, and recovers from a failure', () => {
    const { rerender } = render(<Sandbox src={SRC} title="Counter" code="one" />);
    const first = frame();
    fromFrame(first, { type: 'error', message: 'boom' });
    expect(screen.queryByTitle('Counter')).toBeNull();

    rerender(<Sandbox src={SRC} title="Counter" code="two" />);
    const second = frame();
    const post = spyOnPost(second);
    fromFrame(second, { type: 'hello' });

    expect(post.mock.calls[0][0]).toMatchObject({ type: 'run', code: 'two' });
  });

  it('keeps the frame when a parent re-renders with equal props', () => {
    const { rerender } = render(<Sandbox src={SRC} title="Counter" code="one" props={{ a: 1 }} />);
    const before = frame();
    rerender(<Sandbox src={SRC} title="Counter" code="one" props={{ a: 1 }} />);
    expect(frame()).toBe(before);
  });
});
