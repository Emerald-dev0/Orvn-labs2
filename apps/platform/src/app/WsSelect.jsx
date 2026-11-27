"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './icons';

/**
 * A select that looks like the rest of the workspace instead of the operating system.
 *
 * The native element is still there, invisible and 100% of the control's size: it carries the
 * `name` the server action reads and the `required` the browser enforces on submit. Everything
 * visible is a button and a listbox, so the browser's own menu never opens.
 *
 * Keyboard: Enter/Space/ArrowDown open, arrows move, Enter picks, Escape closes, Home/End jump.
 * Mouse: click to open, click an option to pick.
 */
export default function WsSelect({
  id,
  name,
  options,
  placeholder = 'Select an option',
  required = false,
  defaultValue = '',
  disabled = false,
}) {
  const reactId = useId();
  const fieldId = id ?? `wsselect-${reactId}`;
  const listId = `${fieldId}-list`;

  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);

  const selectedIndex = options.findIndex((option) => option.value === value);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  // Keep the highlighted option in view while arrowing through a long list.
  useEffect(() => {
    if (!open || active < 0) return;
    const node = listRef.current?.children?.[active];
    node?.scrollIntoView?.({ block: 'nearest' });
  }, [open, active]);

  function openList() {
    if (disabled) return;
    setOpen(true);
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function choose(index) {
    if (index < 0 || index >= options.length) return;
    setValue(options[index].value);
    setOpen(false);
    setActive(index);
    triggerRef.current?.focus();
  }

  function onKeyDown(event) {
    const { key } = event;

    if (!open && (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ')) {
      event.preventDefault();
      openList();
      return;
    }

    if (open && (key === 'Enter' || key === ' ')) {
      event.preventDefault();
      choose(active);
      return;
    }

    if (open && key === 'Tab') {
      setOpen(false);
      return;
    }

    if (key === 'Escape') {
      if (open) {
        event.preventDefault();
        setOpen(false);
      }
      return;
    }

    if (key === 'Home' && open) {
      event.preventDefault();
      setActive(0);
      return;
    }

    if (key === 'End' && open) {
      event.preventDefault();
      setActive(options.length - 1);
      return;
    }

    if (open && (key === 'ArrowDown' || key === 'ArrowUp')) {
      event.preventDefault();
      const delta = key === 'ArrowDown' ? 1 : -1;
      setActive((current) => {
        const start = current < 0 ? (delta > 0 ? -1 : options.length) : current;
        return (start + delta + options.length) % options.length;
      });
    }
  }

  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const label = selected ? selected.label : placeholder;

  return (
    <div className="ws-sel" ref={rootRef}>
      <button
        type="button"
        id={fieldId}
        ref={triggerRef}
        className={`ws-sel-trigger ${open ? 'is-open' : ''} ${selected ? 'has-value' : ''}`}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-required={required || undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className="ws-sel-label">{label}</span>
        <Icon name="arrowDown" size={16} className="ws-sel-arrow" aria-hidden="true" />
      </button>

      {/* The real control: carries the name and the required check, never visible. */}
      <select
        className="ws-sel-native"
        name={name}
        required={required}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {open ? (
        <ul className="ws-sel-panel" role="listbox" id={listId} aria-labelledby={fieldId} ref={listRef}>
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={`ws-sel-option ${index === active ? 'is-active' : ''} ${
                option.value === value ? 'is-selected' : ''
              }`}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {option.value === value ? <Icon name="check" size={14} aria-hidden="true" /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}