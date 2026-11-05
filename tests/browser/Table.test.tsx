import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { Card } from '../../packages/ratio-ui/src/core/Card';
import { Table } from '../../packages/ratio-ui/src/core/Table';
import '../../packages/ratio-ui/src/ratio-ui.css';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.createElement('div');
  host.style.margin = '16px';
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  flushSync(() => root.unmount());
  host.remove();
});

function renderTable(positionedContent = false) {
  flushSync(() => root.render(
    <Card>
      <Table aria-label="Availability">
        <Table.Header>
          <Table.Row>
            {Array.from({ length: 6 }, (_, i) => (
              <Table.HeadCell key={i}>
                <span className="sr-only">lørdag 31. oktober kl. 19:00</span>
                <span aria-hidden="true">19:00</span>
                {positionedContent && <span style={{ position: 'absolute', width: 100 }}>Details</span>}
              </Table.HeadCell>
            ))}
          </Table.Row>
        </Table.Header>
      </Table>
    </Card>,
  ));
  return host.querySelector('table')!.parentElement!;
}

for (const positionedContent of [false, true]) {
  test(`wide table stays inside a mobile Card (${positionedContent ? 'absolute content' : 'sr-only dates'})`, async () => {
    const wrapper = renderTable(positionedContent);
    const documentWidth = document.documentElement.scrollWidth;
    const viewportWidth = window.innerWidth;
    console.info('Table layout:', {
      viewportWidth,
      documentWidth,
      wrapperWidth: wrapper.clientWidth,
      scrollWidth: wrapper.scrollWidth,
    });
    expect([360, 390]).toContain(viewportWidth);
    expect(documentWidth).toBeLessThanOrEqual(viewportWidth);
    expect(wrapper.scrollWidth).toBeGreaterThan(wrapper.clientWidth);
    expect(getComputedStyle(wrapper).overflowX).toBe('auto');

    // The hidden dates still provide the accessible names of the headers.
    for (const header of host.querySelectorAll('th')) {
      await expect.element(header).toHaveAccessibleName(
        positionedContent ? 'lørdag 31. oktober kl. 19:00 Details' : 'lørdag 31. oktober kl. 19:00',
      );
    }
    const hiddenDate = host.querySelector('.sr-only')!;
    expect(getComputedStyle(hiddenDate).position).toBe('absolute');
    expect(hiddenDate.getBoundingClientRect().width).toBe(1);
    expect(getComputedStyle(hiddenDate).display).not.toBe('none');

    wrapper.scrollLeft = wrapper.scrollWidth;
    expect(wrapper.scrollLeft).toBeGreaterThan(0);
    const lastHeader = host.querySelector('th:last-child')!.getBoundingClientRect();
    expect(lastHeader.right).toBeLessThanOrEqual(wrapper.getBoundingClientRect().right + 1);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(viewportWidth);
  });
}

test('a normal compact table still fills its Card without horizontal scrolling', () => {
  flushSync(() => root.render(
    <Card>
      <Table aria-label="People" className="custom-table" id="people">
        <Table.Caption>People</Table.Caption>
        <Table.Header><Table.Row><Table.HeadCell scope="col">Name</Table.HeadCell></Table.Row></Table.Header>
        <Table.Body><Table.Row><Table.Cell>Ada</Table.Cell></Table.Row></Table.Body>
      </Table>
    </Card>,
  ));
  const table = host.querySelector('table')!;
  const wrapper = table.parentElement!;
  expect(page.getByRole('table', { name: 'People' }).elements()).toHaveLength(1);
  expect(table.id).toBe('people');
  expect(table.classList.contains('custom-table')).toBe(true);
  expect(table.getBoundingClientRect().width).toBeCloseTo(wrapper.clientWidth, 0);
  expect(wrapper.scrollWidth).toBe(wrapper.clientWidth);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
});
