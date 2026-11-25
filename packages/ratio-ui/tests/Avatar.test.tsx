import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { Avatar } from '../src/core/Avatar';

afterEach(cleanup);

it('is an image named after the person, with their initials', () => {
  const view = render(<Avatar name="Kari Nordmann" />);
  const avatar = view.getByRole('img', { name: 'Kari Nordmann' });
  expect(avatar.textContent).toBe('kn');
});

it('is hidden from assistive technology when decorative, label and all', () => {
  const view = render(<Avatar name="Kari Nordmann" aria-label="Profile" src="/kari.jpg" decorative />);
  expect(view.queryByRole('img')).toBeNull();
  const avatar = view.container.firstElementChild as HTMLElement;
  expect(avatar.getAttribute('aria-hidden')).toBe('true');
  expect(avatar.hasAttribute('aria-label')).toBe(false);
  expect(avatar.querySelector('img')?.getAttribute('src')).toBe('/kari.jpg');
});

it('shows the initials when the picture does not load', () => {
  const view = render(<Avatar name="Kari Nordmann" src="/missing.jpg" />);
  const img = view.container.querySelector('img') as HTMLImageElement;
  fireEvent.error(img);
  expect(view.container.querySelector('img')).toBeNull();
  expect(view.getByRole('img', { name: 'Kari Nordmann' }).textContent).toBe('kn');
});

it('renders on the server, picture first', () => {
  const html = renderToStaticMarkup(<Avatar name="Ola" src="/ola.jpg" decorative />);
  expect(html).toContain('aria-hidden="true"');
  expect(html).toContain('src="/ola.jpg"');
});
