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
  'tomas-krizan': {
    id: 'tomas-krizan',
    name: 'Tomáš Križan',
    title: 'CEO & Founder — Director of Research Operations',
    titleSk: 'Generálny riaditeľ a zakladateľ — riaditeľ výskumných operácií',
    bio: 'Founder and CEO of the Czech-Slovak Institute of Oriental Studies. Built CSIORS from the ground up into a data-driven research institute covering 37 countries across the Middle East, North Africa, and the Horn of Africa. Personally designed and deployed the institute\'s anonymous field survey network and early warning system infrastructure. His own research focuses on the integration of Syrian refugees in Turkey, radicalization processes, and the intersection of migration with food security. Leads the institute\'s strategic partnerships, including the collaboration with BRIDGE Research & Innovation in Addis Ababa. Author of multiple policy analyses on refugee integration and field conditions in Lebanon, Syria, and Turkey.',
    bioSk: 'Zakladateľ a generálny riaditeľ Česko-slovenského inštitútu orientálnych štúdií. Vybudoval CSIORS od základov ako dátami riadený výskumný inštitút pokrývajúci 37 krajín.',
    specialization: ['Refugee Integration', 'Radicalization', 'Field Survey Networks', 'Early Warning Systems', 'Migration & Food Security'],
    regions: ['Turkey', 'Lebanon', 'Syria', 'MENA'],
    affiliation: 'CSIORS',
    linkedin: 'https://www.linkedin.com/in/tomas-krizan-csiors/',
    active: true,
    image: '/team/tomas-krizan.jpg',
  },
  'jan-zahorik': {
    id: 'jan-zahorik',
    name: 'Jan Záhořík',
    title: 'Senior Research Advisor — Associate Professor, Africa Studies',
    titleSk: 'Vedúci výskumný poradca — docent, africké štúdie',
    bio: 'Leading Africanist and social scientist, and the most prolific expert contributor at CSIORS with over 30 published analyses. Focuses on the modern and contemporary history and politics of Ethiopia and the Horn of Africa, as well as nationalism, identity, conflicts, inequalities, European-African relations, migration, and security in the West African Sahel. Head of the Center of African Studies at the Department of Middle Eastern Studies, University of West Bohemia in Pilsen. Associate professor and head of the MA program Development and Globalization (est. 2023). Has lectured at approximately 20 universities across Europe, the USA, and Africa. Received rector\'s Award for contribution to internationalization in research (2023). Author of the CSIORS publication "Ethiopia: Facing Multiple Crises" (2024). Extensive collaboration with universities in Ethiopia, Kenya, Sudan, Nigeria, Senegal, Tanzania, Rwanda, and Libya.',
    bioSk: 'Popredný afrikanista a sociálny vedec, najproduktívnejší expertný prispievateľ CSIORS s viac ako 30 publikovanými analýzami.',
    specialization: ['Horn of Africa', 'Ethiopian Politics', 'Nationalism & Identity', 'Conflict Analysis', 'Migration', 'Sahel Security'],
    regions: ['Ethiopia', 'Sudan', 'Somalia', 'Horn of Africa', 'Nigeria', 'Senegal', 'Sahel'],
    affiliation: 'CSIORS',
    linkedin: 'https://www.linkedin.com/in/jan-z%C3%A1ho%C5%99%C3%ADk-638a2719/',
    active: true,
    image: '/team/jan-zahorik.jpg',
  },
  'filip-benes': {
    id: 'filip-benes',
    name: 'Filip Beneš',
    title: 'Research Fellow — Libya & North Africa',
    titleSk: 'Výskumný pracovník — Líbya a Severná Afrika',
    bio: 'Research fellow at CSIORS specializing in the fragmentation of Libya, the specifics of the Shiite clergy, and North African political dynamics. Author of the multi-part "Never-ending Libyan Crisis" series for CSIORS, covering the Libyan civil conflict from its origins through its current state. His analysis spans Sahel instability, trans-Mediterranean migration routes, and the role of non-state actors in North Africa.',
    bioSk: 'Výskumný pracovník CSIORS špecializujúci sa na fragmentáciu Líbye a politickú dynamiku Severnej Afriky.',
    specialization: ['Libya Fragmentation', 'Shiite Clergy', 'North Africa', 'Mediterranean Migration'],
    regions: ['Libya', 'Sahel', 'Morocco', 'Tunisia'],
    affiliation: 'CSIORS',
    linkedin: 'https://www.linkedin.com/in/filip-bene%C5%A1-381266270/',
    active: true,
    image: '/team/filip-benes.jpg',
  },
  'fuat-emir-sefkatli': {
    id: 'fuat-emir-sefkatli',
    name: 'Fuat Emir Şefkatli',
    title: 'Associate Research Fellow — Non-State Armed Groups',
    titleSk: 'Pridružený výskumný pracovník — Neštátne ozbrojené skupiny',
    bio: 'Researcher specializing in non-state armed groups (NSAGs) in Libya and the Sahel region, as well as disarmament, demobilization, and reintegration (DDR) processes. Author of CSIORS analyses on the Turkistan Islamic Party, ISIS in the Sahel, and Moscow\'s influence on African security. Holds a master\'s from Plymouth University (International Relations and Global Security) and is pursuing a PhD in Strategy and Security Studies at the National Defense University in Turkey. Serves as North African Studies Researcher at ORSAM (Center for Middle Eastern Studies). Featured in Al Jazeera English, Daily China, Russia Today, Middle East Monitor, and TRT World.',
    bioSk: 'Výskumník špecializujúci sa na neštátne ozbrojené skupiny v Líbyi a regióne Sahel.',
    specialization: ['Non-State Armed Groups', 'Libya', 'Sahel', 'DDR Processes', 'Security Studies', 'Terrorism'],
    regions: ['Libya', 'Sahel', 'Turkey', 'Syria'],
    affiliation: 'ORSAM / CSIORS',
    active: true,
    image: '/team/fuat-emir-sefkatli.jpg',
  },
  'saywan-ibrahim': {
    id: 'saywan-ibrahim',
    name: 'Saywan Ibrahim',
    title: 'Contributing Analyst — Kurdistan & Iraq',
    titleSk: 'Prispievajúci analytik — Kurdistan a Irak',
    bio: 'Contributing analyst focusing on the Kurdistan Region of Iraq, Kurdish political dynamics, peacebuilding, and cross-border security issues. Author of the CSIORS analysis "In Ninewa, Peace Holds but Trust Remains Fragile," examining post-conflict reconciliation and human security in northern Iraq. Brings ground-level perspective on reconciliation processes and ethno-sectarian dynamics in the region.',
    bioSk: 'Prispievajúci analytik so zameraním na Kurdistanský región Iraku a budovanie mieru.',
    specialization: ['Kurdistan', 'Iraqi Politics', 'Peacebuilding', 'Post-Conflict Reconciliation', 'Human Security'],
    regions: ['Iraq', 'Turkey', 'Ninewa'],
    affiliation: 'CSIORS',
    active: true,
    image: '/team/saywan-ibrahim.jpg',
  },
  'david-aworawo': {
    id: 'david-aworawo',
    name: 'David Aworawo',
    title: 'Professor of International Relations & Strategic Studies',
    titleSk: 'Profesor medzinárodných vzťahov a strategických štúdií',
    bio: 'Professor of International Relations and Strategic Studies at the University of Lagos. Led the Department of History and Strategic Studies (2020–2023). Award-winning doctoral thesis on "Diplomacy and the Development of Equatorial Guinea, 1900–1990." Published extensively on African politics in international journals. Presented at Cambridge, Harvard, and UT Austin. Instructor at the Foreign Service Academy and Nigerian Army College of Logistics. Contributing author on Nigerian governance and West African security for CSIORS.',
    bioSk: 'Profesor medzinárodných vzťahov a strategických štúdií na Univerzite v Lagose.',
    specialization: ['International Relations', 'African Politics', 'Strategic Studies', 'Diplomacy', 'Nigerian Governance'],
    regions: ['Nigeria', 'West Africa', 'Equatorial Guinea'],
    affiliation: 'University of Lagos / CSIORS',
    active: true,
    image: '/team/david-aworawo.jpg',
  },
  'joshua-bolarinwa': {
    id: 'joshua-bolarinwa',
    name: 'Joshua Olusegun Bolarinwa',
    title: 'Associate Professor — Security & Strategic Studies, NIIA',
    titleSk: 'Docent — bezpečnostné a strategické štúdie, NIIA',
    bio: 'Associate Professor and Head of the Division of Security and Strategic Studies at the Nigerian Institute of International Affairs (NIIA) in Lagos. Friedrich Ebert Stiftung and International Peace Academy scholar. Visiting scholar at University of Calgary. Editor of Nigerian Forum (2011–2016) and Nigerian Journal of International Affairs. Consults for ECOWAS and member of the AU Net4peace Strategy Group. Provides CSIORS with expert analysis on peacekeeping operations and regional security architectures in West Africa.',
    bioSk: 'Docent a vedúci oddelenia bezpečnostných štúdií na Nigérijskom inštitúte medzinárodných záležitostí.',
    specialization: ['Peace & Conflict', 'Security Studies', 'ECOWAS', 'African Union', 'Peacekeeping'],
    regions: ['Nigeria', 'West Africa', 'Sahel'],
    affiliation: 'NIIA Lagos / CSIORS',
    active: true,
    image: '/team/joshua-bolarinwa.jpg',
  },
  'weldeabrha-niguse': {
    id: 'weldeabrha-niguse',
    name: 'Weldeabrha Niguse Gebreslassie',
    title: 'Contributing Analyst — Ethiopia & Horn of Africa',
    titleSk: 'Prispievajúci analytik — Etiópia a Africký roh',
    bio: 'Contributing analyst specializing in Ethiopian domestic politics, religious dynamics, and the Horn of Africa. Co-author with Jan Záhořík on "Ethiopia\'s New Religious Wars: Pentecostal Power, Orthodox Resistance, and Abiy\'s Theological Politics" for CSIORS, examining the intersection of religious power and state politics in the Tigray context. Brings on-the-ground Ethiopian perspective to CSIORS analysis.',
    bioSk: 'Prispievajúci analytik so zameraním na etiópsku vnútornú politiku a náboženské dynamiky.',
    specialization: ['Ethiopian Politics', 'Religious Dynamics', 'Horn of Africa', 'Tigray', 'Orthodox-Pentecostal Relations'],
    regions: ['Ethiopia', 'Horn of Africa', 'Eritrea'],
    affiliation: 'CSIORS',
    active: true,
    image: '/team/weldeabrha-niguse.jpg',
  },
  'sofyan-essarraoui': {
    id: 'sofyan-essarraoui',
    name: 'Sofyan Essarraoui',
    title: 'PhD Candidate — Migration Researcher',
    titleSk: 'Doktorand — výskumník migrácie',
    bio: 'PhD candidate at the Sociology Department, Eotvos Lorand University, Budapest. Research focuses on international migration, particularly migration within and beyond Africa. Thesis: "Sub-Saharan Africans in Morocco: Inclusion Policies and Daily Experiences." Brings academic migration expertise to CSIORS field data analysis across North and Sub-Saharan Africa.',
    bioSk: 'Doktorand na katedre sociológie, Univerzita Eotvosa Loranda v Budapešti. Výskum zameraný na medzinárodnú migráciu.',
    specialization: ['International Migration', 'African Migration', 'Morocco', 'Inclusion Policies'],
    regions: ['Morocco', 'North Africa', 'Sub-Saharan Africa'],
    affiliation: 'Eotvos Lorand University / CSIORS',
    active: true,
    image: '/team/sofyan-essarraoui.jpg',
  },
  'adesuwa-erediauwa': {
    id: 'adesuwa-erediauwa',
    name: 'Adesuwa Erediauwa',
    title: 'Contributing Analyst — Nigeria & Energy Security',
    titleSk: 'Prispievajúca analytička — Nigéria a energetická bezpečnosť',
    bio: 'Contributing analyst for CSIORS focusing on Nigerian governance, energy security, and oil sector reform. Co-author with Jan Záhořík on "Sabotage and Sovereignty: Oil Theft and the Long Road to Reform in Nigeria," examining how oil theft erodes Nigerian sovereignty and the prospects for reform under the Dangote Refinery era.',
    bioSk: 'Prispievajúca analytička CSIORS so zameraním na nigérijskú správu vecí verejných a energetickú bezpečnosť.',
    specialization: ['Nigeria', 'Energy Security', 'Oil Governance', 'Economic Reform'],
    regions: ['Nigeria', 'West Africa'],
    affiliation: 'CSIORS',
    active: true,
    image: '/team/adesuwa-erediauwa.jpg',
  },
  'issam-khoury': {
    id: 'issam-khoury',
    name: 'Issam Khoury',
    title: 'Former MENA Analyst — Syria Specialist',
    titleSk: 'Bývalý analytik MENA — špecialista na Sýriu',
    bio: 'Former CSIORS analyst. Seasoned journalist and political activist from Syria with over two decades of writing and research for major news outlets across MENA. Author of three books in Arabic and "Assad and ME" in English. Over 700 reports on politics, governance, Islamic groups, human rights, culture, and arts. First journalist to report on the Syrian revolution from within the country. Expert in social media who has trained journalists across the Arab world. Founded the Center for Environmental and Social Development (501(c)(3), New York, 2017). Holds a Master of Geopolitics (2008), CUNY J-school fellow (2015), and MBA from Quantic School of Business (2022). Contributed 63 analyses to CSIORS during his tenure.',
    bioSk: 'Bývalý analytik CSIORS. Skúsený novinár a politický aktivista zo Sýrie s viac ako dvadsaťročnou praxou.',
    specialization: ['Syria', 'Political Economy', 'Sectarian Politics', 'MENA Region', 'Human Rights'],
    regions: ['Syria', 'Lebanon', 'MENA', 'Iraq'],
    affiliation: 'CSIORS (former)',
    linkedin: '',
    active: false,
    image: '/team/issam-khoury.jpg',
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
