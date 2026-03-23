/**
 * CSIORS Author Profiles
 * Used for homepage expert showcase, article bylines, and SEO structured data.
 */

export interface Author {
  id: string;
  name: string;
  title: string;
  titleSk: string;
  bio: string;
  bioSk: string;
  specialization: string[];
  regions: string[];
  affiliation: string;
  image?: string;
  orcid?: string;
  googleScholar?: string;
  articles?: number; // computed at build time
}

export const authors: Record<string, Author> = {
  'jan-zahorik': {
    id: 'jan-zahorik',
    name: 'Jan Záhořík',
    title: 'Senior Research Fellow & Regional Analyst',
    titleSk: 'Vedúci výskumný pracovník a regionálny analytik',
    bio: 'Jan Záhořík is a senior research fellow specializing in the Horn of Africa and the broader East African region. He holds a PhD in African Studies and has published extensively on Ethiopian politics, Sudanese conflicts, and regional migration dynamics. His fieldwork spans over a decade of engagement across Ethiopia, Sudan, and Somalia.',
    bioSk: 'Jan Záhořík je vedúci výskumný pracovník špecializujúci sa na Africký roh a širší východoafrický región. Je držiteľom titulu PhD v odbore africké štúdiá a rozsiahlo publikoval o etiópskej politike, sudánskych konfliktoch a regionálnej migračnej dynamike.',
    specialization: ['Horn of Africa', 'Ethiopian Politics', 'Conflict Analysis', 'Migration Dynamics'],
    regions: ['Ethiopia', 'Sudan', 'Somalia', 'Horn of Africa'],
    affiliation: 'University of West Bohemia / CSIORS',
  },
  'issam-khoury': {
    id: 'issam-khoury',
    name: 'Issam Khoury',
    title: 'MENA Policy Analyst & Syria Specialist',
    titleSk: 'Analytik politík MENA a špecialista na Sýriu',
    bio: 'Issam Khoury is a policy analyst covering Syria, Lebanon, and the wider MENA region. His research focuses on political economy, sectarian dynamics, and the impact of conflict on civilian populations. He has contributed over 60 analytical pieces to CSIORS since 2022.',
    bioSk: 'Issam Khoury je politický analytik pokrývajúci Sýriu, Libanon a širší región MENA. Jeho výskum sa zameriava na politickú ekonómiu, sektársku dynamiku a dopad konfliktov na civilné obyvateľstvo.',
    specialization: ['Syria', 'Political Economy', 'Sectarian Politics', 'MENA Region'],
    regions: ['Syria', 'Lebanon', 'MENA', 'Iraq'],
    affiliation: 'CSIORS',
  },
  'tomas-krizan': {
    id: 'tomas-krizan',
    name: 'Tomáš Križan',
    title: 'Director & Co-Founder',
    titleSk: 'Riaditeľ a spoluzakladateľ',
    bio: 'Tomáš Križan is the co-founder and director of CSIORS. He oversees the institute\'s field survey network and data infrastructure. His research interests include refugee integration, food security indicators, and technology-driven humanitarian intelligence.',
    bioSk: 'Tomáš Križan je spoluzakladateľ a riaditeľ CSIORS. Riadi terénnu prieskumnú sieť a dátovú infraštruktúru inštitútu. Jeho výskumné záujmy zahŕňajú integráciu utečencov, ukazovatele potravinovej bezpečnosti a humanitárnu spravodajskú činnosť.',
    specialization: ['Field Survey Networks', 'Refugee Integration', 'Food Security', 'Data Systems'],
    regions: ['Turkey', 'Lebanon', 'Syria'],
    affiliation: 'CSIORS',
  },
  'filip-benes': {
    id: 'filip-benes',
    name: 'Filip Beneš',
    title: 'Research Fellow — North Africa',
    titleSk: 'Výskumný pracovník — Severná Afrika',
    bio: 'Filip Beneš is a research fellow specializing in Libyan politics and North African security dynamics. His analysis covers the Libyan civil conflict, Sahel instability, and trans-Mediterranean migration routes.',
    bioSk: 'Filip Beneš je výskumný pracovník špecializujúci sa na líbyjskú politiku a bezpečnostnú dynamiku Severnej Afriky.',
    specialization: ['Libya', 'North Africa', 'Mediterranean Migration', 'Security Studies'],
    regions: ['Libya', 'Sahel', 'Morocco', 'Tunisia'],
    affiliation: 'CSIORS',
  },
  'fuat-emir-sefkatli': {
    id: 'fuat-emir-sefkatli',
    name: 'Fuat Emir Şefkatli',
    title: 'Turkey & Kurdish Affairs Analyst',
    titleSk: 'Analytik pre Turecko a kurdské záležitosti',
    bio: 'Fuat Emir Şefkatli covers Turkish domestic politics, Kurdish affairs, and Turkey\'s role as a transit and host country for refugees. His reporting draws on primary sources in Turkish and Arabic.',
    bioSk: 'Fuat Emir Şefkatli pokrýva tureckú vnútornú politiku, kurdské záležitosti a úlohu Turecka ako tranzitnej a hostiteľskej krajiny pre utečencov.',
    specialization: ['Turkish Politics', 'Kurdish Affairs', 'Refugee Policy'],
    regions: ['Turkey', 'Syria', 'Iraq'],
    affiliation: 'CSIORS',
  },
  'saywan-ibrahim': {
    id: 'saywan-ibrahim',
    name: 'Saywan Ibrahim',
    title: 'Contributing Analyst — Kurdistan Region',
    titleSk: 'Prispievajúci analytik — Kurdistan',
    bio: 'Saywan Ibrahim is a contributing analyst focusing on the Kurdistan Region of Iraq, Kurdish political dynamics, and cross-border security issues.',
    bioSk: 'Saywan Ibrahim je prispievajúci analytik so zameraním na Kurdistanský región Iraku a kurdskú politickú dynamiku.',
    specialization: ['Kurdistan', 'Iraqi Politics', 'Cross-border Security'],
    regions: ['Iraq', 'Turkey'],
    affiliation: 'CSIORS',
  },
};

export function getAuthorByName(name: string): Author | undefined {
  const normalized = name.toLowerCase().trim().replace(/[""]/g, '');
  for (const author of Object.values(authors)) {
    if (author.name.toLowerCase() === normalized) return author;
  }
  // Partial match (e.g. "Jan Zahorik" without diacritics)
  for (const author of Object.values(authors)) {
    const plain = author.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    if (plain === normalized) return author;
  }
  return undefined;
}

export function getAuthorSlug(name: string): string {
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
