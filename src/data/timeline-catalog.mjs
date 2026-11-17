import { sggdTimeline } from './sggd-timeline.mjs';
import { reviewedTimelines } from './reviewed-timelines.mjs';

const catalog = [
  { ...sggdTimeline, organization: { ...sggdTimeline.organization, category: 'direta' } },
  ...reviewedTimelines,
];

export const timelines = new Map(catalog.map(timeline => [timeline.organization.id, timeline]));

export const timelineCategories = [
  ['direta', 'Secretarias e órgãos'],
  ['autarquia', 'Autarquias'],
  ['agencia', 'Agências reguladoras'],
].map(([category, label]) => ({
  label,
  organizations: catalog.map(timeline => timeline.organization)
    .filter(organization => organization.category === category)
    .sort((a, b) => (a.acronym || a.name).localeCompare(b.acronym || b.name, 'pt-BR')),
}));
