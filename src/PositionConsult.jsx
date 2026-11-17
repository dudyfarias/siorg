import { useMemo, useState } from 'react';
import { formatCents, formatInteger } from './calculator.mjs';
import { activeGroups } from './data/simulator-bases.mjs';
import { normalizePickerText } from './SearchPicker.jsx';

const PAGE_SIZE = 30;
const display = (value, format) => value == null ? 'Pendente' : format(value);
const matches = (text, query) => normalizePickerText(query).split(/\s+/).every(term => text.includes(term));

export function PositionConsult({ base, proposal, positionResults, onEditUnit }) {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState('');
  const [positionQuery, setPositionQuery] = useState('');
  const [unitQuery, setUnitQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const items = useMemo(() => {
    if (!open) return [];
    const units = new Map(proposal.units.map(unit => [unit.id, unit]));
    const originals = new Map(base.positions.map(row => [row.id, row]));
    return proposal.positions.flatMap(position => {
      const unit = units.get(position.unitId);
      if (!unit) return [];
      const original = originals.get(position.id);
      const current = positionResults.get(position.id);
      const codes = [position.code, original?.code].filter(Boolean);
      const positionText = normalizePickerText([position.denomination, ...codes, ...codes.map(code => code.replace(/\s+/g, ''))].join(' '));
      const unitText = normalizePickerText([unit.name, original?.unitName].filter(Boolean).join(' '));
      if ((group && ![original?.group, position.group].includes(group))
        || !matches(positionText, positionQuery) || !matches(unitText, unitQuery)) return [];
      const context = units.get(unit.parentUnitId)?.name || unit.parentName || unit.documentGroup;
      return [{ position, unit, original, current, context }];
    });
  }, [open, base, proposal, positionResults, group, positionQuery, unitQuery]);

  function updateFilter(setValue, value) {
    setValue(value);
    setLimit(PAGE_SIZE);
  }

  return <details className="card sim-position-consult" id="consulta-cargos"
    onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Consultar cargos e funções do órgão</summary>
    {open && <div className="sim-consult-body">
      <p>Compare os quantitativos e as cotas da base com os da proposta. Use os filtros para localizar uma unidade e abrir a edição.</p>
      <div className="sim-consult-filters" role="group" aria-label="Filtros de cargos e funções">
        <label>Espécie
          <select value={group} onChange={event => updateFilter(setGroup, event.target.value)}>
            <option value="">Todas</option>
            {activeGroups(base).map(item => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label>Código ou nome do cargo
          <input type="search" value={positionQuery} onChange={event => updateFilter(setPositionQuery, event.target.value)} />
        </label>
        <label>Nome da unidade
          <input type="search" value={unitQuery} onChange={event => updateFilter(setUnitQuery, event.target.value)} />
        </label>
      </div>
      <p className="sim-consult-count" role="status">
        {items.length === 0 ? 'Nenhum cargo ou função corresponde aos filtros.'
          : `Mostrando ${Math.min(limit, items.length)} de ${items.length} linhas.`}
      </p>
      {items.length > 0 && <div className="sim-consult-scroll" role="region" aria-label="Cargos e funções encontrados" tabIndex={0}>
        <table>
          <thead><tr>
            <th scope="col">Unidade</th>
            <th scope="col">Cargo ou função</th>
            <th scope="col">Qtd. na base</th>
            <th scope="col">Cotas na base</th>
            <th scope="col">Qtd. proposta</th>
            <th scope="col">Cotas propostas</th>
          </tr></thead>
          <tbody>{items.slice(0, limit).map(({ position, unit, original, current, context }) => {
            const originalQuota = original ? String(BigInt(original.quantity) * BigInt(original.coefficientCents)) : '0';
            return <tr key={position.id}>
              <td>
                <button className="text-button" type="button" onClick={() => onEditUnit(unit.id)}
                  aria-label={`Abrir unidade ${unit.name}${context ? ` · ${context}` : ''}`}>{unit.name}</button>
                {context && <small>{context}</small>}
                {unit.removed && <small>Retirada da proposta</small>}
              </td>
              <th scope="row">{position.denomination}<small>{original?.code && original.code !== position.code
                ? `${original.code} → ${position.code}` : position.code}</small></th>
              <td>{formatInteger(original?.quantity || '0')}</td>
              <td>{formatCents(originalQuota)}</td>
              <td>{display(current?.quantity, formatInteger)}</td>
              <td>{display(current?.quotaCents, formatCents)}</td>
            </tr>;
          })}</tbody>
        </table>
      </div>}
      {items.length > limit && <button type="button" className="button secondary"
        onClick={() => setLimit(value => value + PAGE_SIZE)}>Mostrar mais</button>}
    </div>}
  </details>;
}
