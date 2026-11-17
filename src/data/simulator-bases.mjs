import { sggdStructure } from './sggd-structure.mjs';
import { publishedStructures } from './published-structures.mjs';
import { agencyStructures } from './agency-structures.mjs';

function freezeTree(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freezeTree);
    Object.freeze(value);
  }
  return value;
}

export const simulatorBases = Object.freeze([sggdStructure, ...freezeTree(agencyStructures), ...freezeTree(publishedStructures)]);
export const getSimulatorBase = id => simulatorBases.find(base => base.organizationId === id);
export const isSecretariat = base => base?.organizationId === 'sggd';
export const organizationAcronym = base => base.acronym || base.organizationId.toUpperCase();
export const annexLabel = base => isSecretariat(base) || base?.sourceAnnex === 'II' ? 'Anexo II' : 'Quadro demonstrativo';
export const scopeLabel = base => isSecretariat(base) ? 'Secretaria inteira' : organizationAcronym(base);
export const activeGroups = base => base.groups || ['CCESP', 'FCESP'];
