import React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act, getByRole, getAllByRole, isInaccessible } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Breadcrumb, Breadcrumbs } from '../src/core/Breadcrumbs/Breadcrumbs';

function RouterLink(props: React.ComponentProps<'a'>) {
  return <a {...props} data-router-link="true" />;
}

describe('Breadcrumbs SSR and hydration', () => {
  it('keeps every collection item after hydration', async () => {
    const tree = <Breadcrumbs>
      <Breadcrumb href="/">Hjem</Breadcrumb>
      <Breadcrumb href="/school">Skole og utdanning</Breadcrumb>
      <Breadcrumb href="/numbers">Regning</Breadcrumb>
    </Breadcrumbs>;
    const container = document.createElement('div');
    document.body.append(container);
    container.innerHTML = renderToString(tree);
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      expect(getAllByRole(container, 'listitem')).toHaveLength(3);
      await act(async () => { root = hydrateRoot(container, tree); });
      expect(getAllByRole(container, 'listitem')).toHaveLength(3);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
  for (const LinkComponent of [undefined, RouterLink]) {
    for (const linkedCurrentPage of [false, true]) {
      it(`preserves items and semantics with ${LinkComponent ? 'router' : 'native'} links and a ${linkedCurrentPage ? 'linked' : 'text'} current page`, async () => {
        const tree = (
          <Breadcrumbs LinkComponent={LinkComponent} aria-label="Brødsmuler">
            <Breadcrumb href="/nb">Hjem</Breadcrumb>
            <Breadcrumb href="/nb/tjenester#school">Skole og utdanning</Breadcrumb>
            <Breadcrumb href={linkedCurrentPage ? '/nb/universitetet#numbers' : undefined}>Regning</Breadcrumb>
          </Breadcrumbs>
        );
        const container = document.createElement('div');
        document.body.append(container);
        container.innerHTML = renderToString(tree);
        const check = () => {
          const list = getByRole(container, 'list', { name: 'Brødsmuler' });
          const items = getAllByRole(list, 'listitem');
          expect(items.map(item => item.textContent?.replaceAll('/', '').trim())).toEqual([
            'Hjem', 'Skole og utdanning', 'Regning',
          ]);
          expect(getByRole(list, 'link', { name: 'Skole og utdanning' }).getAttribute('href')).toBe('/nb/tjenester#school');
          const separators = [...list.querySelectorAll('[aria-hidden="true"]')];
          expect(separators).toHaveLength(2);
          for (const separator of separators) {
            expect(separator.textContent?.trim()).toBe('/');
            expect(separator.closest('li')).not.toBeNull();
            expect(separator.closest('template')).toBeNull();
            expect(getComputedStyle(separator).display).not.toBe('none');
            expect(isInaccessible(separator)).toBe(true);
          }
          expect(list.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
          expect(items[2]?.querySelector('[aria-current="page"]')?.textContent).toBe('Regning');
          expect(items[2]?.getAttribute('data-current')).toBe('true');
          if (LinkComponent) {
            expect(list.querySelectorAll('[data-router-link]')).toHaveLength(linkedCurrentPage ? 3 : 2);
          }
        };
        const hydrationErrors: unknown[] = [];
        let root: ReturnType<typeof hydrateRoot> | undefined;
        try {
          check();
          await act(async () => { root = hydrateRoot(container, tree, { onRecoverableError: error => hydrationErrors.push(error) }); });
          check();
          expect(hydrationErrors).toEqual([]);
        } finally {
          await act(async () => root?.unmount());
          container.remove();
        }
      });
    }
  }
});
