/**
 * CSIORS Author Profiles
 * Used for article bylines, author pages, and SEO structured data.
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
  linkedin?: string;
  active: boolean;
  image?: string;
  orcid?: string;
  googleScholar?: string;
  articles?: number;
}

export const authors: Record<string, Author> = {
  'jan-zahorik': {
    id: 'jan-zahorik',
    name: 'Jan Záhořík',
    title: 'Senior Advisor for Africa — Associate Professor',
    titleSk: 'Vedúci poradca pre Afriku — docent',
    bio: 'Africanist and social scientist focusing on the modern and contemporary history and politics of Ethiopia and the Horn of Africa, as well as nationalism, identity, conflicts, inequalities, European-African relations, migration, and security in the West African Sahel. Head of the Center of African Studies at the Department of Middle Eastern Studies, University of West Bohemia in Pilsen. Associate professor and head of the MA program Development and Globalization (est. 2023). Has lectured at ca. 20 universities in Europe, USA, and Africa. Received rector\'s Award for contribution to internationalization in research (2023). Extensive collaboration with universities in Ethiopia, Kenya, Sudan, Nigeria, Senegal, Tanzania, Rwanda, and Libya.',
    bioSk: 'Afrikanista a sociálny vedec so zameraním na modernú históriu a politiku Etiópie a Afrického rohu.',
    specialization: ['Horn of Africa', 'Ethiopian Politics', 'Nationalism & Identity', 'Conflict Analysis', 'Migration', 'Sahel Security'],
    regions: ['Ethiopia', 'Sudan', 'Somalia', 'Horn of Africa', 'Nigeria', 'Senegal', 'Sahel'],
    affiliation: 'University of West Bohemia / CSIORS',
    linkedin: 'https://www.linkedin.com/in/jan-z%C3%A1ho%C5%99%C3%ADk-638a2719/',
    active: true,
  },
  'issam-khoury': {
    id: 'issam-khoury',
    name: 'Issam Khoury',
    title: 'Former MENA Analyst — Syria Specialist',
    titleSk: 'Bývalý analytik MENA — špecialista na Sýriu',
    bio: 'Seasoned journalist and political activist from Syria with over two decades of writing and research for major news outlets across MENA. Author of three books in Arabic and "Assad and ME" in English. Over 700 reports on politics, governance, Islamic groups, human rights, culture, and arts. First journalist to report on the Syrian revolution from within the country. Expert in social media who has trained journalists across the Arab world. Founded the Center for Environmental and Social Development (501(c)(3), New York, 2017). Holds a Master of Geopolitics (2008), CUNY J-school fellow (2015), and MBA from Quantic School of Business (2022).',
    bioSk: 'Skúsený novinár a politický aktivista zo Sýrie s viac ako dvadsaťročnou praxou.',
    specialization: ['Syria', 'Political Economy', 'Sectarian Politics', 'MENA Region', 'Human Rights'],
    regions: ['Syria', 'Lebanon', 'MENA', 'Iraq'],
    affiliation: 'CSIORS (former)',
    linkedin: '',
    active: false,
  },
  'tomas-krizan': {
    id: 'tomas-krizan',
    name: 'Tomáš Križan',
    title: 'CEO, Co-Founder & Researcher',
    titleSk: 'Riaditeľ, spoluzakladateľ a výskumník',
    bio: 'CEO and co-founder of CSIORS. Researcher specializing in integration of refugees in Turkey and radicalization. Oversees the institute\'s field survey network and data infrastructure across 37 countries.',
    bioSk: 'Generálny riaditeľ a spoluzakladateľ CSIORS. Výskumník špecializujúci sa na integráciu utečencov v Turecku a radikalizáciu.',
    specialization: ['Refugee Integration', 'Radicalization', 'Field Survey Networks', 'Data Systems'],
    regions: ['Turkey', 'Lebanon', 'Syria'],
    affiliation: 'CSIORS',
    linkedin: 'https://www.linkedin.com/in/tomas-krizan-csiors/',
    active: true,
  },
  'filip-benes': {
    id: 'filip-benes',
    name: 'Filip Beneš',
    title: 'Research Fellow — Libya & Shiite Studies',
    titleSk: 'Výskumný pracovník — Líbya a šiitské štúdie',
    bio: 'Research fellow specializing in the development of the current fragmentation of Libya and the specifics of the Shiite clergy. His analysis covers the Libyan civil conflict, Sahel instability, and trans-Mediterranean migration routes.',
    bioSk: 'Výskumný pracovník špecializujúci sa na fragmentáciu Líbye a šiitské duchovenstvo.',
    specialization: ['Libya Fragmentation', 'Shiite Clergy', 'North Africa', 'Mediterranean Migration'],
    regions: ['Libya', 'Sahel', 'Morocco', 'Tunisia'],
    affiliation: 'CSIORS',
    linkedin: 'https://www.linkedin.com/in/filip-bene%C5%A1-381266270/',
    active: true,
  },
  'fuat-emir-sefkatli': {
    id: 'fuat-emir-sefkatli',
    name: 'Fuat Emir Şefkatli',
    title: 'North African Studies Researcher — Associate Research Fellow',
    titleSk: 'Výskumník severoafrických štúdií',
    bio: 'Researcher specializing in non-state armed groups (NSAGs) in Libya and the Sahel region, as well as disarmament, demobilization, and reintegration (DDR) processes. Holds a master\'s from Plymouth University (International Relations and Global Security) and is pursuing a PhD in Strategy and Security Studies at the National Defense University in Turkey. Serves as North African Studies Researcher at ORSAM (Center for Middle Eastern Studies). Featured in Al Jazeera English, Daily China, Russia Today, Middle East Monitor, and TRT World.',
    bioSk: 'Výskumník špecializujúci sa na neštátne ozbrojené skupiny v Líbyi a regióne Sahel.',
    specialization: ['Non-State Armed Groups', 'Libya', 'Sahel', 'DDR Processes', 'Security Studies'],
    regions: ['Libya', 'Sahel', 'Turkey'],
    affiliation: 'ORSAM / CSIORS',
    active: true,
  },
  'saywan-ibrahim': {
    id: 'saywan-ibrahim',
    name: 'Saywan Ibrahim',
    title: 'Contributing Analyst — Kurdistan Region',
    titleSk: 'Prispievajúci analytik — Kurdistan',
    bio: 'Contributing analyst focusing on the Kurdistan Region of Iraq, Kurdish political dynamics, and cross-border security issues.',
    bioSk: 'Prispievajúci analytik so zameraním na Kurdistanský región Iraku.',
    specialization: ['Kurdistan', 'Iraqi Politics', 'Cross-border Security'],
    regions: ['Iraq', 'Turkey'],
    affiliation: 'CSIORS',
    active: true,
  },
  'david-aworawo': {
    id: 'david-aworawo',
    name: 'David Aworawo',
    title: 'Professor of International Relations & Strategic Studies',
    titleSk: 'Profesor medzinárodných vzťahov a strategických štúdií',
    bio: 'Professor of International Relations and Strategic Studies at the University of Lagos. Led the Department of History and Strategic Studies (2020–2023). Award-winning doctoral thesis on "Diplomacy and the Development of Equatorial Guinea, 1900–1990." Published extensively on African politics in international journals. Presented at Cambridge, Harvard, and UT Austin. Instructor at the Foreign Service Academy and Nigerian Army College of Logistics.',
    bioSk: 'Profesor medzinárodných vzťahov a strategických štúdií na Univerzite v Lagose.',
    specialization: ['International Relations', 'African Politics', 'Strategic Studies', 'Diplomacy'],
    regions: ['Nigeria', 'West Africa', 'Equatorial Guinea'],
    affiliation: 'University of Lagos / CSIORS',
    active: true,
  },
  'joshua-bolarinwa': {
    id: 'joshua-bolarinwa',
    name: 'Joshua Olusegun Bolarinwa',
    title: 'Associate Professor — Head of Security & Strategic Studies',
    titleSk: 'Docent — vedúci oddelenia bezpečnostných a strategických štúdií',
    bio: 'Associate Professor and Head of the Division of Security and Strategic Studies at the Nigerian Institute of International Affairs (NIIA) in Lagos. Friedrich Ebert Stiftung and International Peace Academy scholar. Visiting scholar at University of Calgary. Editor of Nigerian Forum (2011–2016) and Nigerian Journal of International Affairs. Consults for ECOWAS and member of the AU Net4peace Strategy Group.',
    bioSk: 'Docent a vedúci oddelenia bezpečnostných štúdií na Nigérijskom inštitúte medzinárodných záležitostí.',
    specialization: ['Peace & Conflict', 'Security Studies', 'ECOWAS', 'African Union'],
    regions: ['Nigeria', 'West Africa', 'Sahel'],
    affiliation: 'NIIA Lagos / CSIORS',
    active: true,
  },
  'weldeabrha-niguse': {
    id: 'weldeabrha-niguse',
    name: 'Weldeabrha Niguse Gebreslassie',
    title: 'Contributing Analyst — Ethiopia',
    titleSk: 'Prispievajúci analytik — Etiópia',
    bio: 'Contributing analyst specializing in Ethiopian domestic politics, religious dynamics, and the Horn of Africa.',
    bioSk: 'Prispievajúci analytik so zameraním na etiópsku vnútornú politiku.',
    specialization: ['Ethiopian Politics', 'Religious Dynamics', 'Horn of Africa'],
    regions: ['Ethiopia', 'Horn of Africa'],
    affiliation: 'CSIORS',
    active: true,
  },
  'sofyan-essarraoui': {
    id: 'sofyan-essarraoui',
    name: 'Sofyan Essarraoui',
    title: 'PhD Candidate — Migration Researcher',
    titleSk: 'Doktorand — výskumník migrácie',
    bio: 'PhD candidate at the Sociology Department, Eotvos Lorand University, Budapest. Research focuses on international migration, particularly migration within and beyond Africa. Thesis: "Sub-Saharan Africans in Morocco: Inclusion Policies and Daily Experiences."',
    bioSk: 'Doktorand na katedre sociológie, Univerzita Eotvosa Loranda v Budapešti. Výskum zameraný na medzinárodnú migráciu.',
    specialization: ['International Migration', 'African Migration', 'Morocco', 'Inclusion Policies'],
    regions: ['Morocco', 'North Africa', 'Sub-Saharan Africa'],
    affiliation: 'Eotvos Lorand University / CSIORS',
    active: true,
  },
};

export function getAuthorByName(name: string): Author | undefined {
  const normalized = name.toLowerCase().trim().replace(/[""]/g, '');
  for (const author of Object.values(authors)) {
    if (author.name.toLowerCase() === normalized) return author;
  }
  // Partial match without diacritics
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
