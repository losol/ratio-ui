import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Shelf, useShelfSurface, type ShelfItem, type ShelfPoint, type ShelfVia } from '../src/shelf';

// The surface sits at 100,100–300,300 on screen; jsdom lays nothing out.
const BOX = { left: 100, top: 100, right: 300, bottom: 300, width: 200, height: 200, x: 100, y: 100 };

function Bench({ onDrop }: { onDrop: (item: ShelfItem, point: ShelfPoint) => boolean | void }) {
  const { surfaceProps, over } = useShelfSurface({ onDrop });
  return (
    <div
      {...surfaceProps}
      data-testid="bench"
      ref={(el) => {
        surfaceProps.ref(el);
        if (el) el.getBoundingClientRect = () => ({ ...BOX, toJSON: () => BOX }) as DOMRect;
      }}
    >
      {over && <span data-testid="over">{`${over.item.id} ${over.point.x},${over.point.y}`}</span>}
    </div>
  );
}

function setup(onDrop: (item: ShelfItem, point: ShelfPoint) => boolean | void = () => {}) {
  const onAdd = vi.fn<(item: ShelfItem, via: ShelfVia) => void>();
  const drop = vi.fn(onDrop);
  render(
    <>
      <Shelf aria-label="Parts" onAdd={onAdd} labels={{ cancelled: (item) => `${item.name} put back.` }}>
        <Shelf.Group title="Sources">
          <Shelf.Tile id="battery" name="Battery" />
          <Shelf.Tile id="motor" name="Motor" locked="Unlocks in Two lamps" />
        </Shelf.Group>
      </Shelf>
      <Bench onDrop={drop} />
    </>,
  );
  return { onAdd, onDrop: drop, battery: screen.getByRole('button', { name: 'Battery' }) };
}

const pointer = { pointerId: 1, button: 0, isPrimary: true };
const live = () => document.querySelector('[aria-live="polite"]')?.textContent?.trim();

afterEach(cleanup);

describe('Shelf', () => {
  it('adds a tapped tile, via "tap"', () => {
    const { onAdd, battery } = setup();
    fireEvent.click(battery, { detail: 1 });
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledWith({ id: 'battery', name: 'Battery' }, 'tap');
    expect(live()).toBe('Battery added.');
  });

  it('adds with Enter and Space, via "keyboard", and ignores the click a key leaves behind', () => {
    const { onAdd, battery } = setup();
    fireEvent.keyDown(battery, { key: 'Enter' });
    fireEvent.click(battery, { detail: 0 });
    fireEvent.keyDown(battery, { key: ' ' });
    expect(onAdd).toHaveBeenCalledTimes(2);
    expect(onAdd.mock.calls.map(([, via]) => via)).toEqual(['keyboard', 'keyboard']);
  });

  it('does not add a locked tile, and says why', () => {
    const { onAdd, onDrop } = setup();
    const motor = screen.getByRole('button', { name: /Motor/ });
    expect(motor.getAttribute('aria-disabled')).toBe('true');
    expect(document.getElementById(motor.getAttribute('aria-describedby')!)?.textContent).toBe('Unlocks in Two lamps');
    fireEvent.click(motor, { detail: 1 });
    fireEvent.keyDown(motor, { key: 'Enter' });
    fireEvent.pointerDown(motor, { ...pointer, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 150, clientY: 150 });
    fireEvent.pointerUp(window, { ...pointer, clientX: 150, clientY: 150 });
    expect(onAdd).not.toHaveBeenCalled();
    expect(onDrop).not.toHaveBeenCalled();
    expect(live()).toBe('Motor is locked. Unlocks in Two lamps');
  });

  it('drops a dragged tile on a surface at its own point, then reports it via "drag"', () => {
    const { onAdd, onDrop, battery } = setup();
    fireEvent.pointerDown(battery, { ...pointer, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 150, clientY: 170 });
    expect(document.querySelector('.shelf-ghost')).not.toBeNull();
    expect(screen.getByTestId('bench').hasAttribute('data-shelf-over')).toBe(true);
    expect(screen.getByTestId('over').textContent).toBe('battery 50,70');
    fireEvent.pointerUp(window, { ...pointer, clientX: 160, clientY: 180 });
    expect(onDrop).toHaveBeenCalledWith({ id: 'battery', name: 'Battery' }, { x: 60, y: 80 });
    expect(onAdd).toHaveBeenCalledOnce();
    expect(onAdd).toHaveBeenCalledWith({ id: 'battery', name: 'Battery' }, 'drag');
    expect(onDrop.mock.invocationCallOrder[0]!).toBeLessThan(onAdd.mock.invocationCallOrder[0]!);
    expect(document.querySelector('.shelf-ghost')).toBeNull();
    expect(screen.queryByTestId('over')).toBeNull();
    // The click a drag leaves behind is not a tap.
    fireEvent.click(battery, { detail: 1 });
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('treats a press that moves under 8px as no drag', () => {
    const { onDrop, battery } = setup();
    fireEvent.pointerDown(battery, { ...pointer, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 14, clientY: 14 });
    expect(document.querySelector('.shelf-ghost')).toBeNull();
    fireEvent.pointerUp(window, { ...pointer, clientX: 14, clientY: 14 });
    expect(onDrop).not.toHaveBeenCalled();
  });

  it('cancels a drop outside any surface', () => {
    const { onAdd, onDrop, battery } = setup();
    fireEvent.pointerDown(battery, { ...pointer, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 150, clientY: 150 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 500, clientY: 500 });
    expect(screen.getByTestId('bench').hasAttribute('data-shelf-over')).toBe(false);
    fireEvent.pointerUp(window, { ...pointer, clientX: 500, clientY: 500 });
    expect(onDrop).not.toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();
    expect(live()).toBe('Battery put back.');
  });

  it('cancels a refused drop', () => {
    const { onAdd, onDrop, battery } = setup(() => false);
    fireEvent.pointerDown(battery, { ...pointer, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 150, clientY: 150 });
    fireEvent.pointerUp(window, { ...pointer, clientX: 150, clientY: 150 });
    expect(onDrop).toHaveBeenCalledOnce();
    expect(onAdd).not.toHaveBeenCalled();
    expect(live()).toBe('Battery put back.');
  });

  it('cancels a drag on Escape', () => {
    const { onAdd, onDrop, battery } = setup();
    fireEvent.pointerDown(battery, { ...pointer, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 150, clientY: 150 });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.querySelector('.shelf-ghost')).toBeNull();
    expect(screen.getByTestId('bench').hasAttribute('data-shelf-over')).toBe(false);
    fireEvent.pointerUp(window, { ...pointer, clientX: 150, clientY: 150 });
    expect(onDrop).not.toHaveBeenCalled();
    expect(onAdd).not.toHaveBeenCalled();
    expect(live()).toBe('Battery put back.');
  });

  it('follows one pointer at a time', () => {
    const { onDrop, battery } = setup();
    fireEvent.pointerDown(battery, { ...pointer, clientX: 10, clientY: 10 });
    fireEvent.pointerDown(battery, { ...pointer, pointerId: 2, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { ...pointer, pointerId: 2, clientX: 150, clientY: 150 });
    fireEvent.pointerUp(window, { ...pointer, pointerId: 2, clientX: 150, clientY: 150 });
    expect(onDrop).not.toHaveBeenCalled();
    fireEvent.pointerMove(window, { ...pointer, clientX: 150, clientY: 150 });
    fireEvent.pointerUp(window, { ...pointer, clientX: 150, clientY: 150 });
    expect(onDrop).toHaveBeenCalledOnce();
  });
});
