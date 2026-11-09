"use client";

import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { nextIndex, typeAheadIndex } from '../lib/select-nav';

/**
 * A select that looks like the rest of this site instead of the operating system.
 *
 * The native element is still there, invisible and 100% of the control's size: it carries the
 * `name` the server action reads and the `required` the browser enforces on submit. Everything
 * visible is a button and a listbox, so the browser's own menu never opens.
 *
 * Keyboard: Enter/Space/ArrowDown open, arrows move, Enter picks, Escape closes, Home/End jump,
 * a letter jumps to the next option starting with it. Mouse: click, or hover to preview.
 */
export default function SelectField({
  id,
  name,
  options,
  placeholder = 'Select an option',
  required = false,
  defaultValue = '',
  className = '',
}) {
  const reactId = useId();
  const fieldId = id ?? `select-${reactId}`;
  const listId = `${fieldId}-list`;

  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const typed = useRef({ text: '', at: 0 });

  const selectedIndex = options.indexOf(value);

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
    setOpen(true);
    setActive(selectedIndex >= 0 ? selectedIndex : 0);
  }

  function choose(index) {
    if (index < 0 || index >= options.length) return;
    setValue(options[index]);
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

    if (open && (key === 'Tab')) {
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

    const moved = nextIndex(active, key, options.length);
    if (moved !== active) {
      event.preventDefault();
      setActive(moved);
      return;
    }

    // A single printable character jumps to the next option starting with it.
    if (open && key.length === 1 && /\S/.test(key)) {
      const now = Date.now();
      const previous = now - typed.current.at < 800 ? typed.current.text : '';
      typed.current = { text: previous + key, at: now };

      const index = typeAheadIndex(options, key, active);
      if (index >= 0) {
        event.preventDefault();
        setActive(index);
      }
    }
  }

  const label = value || placeholder;

  return (
    <div className={`cf-select ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        id={fieldId}
        ref={triggerRef}
        className={`cf-trigger ${open ? 'is-open' : ''} ${value ? 'has-value' : ''}`}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-haspopup="listbox"
        aria-required={required || undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        <span className="cf-label">{label}</span>
        <ChevronDown size={16} strokeWidth={2} className="cf-chevron" aria-hidden="true" />
      </button>

      {/* The real control: carries the name and the required check, never visible. */}
      <select
        className="cf-native"
        name={name}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      {open ? (
        <ul className="cf-panel" role="listbox" id={listId} aria-labelledby={fieldId} ref={listRef}>
          {options.map((option, index) => (
            <li
              key={option}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={option === value}
              className={`cf-option ${index === active ? 'is-active' : ''} ${
                option === value ? 'is-selected' : ''
              }`}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(index)}
            >
              <span>{option}</span>
              {option === value ? <Check size={14} strokeWidth={2.6} aria-hidden="true" /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
