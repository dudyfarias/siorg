import { catalogue } from './calculator.mjs';
import { activeGroups } from './data/simulator-bases.mjs';

const levels = (group, category) => catalogue.groups[group].filter(row => row.level <= 17 || (group === 'CCESP' && category === 1));
const standardCodes = group => [1, 2].flatMap(category => levels(group, category).map(row =>
  `${group} ${category}.${String(row.level).padStart(2, '0')}`));

export function positionCodesFor(base, currentCode) {
  const codes = base?.positionCodes || activeGroups(base || {}).flatMap(standardCodes);
  if (base?.organizationKind) {
    const additional = base.positions.map(position => position.code).filter(code => !codes.includes(code));
    return [...new Set([...codes, ...additional])];
  }
  return currentCode && !codes.includes(currentCode) ? [...codes, currentCode] : codes;
}
