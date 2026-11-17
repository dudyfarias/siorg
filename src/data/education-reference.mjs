/**
 * Educação: Decreto 70.042/2025, Anexo II (substitui Anexo III do 69.665/2025).
 * Aggregation by species/level preserves command + advisory headcounts without duplication.
 * Source: https://www.al.sp.gov.br/repositorio/legislacao/decreto/2025/decreto-70042-30.10.2025.html
 * Evidence: evidence/orgaos-2026-09-24/educacao-70042-anexo-II-conferencia.json
 * Exact canonical decimal strings; quotas are units, not integer hundredths.
 */
export const educationWholeReference = {
  "version": "educacao-decreto-70042-2025-10-31",
  "nature": "authorized",
  "quantity": "2066",
  "quotas": "4284.85",
  "groups": {
    "CCESP": {
      "quantity": "1246",
      "quotas": "3089.50"
    },
    "FCESP": {
      "quantity": "820",
      "quotas": "1195.35"
    }
  },
  "rows": [
    {
      "group": "CCESP",
      "level": "1",
      "quantity": "60"
    },
    {
      "group": "CCESP",
      "level": "2",
      "quantity": "163"
    },
    {
      "group": "CCESP",
      "level": "3",
      "quantity": "72"
    },
    {
      "group": "CCESP",
      "level": "4",
      "quantity": "64"
    },
    {
      "group": "CCESP",
      "level": "5",
      "quantity": "252"
    },
    {
      "group": "CCESP",
      "level": "6",
      "quantity": "32"
    },
    {
      "group": "CCESP",
      "level": "7",
      "quantity": "222"
    },
    {
      "group": "CCESP",
      "level": "8",
      "quantity": "115"
    },
    {
      "group": "CCESP",
      "level": "9",
      "quantity": "45"
    },
    {
      "group": "CCESP",
      "level": "10",
      "quantity": "40"
    },
    {
      "group": "CCESP",
      "level": "11",
      "quantity": "27"
    },
    {
      "group": "CCESP",
      "level": "12",
      "quantity": "16"
    },
    {
      "group": "CCESP",
      "level": "13",
      "quantity": "77"
    },
    {
      "group": "CCESP",
      "level": "14",
      "quantity": "13"
    },
    {
      "group": "CCESP",
      "level": "15",
      "quantity": "32"
    },
    {
      "group": "CCESP",
      "level": "16",
      "quantity": "4"
    },
    {
      "group": "CCESP",
      "level": "17",
      "quantity": "11"
    },
    {
      "group": "CCESP",
      "level": "18",
      "quantity": "1"
    },
    {
      "group": "FCESP",
      "level": "1",
      "quantity": "6"
    },
    {
      "group": "FCESP",
      "level": "2",
      "quantity": "16"
    },
    {
      "group": "FCESP",
      "level": "3",
      "quantity": "2"
    },
    {
      "group": "FCESP",
      "level": "4",
      "quantity": "3"
    },
    {
      "group": "FCESP",
      "level": "5",
      "quantity": "509"
    },
    {
      "group": "FCESP",
      "level": "6",
      "quantity": "3"
    },
    {
      "group": "FCESP",
      "level": "7",
      "quantity": "116"
    },
    {
      "group": "FCESP",
      "level": "8",
      "quantity": "58"
    },
    {
      "group": "FCESP",
      "level": "9",
      "quantity": "1"
    },
    {
      "group": "FCESP",
      "level": "10",
      "quantity": "5"
    },
    {
      "group": "FCESP",
      "level": "11",
      "quantity": "4"
    },
    {
      "group": "FCESP",
      "level": "12",
      "quantity": "36"
    },
    {
      "group": "FCESP",
      "level": "13",
      "quantity": "29"
    },
    {
      "group": "FCESP",
      "level": "14",
      "quantity": "32"
    }
  ]
};

/**
 * URE Bauru: 70.042/2025 Annex I, positions explicitly listed for the URE.
 * Inclusion of five services and their sections is grounded in SEDUC 108/2025,
 * art. 1, VII, and art. 133; Bauru is listed in 69.665/2025 Annex VI.
 * SEDUC art. 1 calls SEFISC a Setor; arts. 149–150 and the 70.042 decree
 * call it Seção. This dataset retains the decree name and counts one position.
 * DOE: https://www.doe.sp.gov.br/executivo/secretaria-da-educacao/resolucao-seduc-n-108-de-28-de-julho-de-2025-20250728112312201228596
 * Only CCESP/FCESP positions are included, not school or other-career staff.
 */
export const educationBauruReference = {
  "version": "educacao-decreto-70042-2025-10-31",
  "nature": "authorized",
  "quantity": "16",
  "quotas": "31.30",
  "groups": {
    "CCESP": {
      "quantity": "10",
      "quotas": "22.00"
    },
    "FCESP": {
      "quantity": "6",
      "quotas": "9.30"
    }
  },
  "rows": [
    {
      "group": "CCESP",
      "level": "1",
      "quantity": "1"
    },
    {
      "group": "CCESP",
      "level": "2",
      "quantity": "1"
    },
    {
      "group": "CCESP",
      "level": "5",
      "quantity": "3"
    },
    {
      "group": "CCESP",
      "level": "8",
      "quantity": "5"
    },
    {
      "group": "FCESP",
      "level": "5",
      "quantity": "5"
    },
    {
      "group": "FCESP",
      "level": "14",
      "quantity": "1"
    }
  ]
};

export const educationBauruSourceRows = [
  {
    "unit": "UNIDADE REGIONAL DE ENSINO DE BAURU",
    "quantity": "1",
    "denomination": "COORDENADOR GERAL - DIRIGENTE REGIONAL DE ENSINO",
    "code": "FCESP 1.14 (1)"
  },
  {
    "unit": "",
    "quantity": "1",
    "denomination": "ASSISTENTE II",
    "code": "CCESP 2.02"
  },
  {
    "unit": "",
    "quantity": "1",
    "denomination": "ASSISTENTE I",
    "code": "CCESP 2.01"
  },
  {
    "unit": "SERVIÇO DE INFORMAÇÕES EDUCACIONAIS E TECNOLOGIA",
    "quantity": "1",
    "denomination": "CHEFE DE SERVIÇO",
    "code": "CCESP 1.08"
  },
  {
    "unit": "SEÇÃO DE TECNOLOGIA",
    "quantity": "1",
    "denomination": "CHEFE DE SEÇÃO",
    "code": "FCESP 1.05"
  },
  {
    "unit": "SERVIÇO DE GESTÃO DA REDE ESCOLAR",
    "quantity": "1",
    "denomination": "CHEFE DE SERVIÇO",
    "code": "CCESP 1.08"
  },
  {
    "unit": "SEÇÃO DE MATRÍCULA",
    "quantity": "1",
    "denomination": "CHEFE DE SEÇÃO",
    "code": "CCESP 1.05"
  },
  {
    "unit": "SEÇÃO DE VIDA ESCOLAR",
    "quantity": "1",
    "denomination": "CHEFE DE SEÇÃO",
    "code": "FCESP 1.05"
  },
  {
    "unit": "SERVIÇO DE PESSOAS",
    "quantity": "1",
    "denomination": "CHEFE DE SERVIÇO",
    "code": "CCESP 1.08"
  },
  {
    "unit": "SEÇÃO DE ADMINISTRAÇÃO DE PESSOAL",
    "quantity": "1",
    "denomination": "CHEFE DE SEÇÃO",
    "code": "FCESP 1.05"
  },
  {
    "unit": "SEÇÃO DE FREQUÊNCIA E PAGAMENTO",
    "quantity": "1",
    "denomination": "CHEFE DE SEÇÃO",
    "code": "FCESP 1.05"
  },
  {
    "unit": "SERVIÇO DE ADMINISTRAÇÃO E FINANÇAS",
    "quantity": "1",
    "denomination": "CHEFE DE SERVIÇO",
    "code": "CCESP 1.08"
  },
  {
    "unit": "SEÇÃO DE COMPRAS E SERVIÇOS",
    "quantity": "1",
    "denomination": "CHEFE DE SEÇÃO",
    "code": "FCESP 1.05"
  },
  {
    "unit": "SEÇÃO DE FINANÇAS",
    "quantity": "1",
    "denomination": "CHEFE DE SEÇÃO",
    "code": "CCESP 1.05"
  },
  {
    "unit": "SERVIÇO DE OBRAS E MANUTENÇÃO ESCOLAR",
    "quantity": "1",
    "denomination": "CHEFE DE SERVIÇO",
    "code": "CCESP 1.08"
  },
  {
    "unit": "SEÇÃO DE FISCALIZAÇÃO",
    "quantity": "1",
    "denomination": "CHEFE DE SEÇÃO",
    "code": "CCESP 1.05"
  }
];
