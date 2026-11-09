/**
 * Keyboard arithmetic for the custom select, kept out of the component so it can be tested
 * without a DOM. Returns the index that should become active, or -1 to close the list.
 */
export function nextIndex(current, key, count) {
  if (count <= 0) return -1;
  switch (key) {
    case 'ArrowDown':
      return current < 0 ? 0 : (current + 1) % count;
    case 'ArrowUp':
      return current < 0 ? count - 1 : (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    case 'Escape':
      return -1;
    default:
      return current;
  }
}

/** Index of the first option starting with the typed letter, from `current + 1` and wrapping. */
export function typeAheadIndex(options, char, current) {
  if (!char) return -1;
  const needle = char.toLowerCase();
  for (let step = 1; step <= options.length; step += 1) {
    const index = (Math.max(current, 0) + step) % options.length;
    if (String(options[index]).toLowerCase().startsWith(needle)) return index;
  }
  return -1;
}
