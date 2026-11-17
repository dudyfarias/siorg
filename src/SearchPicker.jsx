import { useEffect, useRef, useState } from 'react';
import './search-picker.css';

export const pickerAlphabet = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true });
export const normalizePickerText = text => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();

export function SearchPicker({ id, options, selectedId, onSelect, labels }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const input = useRef(null);
  const list = useRef(null);
  const selected = options.find(option => option.id === selectedId);
  const terms = normalizePickerText(query || '').split(/\s+/).filter(Boolean);
  const matches = options.filter(option =>
    option.visible !== false && terms.every(term => option.search.includes(term)));
  const activeIndex = matches.findIndex(option => option.id === activeId);
  const optionId = itemId => `${id}-option-${itemId}`;
  const activeOptionId = open && activeIndex >= 0 ? optionId(activeId) : undefined;
  const selectedLabel = selected?.selectedLabel || selected?.name || '';

  useEffect(() => {
    if (!activeOptionId) return;
    const option = document.getElementById(activeOptionId);
    const menu = list.current;
    if (!menu || !option) return;
    const row = option.getBoundingClientRect();
    const viewport = menu.getBoundingClientRect();
    if (row.top < viewport.top) menu.scrollTop -= viewport.top - row.top;
    else if (row.bottom > viewport.bottom) menu.scrollTop += row.bottom - viewport.bottom;
  }, [activeOptionId]);

  function close() {
    setOpen(false);
    setQuery(null);
    setActiveId(null);
  }

  function choose(itemId) {
    close();
    onSelect(itemId);
  }

  function onKeyDown(event) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const next = activeIndex < 0
        ? (direction === 1 ? 0 : matches.length - 1)
        : (activeIndex + direction + matches.length) % matches.length;
      setActiveId(matches[next]?.id || null);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      close();
    } else if (event.key === 'Enter' && open) {
      event.preventDefault();
      const match = matches[activeIndex] || (matches.length === 1 ? matches[0] : null);
      if (match) choose(match.id);
    }
  }

  return <div className="search-picker">
    <div className="search-picker-control">
      <input id={id} ref={input} type="text" role="combobox"
        aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`}
        aria-activedescendant={activeOptionId} aria-describedby={`${id}-hint`}
        autoComplete="off" placeholder={labels.placeholder}
        value={query ?? selectedLabel}
        onFocus={event => event.currentTarget.select()}
        onClick={event => { if (!open) { event.currentTarget.select(); setOpen(true); } }}
        onChange={event => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveId(null);
          if (list.current) list.current.scrollTop = 0;
        }}
        onBlur={close} onKeyDown={onKeyDown} />
      <button type="button" className="search-picker-toggle" tabIndex={-1}
        aria-label={open ? labels.hide : labels.show}
        aria-expanded={open} aria-controls={`${id}-list`}
        onMouseDown={event => event.preventDefault()}
        onClick={() => {
          input.current?.focus();
          if (open) close();
          else { input.current?.select(); setOpen(true); }
        }}>
        <i className="fa" aria-hidden="true">{String.fromCodePoint(0xf078)}</i>
      </button>
      <div className="search-picker-popup" hidden={!open}>
        <ul id={`${id}-list`} ref={list} role="listbox" aria-label={labels.list}>
          {open && matches.map(option => {
            return <li id={optionId(option.id)} key={option.id} role="option"
              aria-selected={option.id === selectedId} data-active={option.id === activeId}
              onMouseDown={event => event.preventDefault()} onClick={() => choose(option.id)}>
              <span>{option.name}</span>
              {option.description && <small>{option.description}</small>}
            </li>;
          })}
        </ul>
        {open && <p role="status" className={matches.length ? 'sr-only' : 'search-picker-empty'}>
          {matches.length ? labels.count(matches.length) : labels.empty}
        </p>}
      </div>
    </div>
    <small id={`${id}-hint`}>{labels.hint}</small>
  </div>;
}
