import { useState } from 'react';
import { SiorgShell } from './SiorgShell.jsx';
import { normalizePickerText, pickerAlphabet, SearchPicker } from './SearchPicker.jsx';
import { timelineCategories, timelines } from './data/timeline-catalog.mjs';
import './timeline.css';

const organizations = timelineCategories.flatMap(category =>
  category.organizations.map(({ id, acronym, name }) => ({
    id,
    name,
    description: [acronym, category.label].filter(Boolean).join(' · '),
    selectedLabel: acronym ? `${name} (${acronym})` : name,
    search: normalizePickerText(`${name} ${acronym} ${category.label}`),
  })),
).sort((a, b) => pickerAlphabet.compare(a.name, b.name) || pickerAlphabet.compare(a.id, b.id));

const organizationLabels = {
  placeholder: 'Digite o nome ou a sigla',
  hint: `Digite o nome ou a sigla. ${timelines.size} órgãos e entidades disponíveis.`,
  list: 'Órgãos e entidades em ordem alfabética',
  show: 'Mostrar lista de órgãos e entidades',
  hide: 'Recolher lista de órgãos e entidades',
  empty: 'Nenhum órgão ou entidade encontrado.',
  count: count => count + (count === 1 ? ' opção encontrada' : ' opções encontradas'),
};

function formatDate(value, short = false) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return 'Data em conferência';
  const [year, month, day] = value.split('-');
  const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
  return short ? `${day} ${months[Number(month) - 1]} ${year}` : `${day}/${month}/${year}`;
}

function DateValue({ value, short = false }) {
  return value ? <time dateTime={value}>{formatDate(value, short)}</time> : <span>Data em conferência</span>;
}

function Sources({ act }) {
  return <div className="timeline-sources" aria-label={`Fontes de ${act.title}`}>
    {act.sources?.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
      {source.label}<i className="fa" aria-hidden="true">{String.fromCodePoint(0xf35d)}</i><span className="sr-only"> — abre em nova aba</span>
    </a>)}
  </div>;
}

function Publication({ act }) {
  return <>
    {act.publicationDate && <p className="timeline-publication">{act.republicationDate ? 'Publicação original em' : 'Publicado em'} <DateValue value={act.publicationDate} /></p>}
    {act.republicationDate && <p className="timeline-publication">Republicado em <DateValue value={act.republicationDate} /></p>}
  </>;
}

function ActStatus({ act }) {
  return act.statusLabel || act.statusDetail ? <p className="timeline-status-detail">{act.statusLabel && <strong>{act.statusLabel}</strong>}{act.statusDetail}</p> : null;
}

function RelatedAct({ act, heading = 'h4' }) {
  const Heading = heading;
  return <li className="timeline-related-act" id={act.id}>
    <p className="timeline-relation">{act.relationLabel || 'Ato relacionado'}</p>
    <Heading>{act.title}</Heading>
    <p className="timeline-related-date">Data do ato: <DateValue value={act.actDate} /></p>
    <Publication act={act} />
    <p>{act.summary}</p>
    <ActStatus act={act} />
    <Sources act={act} />
  </li>;
}

function TimelineAct({ group, expanded, onToggle }) {
  const related = group.related || [];
  return <li className="timeline-item">
    <div className="timeline-date"><span>Data do ato</span><DateValue value={group.actDate} short /></div>
    <article className="timeline-act" aria-labelledby={`title-${group.id}`}>
      <h3 id={`title-${group.id}`}>{group.title}</h3>
      <Publication act={group} />
      {group.summary && <p>{group.summary}</p>}
      <ActStatus act={group} />
      <Sources act={group} />
      {related.length > 0 && <details className="timeline-related" open={expanded} onToggle={event => onToggle(event.currentTarget.open)}>
        <summary>{related.length === 1 ? '1 ato relacionado' : `${related.length} atos relacionados`}{' '}<span className="timeline-related-summary">Resoluções e alterações vinculadas</span></summary>
        <ol>{related.map(act => <RelatedAct act={act} key={act.id} />)}</ol>
      </details>}
    </article>
  </li>;
}

export function TimelineApp() {
  const [order, setOrder] = useState('oldest');
  const [expanded, setExpanded] = useState({});
  const [organization, setOrganization] = useState('sggd');
  const data = timelines.get(organization);
  const groups = [...data.groups].sort((a, b) => {
    const comparison = (a.actDate || a.publicationDate).localeCompare(b.actDate || b.publicationDate)
      || a.publicationDate.localeCompare(b.publicationDate)
      || a.title.localeCompare(b.title, 'pt-BR');
    return order === 'oldest' ? comparison : -comparison;
  });
  const linked = data.groups.filter(group => group.related?.length);
  const allExpanded = linked.length > 0 && linked.every(group => expanded[group.id]);
  const totalRelated = data.groups.reduce((count, group) => count + (group.related?.length || 0), 0);
  const primaryLabel = organization === 'sggd' ? 'decreto' : 'ato';

  return <SiorgShell currentSection="estruturas" contentId="novas-estruturas"><div className="timeline-page">
    <div className="timeline-page-heading"><h1>Novas estruturas</h1><span className="prototype-tag">{import.meta.env.DEV ? 'Protótipo local' : 'Protótipo para avaliação'}</span></div>
    <p className="timeline-intro">Selecione o órgão ou a entidade para consultar os atos que modificaram sua estrutura.</p>

    <div className="timeline-selection">
      <label htmlFor="timeline-organization">Órgão ou entidade</label>
      <SearchPicker id="timeline-organization" options={organizations} selectedId={organization}
        labels={organizationLabels} onSelect={id => {
          if (id === organization) return;
          setOrganization(id);
          setExpanded({});
        }} />
    </div>

    <section className="timeline-history" aria-labelledby="timeline-organization-title">
      <div className="timeline-section-heading"><h2 id="timeline-organization-title">{data.organization.name}</h2><p>As datas do ato e da publicação são exibidas separadamente.{linked.length > 0 && ' Abra os atos relacionados para ver as alterações de cada etapa.'}</p></div>
      <div className="timeline-toolbar">
        <p role="status">{groups.length} {primaryLabel}{groups.length !== 1 && 's'}{totalRelated > 0 ? ` · ${totalRelated} atos relacionados` : ''}</p>
        <div className="timeline-controls">
          <label htmlFor="timeline-order">Ordenar por<select id="timeline-order" value={order} onChange={event => setOrder(event.target.value)}><option value="oldest">Mais antigos primeiro</option><option value="newest">Mais recentes primeiro</option></select></label>
          {linked.length > 0 && <button type="button" className="timeline-expand" onClick={() => setExpanded(Object.fromEntries(linked.map(group => [group.id, !allExpanded])))}>{allExpanded ? 'Recolher atos relacionados' : 'Expandir atos relacionados'}</button>}
        </div>
      </div>
      <ol className="timeline-list" aria-label={`Linha do tempo: ${data.organization.acronym || data.organization.name}, ${order === 'oldest' ? 'mais antigos primeiro' : 'mais recentes primeiro'}`}>
        {groups.map(group => <TimelineAct group={group} key={group.id} expanded={!!expanded[group.id]} onToggle={open => setExpanded(previous => previous[group.id] === open ? previous : {...previous, [group.id]:open})} />)}
      </ol>
    </section>

    {data.complementaryActs?.length > 0 && <section className="timeline-complementary" aria-labelledby="timeline-general-title"><h2 id="timeline-general-title">Regra geral relacionada</h2><p>Este ato trata da gestão de cargos e funções e se aplica a mais de uma etapa da estrutura.</p><ol>{data.complementaryActs.map(act => <RelatedAct key={act.id} act={act} heading="h3" />)}</ol></section>}

    <details className="timeline-about"><summary>Sobre este levantamento</summary><p>{data.coverageNotice}</p><p>Fontes oficiais consultadas em {formatDate(data.checkedAt)}.{data.inventoryUrl && <> A seleção de atos parte da página <a href={data.inventoryUrl}>Novas Estruturas do SIORG</a>.</>} As relações e os resumos seguem para revisão da área técnica.</p><p>A ausência de uma indicação de revogação não confirma a vigência integral de um ato. Para consultar o texto e seus efeitos, abra a fonte oficial.</p></details>
  </div></SiorgShell>;
}
