import { describe, expect, it } from 'vitest';
import { nextIndex, typeAheadIndex } from '../src/lib/select-nav';

/**
 * The custom select replaces the browser's menu, so its keyboard behaviour has to be right
 * without a browser to check it in. Wrapping at both ends matters: a list that stops dead at the
 * last option feels broken when every native menu in the OS wraps.
 */
describe('select keyboard arithmetic', () => {
  it('opens onto the first option, then wraps in both directions', () => {
    expect(nextIndex(-1, 'ArrowDown', 4)).toBe(0);
    expect(nextIndex(3, 'ArrowDown', 4)).toBe(0);
    expect(nextIndex(0, 'ArrowUp', 4)).toBe(3);
    expect(nextIndex(-1, 'ArrowUp', 4)).toBe(3);
  });

  it('jumps to the ends', () => {
    expect(nextIndex(2, 'Home', 5)).toBe(0);
    expect(nextIndex(2, 'End', 5)).toBe(4);
  });

  it('reports -1 for Escape and for an empty list', () => {
    expect(nextIndex(2, 'Escape', 5)).toBe(-1);
    expect(nextIndex(0, 'ArrowDown', 0)).toBe(-1);
  });

  it('leaves the index alone for keys it does not handle', () => {
    expect(nextIndex(2, 'a', 5)).toBe(2);
    expect(nextIndex(2, 'Tab', 5)).toBe(2);
  });

  it('finds the next option starting with a letter, wrapping around', () => {
    const options = ['Agent', 'Developer', 'Agency', 'Other'];
    expect(typeAheadIndex(options, 'a', 1)).toBe(2); // Agency, not Agent
    expect(typeAheadIndex(options, 'D', -1)).toBe(1);
    expect(typeAheadIndex(options, 'z', 0)).toBe(-1);
  });
});
