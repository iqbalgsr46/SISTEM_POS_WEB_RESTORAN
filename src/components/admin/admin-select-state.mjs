export function enabledIndex(options, current, direction) {
  if (!options.length) return -1;
  for (let step = 1; step <= options.length; step++) {
    const index = (current + direction * step + options.length * 2) % options.length;
    if (!options[index].disabled) return index;
  }
  return -1;
}

export function edgeIndex(options, last = false) {
  return enabledIndex(options, last ? 0 : -1, last ? -1 : 1);
}

export function searchIndex(options, query, current) {
  const text = query.toLocaleLowerCase();
  const repeated = text.length > 1 && [...text].every(char => char === text[0]);
  const needle = repeated ? text[0] : text;
  for (let step = 1; step <= options.length; step++) {
    const index = (current + step + options.length) % options.length;
    if (!options[index].disabled && options[index].label.toLocaleLowerCase().startsWith(needle)) return index;
  }
  return -1;
}

export function popupPosition(rect, viewportWidth, viewportHeight) {
  const margin = 8;
  const gap = 4;
  const below = viewportHeight - rect.bottom - gap - margin;
  const above = rect.top - gap - margin;
  const upwards = below < 180 && above > below;
  const maxHeight = Math.max(48, Math.min(280, upwards ? above : below));
  const width = Math.min(Math.max(rect.width, 180), viewportWidth - margin * 2);
  return { position: 'fixed', width, maxHeight, left: Math.max(margin, Math.min(rect.left, viewportWidth - width - margin)), ...(upwards ? { bottom: Math.max(margin, viewportHeight - rect.top + gap) } : { top: Math.max(margin, rect.bottom + gap) }) };
}
