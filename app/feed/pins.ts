export type Board = 'About me' | 'Data science' | 'AI systems' | 'Products';

export type FeedPin = {
  id: string;
  number: string;
  board: Board;
  title: string;
  caption: string;
  story: string;
  decision: string;
  href: string;
  action: string;
  art: 'injury' | 'family' | 'birthday' | 'tend' | 'economics' | 'cases' | 'bio' | 'career' | 'spark' | 'reading';
  alt: string;
  project: string;
};

export const feedPins: FeedPin[] = [
  {
    id: 'pokeread',
    number: '01',
    board: 'Products',
    project: 'PokéRead',
    title: 'Reading with Eevee',
    caption: 'Build a word one sound at a time in a Pokémon phonics lesson.',
    story: 'I built PokéRead for two young readers. In this lesson, Squirtle introduces the sh sound. The reader joins sh, i and p beside Eevee to spell “ship,” then checks the result.',
    decision: 'The lesson is one stop on a 74-lesson reading path. Children can practice sounds, read illustrated stories and revisit words at their own pace. Each reader’s progress stays on the device.',
    href: '/projects/pokeread',
    action: 'Read about PokéRead',
    art: 'reading',
    alt: 'Eevee’s phonics lesson asks a reader to build the word ship.',
  },
  {
    id: '49ers',
    number: '02',
    board: 'Data science',
    project: 'The injury question',
    title: 'Do the 49ers really lose more time to injury?',
    caption: 'I compared nine seasons of injuries across all 32 NFL teams.',
    story: 'It’s easy to remember the seasons when everyone seemed hurt. I wanted a fair comparison, so I took each team’s adjusted games lost and compared it with the NFL average that same season.',
    decision: 'Across 2017–2025, San Francisco averaged about 40% above the league in time lost to injury. Whether deep playoff runs explain that is a separate question. Pick another team and see how its history compares.',
    href: '/sports/49ers-injuries',
    action: 'Read the injury study',
    art: 'injury',
    alt: 'A chart comparing nine seasons of injury burden for San Francisco and Seattle.',
  },
  {
    id: 'tend',
    number: '03',
    board: 'AI systems',
    project: 'Tend',
    title: 'Turn a message into a task to review',
    caption: 'A personal iPhone and Mac project for the things a family needs to do.',
    story: 'A useful request can disappear into a perfectly ordinary conversation. Tend looks at a limited piece of that context and drafts a follow-up that a family member can review.',
    decision: 'I made review a distinct step between reading a message and making a family task. It gives the person who knows the family a chance to decide whether a suggestion belongs on the list.',
    href: '/projects/tend',
    action: 'Read about Tend',
    art: 'tend',
    alt: 'Tend opens the evidence behind a suggested school-form task.',
  },
  {
    id: 'forty-at-the-plate',
    number: '40',
    board: 'Products',
    project: 'Forty at the Plate',
    title: 'My 40th, from the dugout',
    caption: 'A game-day site for my four-team Wiffle ball birthday tournament.',
    story: 'I built Forty at the Plate for my 40th birthday. Four teams play Wiffle ball, a home-run derby and a target toss. The scoreboard brings the points from all three events into the team standings.',
    decision: 'Between innings, a player can check a house rule or open the illustrated pitching guide to see how to grip a riser. The same site keeps the schedule and scores handy on a phone at the field.',
    href: '/40',
    action: 'Open the birthday tournament',
    art: 'birthday',
    alt: 'The tournament scoreboard and illustrated Wiffle ball pitching guide.',
  },
  {
    id: 'spark',
    number: '04',
    board: 'AI systems',
    project: 'SPARK',
    title: 'Save an AI demo with its source',
    caption: 'An iPhone app for saving AI demos alongside the people who made them.',
    story: 'SPARK is my iPhone app for browsing AI demos and practical ideas. I wanted to be able to find the original creator again and tell when a demo was published.',
    decision: 'The feed keeps the source and publication date with each idea. Saves stay on the phone, where recommendations can adapt to the things I choose to keep.',
    href: '/projects/spark',
    action: 'Read about SPARK',
    art: 'spark',
    alt: 'SPARK’s collection of attributed AI demos and ideas',
  },
  {
    id: 'family-os',
    number: '05',
    board: 'AI systems',
    project: 'Family OS',
    title: 'A school note, a Friday deadline',
    caption: 'A sample science-fair note follows a task all the way to approval.',
    story: 'In this walkthrough, a school note asks someone to bring a poster on Friday. My Family OS prototype treats that as a reason to propose a task. An adult gets to see what the agent picked up and decide what to do.',
    decision: 'I keep the source attached to the proposal. A parent can check the original request and the deadline together before approving the task. The public example uses sample text from a school note.',
    href: '/projects/family-os',
    action: 'Read about Family OS',
    art: 'family',
    alt: 'The Family OS sample workflow reviews a task from a science fair note.',
  },
  {
    id: 'vectorfield',
    number: '06',
    board: 'Products',
    project: 'Vectorfield',
    title: '48 AI cases for data science directors',
    caption: 'An on-device casebook for people leading data science teams.',
    story: 'I wanted to practice the choices a data science director faces when building an AI system. Vectorfield collects 48 applied cases in a private learning app for iPhone and iPad.',
    decision: 'The learner can work through a case, talk through an answer and get feedback on the device. I wanted room to rehearse a judgment before having to make it with a team.',
    href: '/projects/vectorfield-ios',
    action: 'Look inside Vectorfield',
    art: 'cases',
    alt: 'A blue Vectorfield cover with forty-eight directional arrows',
  },
  {
    id: 'dropalpha',
    number: '07',
    board: 'Data science',
    project: 'DropAlpha',
    title: 'Is this sealed box worth buying?',
    caption: 'The arithmetic behind a sealed-card buying decision.',
    story: 'When I consider buying a sealed box of trading cards, I want to know what the purchase really costs. DropAlpha lets me account for inventory, compare places to sell and check whether the numbers still work.',
    decision: 'I kept those calculations explicit in this internal tool. A buy, hold or sell recommendation sits alongside the unit economics and the proposed place to sell, so I can check the reasoning.',
    href: '/projects/dropalpha',
    action: 'Read about DropAlpha',
    art: 'economics',
    alt: 'DropAlpha’s example unit economics for a sealed trading-card box.',
  },
  {
    id: 'about-andrew',
    number: '08',
    board: 'About me',
    project: 'Andrew Oh',
    title: 'A little about me',
    caption: 'The family routines and football questions behind my side projects.',
    story: 'I’m Andrew Oh, Director of Data Science at Xero. The things I build after work often start at home. I made PokéRead for reading practice and Forty at the Plate for the friends playing in my birthday tournament.',
    decision: 'I also spend time with questions that fit better in a chart. The 49ers injury study started with a familiar football argument and ended up with nine seasons of data. Both kinds of work live here.',
    href: '/resume',
    action: 'Read my one-page profile',
    art: 'bio',
    alt: 'A reserved portrait space for Andrew Oh.',
  },
  {
    id: 'work-history',
    number: '09',
    board: 'About me',
    project: 'Work history',
    title: 'My work in data science',
    caption: 'Product analytics, experimentation and data science leadership.',
    story: 'I’m currently Director of Data Science at Xero. Earlier in my career I worked at Pinterest. This collection sits alongside that professional history and gives me space to show the things I build on my own time.',
    decision: 'The résumé covers my roles in data science and analytics, from Yahoo and PicsArt to Pinterest, Coinbase, Walmart and Xero.',
    href: '/resume',
    action: 'Read my résumé',
    art: 'career',
    alt: 'Andrew’s work history featuring Pinterest and Xero',
  },
];

export function channelNumber(id: string) {
  return feedPins.find(program => program.id === id)!.number;
}
