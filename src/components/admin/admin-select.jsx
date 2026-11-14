"use client";

import { Children, Fragment, isValidElement, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { edgeIndex, enabledIndex, popupPosition, searchIndex } from './admin-select-state.mjs';

function textContent(value) {
  return Children.toArray(value).map(child => isValidElement(child) ? textContent(child.props.children) : String(child ?? '')).join('');
}

function readOptions(children) {
  const result = [];
  Children.forEach(children, child => {
    if (!isValidElement(child)) return;
    if (child.type === Fragment) result.push(...readOptions(child.props.children));
    else if (child.type === 'option') result.push({ value: String(child.props.value ?? textContent(child.props.children)), label: textContent(child.props.children), disabled: !!child.props.disabled });
  });
  return result;
}

/** Single-select control. onChange keeps the existing event.target.value contract. */
export default function AdminSelect({ children, value, defaultValue, onChange, disabled = false, required = false, name, id, form, className = '', onBlur, onFocus, ...aria }) {
  const generatedId = useId();
  const controlId = id || `admin-select-${generatedId}`;
  const listId = `${controlId}-list`;
  const options = readOptions(children);
  const [internalValue, setInternalValue] = useState(() => String(defaultValue ?? options.find(option => !option.disabled)?.value ?? ''));
  const selectedValue = String(value ?? internalValue);
  const selectedIndex = options.findIndex(option => option.value === selectedValue);
  const selected = options[selectedIndex];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [position, setPosition] = useState({});
  const trigger = useRef(null);
  const list = useRef(null);
  const native = useRef(null);
  const search = useRef({ value: '', time: 0 });
  const expanded = open && !disabled;

  const updatePosition = () => {
    if (!trigger.current) return;
    setPosition(popupPosition(trigger.current.getBoundingClientRect(), window.innerWidth, window.innerHeight));
  };
  const show = (last = false) => {
    if (disabled) return;
    updatePosition();
    setActive(selectedIndex >= 0 && !selected?.disabled ? selectedIndex : edgeIndex(options, last));
    search.current = { value: '', time: 0 };
    setOpen(true);
  };
  const choose = index => {
    const option = options[index];
    if (disabled || !option || option.disabled) return;
    if (value === undefined) setInternalValue(option.value);
    if (option.value !== selectedValue) onChange?.({ target: { value: option.value, name, id: controlId }, currentTarget: { value: option.value, name, id: controlId }, type: 'change' });
    setOpen(false);
    trigger.current?.focus();
  };

  useEffect(() => {
    if (!expanded) return;
    const outside = event => {
      if (!trigger.current?.contains(event.target) && !list.current?.contains(event.target)) setOpen(false);
    };
    const reposition = event => { if (!list.current?.contains(event.target)) updatePosition(); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', reposition, true);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updatePosition);
    if (trigger.current) observer?.observe(trigger.current);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', reposition, true);
      observer?.disconnect();
    };
  }, [expanded]);
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  useEffect(() => {
    if (expanded) list.current?.querySelector(`[data-option-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active, expanded]);
  useEffect(() => {
    const owner = native.current?.form;
    const reset = () => { setOpen(false); if (value === undefined) setInternalValue(String(defaultValue ?? options.find(option => !option.disabled)?.value ?? '')); };
    owner?.addEventListener('reset', reset);
    return () => owner?.removeEventListener('reset', reset);
  });

  const keyDown = event => {
    if (disabled) return;
    const key = event.key;
    if (key === 'Tab') { setOpen(false); return; }
    if (key === 'Escape') { if (expanded) { event.preventDefault(); event.stopPropagation(); setOpen(false); } return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      event.preventDefault();
      if (!expanded) show(key === 'ArrowUp' || key === 'End');
      if (key === 'Home' || key === 'End') setActive(edgeIndex(options, key === 'End'));
      else if (expanded) setActive(enabledIndex(options, active, key === 'ArrowDown' ? 1 : -1));
      return;
    }
    if (key === 'Enter' || key === ' ') { event.preventDefault(); if (expanded) choose(active); else show(); return; }
    if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const query = now - search.current.time > 700 ? key : search.current.value + key;
      search.current = { value: query, time: now };
      if (!expanded) { updatePosition(); setOpen(true); }
      const match = searchIndex(options, query, expanded ? active : selectedIndex);
      if (match >= 0) setActive(match);
    }
  };

  return <span className="relative inline-block min-w-0 max-w-full align-middle">
    <button {...aria} id={controlId} ref={trigger} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={expanded} aria-controls={expanded ? listId : undefined} aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined} aria-required={required || undefined} disabled={disabled} onFocus={onFocus} onBlur={onBlur} onKeyDown={keyDown} onClick={() => expanded ? setOpen(false) : show()} className={`flex min-h-10 w-full min-w-0 items-center rounded-md border border-slate-200 bg-white py-1 text-left text-xs text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 sm:min-h-8 ${className}`} style={{ paddingLeft: 10, paddingRight: 36 }}>
      <span className="block min-w-0 truncate">{selected?.label || 'Pilih opsi'}</span><ChevronDown aria-hidden="true" size={14} className={`pointer-events-none absolute right-3 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
    {/* Form/constraint-validation bridge only: never receives pointer or tab focus, never opens a native popup. */}
    <select ref={native} name={name} form={form} value={selectedValue} required={required} disabled={disabled} tabIndex={-1} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0" onChange={event => choose(options.findIndex(option => option.value === event.target.value))} onInvalid={event => { event.preventDefault(); trigger.current?.focus(); show(); }}>
      {options.map((option, index) => <option key={`${option.value}-${index}`} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
    {expanded && createPortal(<div ref={list} id={listId} role="listbox" aria-label={aria['aria-label']} aria-labelledby={aria['aria-labelledby'] || (!aria['aria-label'] ? controlId : undefined)} data-lenis-prevent className="z-[100] overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white p-1 text-xs leading-5 text-slate-800 shadow-lg" style={position}>
      {options.map((option, index) => <div key={`${option.value}-${index}`} id={`${listId}-${index}`} data-option-index={index} role="option" aria-selected={option.value === selectedValue} aria-disabled={option.disabled || undefined} onMouseDown={event => event.preventDefault()} onPointerMove={event => { if (event.pointerType === 'mouse' && !option.disabled) setActive(index); }} onClick={() => choose(index)} className={`flex min-h-10 items-center justify-between gap-3 rounded-md px-2.5 py-1.5 sm:min-h-8 ${option.disabled ? 'cursor-not-allowed text-slate-400' : `cursor-pointer ${index === active ? 'bg-slate-100 text-slate-950' : 'hover:bg-slate-50'}`}`}><span className="min-w-0 break-words">{option.label}</span>{option.value === selectedValue && <Check size={14} aria-hidden="true" className="shrink-0 text-slate-700" />}</div>)}
      {!options.length && <p className="px-2.5 py-2 text-slate-500">Tidak ada opsi.</p>}
    </div>, document.body)}
  </span>;
}
