import { useMemo } from 'react';
import { normalizePickerText, pickerAlphabet, SearchPicker } from './SearchPicker.jsx';

const unitLabels = {
  placeholder: 'Digite o nome da unidade',
  hint: 'Digite o nome da unidade ou da unidade superior.',
  list: 'Unidades em ordem alfabética',
  show: 'Mostrar lista de unidades',
  hide: 'Recolher lista de unidades',
  empty: 'Nenhuma unidade encontrada.',
  count: count => count + (count === 1 ? ' unidade encontrada' : ' unidades encontradas'),
};

function unitOptions(units, originalUnits) {
  const byId = new Map(units.map(unit => [unit.id, unit]));
  const counts = new Map();
  const options = units.map(unit => {
    const name = unit.name || 'Nome pendente';
    const parent = byId.get(unit.parentUnitId)?.name || unit.parentName || '';
    const key = JSON.stringify([normalizePickerText(name), normalizePickerText(parent)]);
    counts.set(key, (counts.get(key) || 0) + 1);
    return { unit, name, parent, key };
  });

  return options.map(({ unit, name, parent, key }) => {
    const duplicate = counts.get(key) > 1
      ? unit.sourceRow ? `linha ${unit.sourceRow} do modelo` : `unidade criada (${unit.order + 1})`
      : '';
    const context = [parent || unit.documentGroup, duplicate].filter(Boolean).join(' · ');
    return {
      id: unit.id,
      name,
      parent,
      context,
      removed: unit.removed,
      search: normalizePickerText([name, parent, unit.documentGroup, originalUnits.get(unit.id)?.name, duplicate].filter(Boolean).join(' ')),
    };
  }).sort((a, b) => pickerAlphabet.compare(a.name, b.name)
    || pickerAlphabet.compare(a.parent, b.parent)
    || pickerAlphabet.compare(a.id, b.id));
}

export function UnitPicker({ id, units, originalUnits, selectedId, changedIds, onlyChanged, onSelect }) {
  const sorted = useMemo(() => unitOptions(units, originalUnits), [units, originalUnits]);
  const options = sorted.map(option => {
    const changed = changedIds.has(option.id);
    const status = option.removed ? 'Retirada' : changed ? 'Alterada' : '';
    return {
      ...option,
      visible: !onlyChanged || changed,
      description: [option.context, status].filter(Boolean).join(' · '),
      selectedLabel: [(option.removed ? '[Retirada] ' : '') + option.name, option.context].filter(Boolean).join(' · '),
    };
  });
  return <SearchPicker id={id} options={options} selectedId={selectedId} onSelect={onSelect} labels={unitLabels} />;
}
