export type Experience = {
  employer: string;
  role?: string;
  dates: string;
  summary?: string;
  work?: string[];
  progression?: { role: string; dates: string }[];
};

export const experience: Experience[] = [
  {
    employer: 'Xero',
    role: 'Director of Data Science',
    dates: 'Sep 2024 – Present',
    summary: 'Lead data science across Payments, Payroll and Ecosystem. My teams build and evaluate AI systems and bots for data analysis.',
    work: [
      'Established evaluation methods and reusable business context for AI-assisted analysis, with human review and clear ownership of recommendations.',
      'Oversaw product experiments that measured customer and business outcomes alongside engagement, helping teams decide what to scale, improve or stop.',
      'Built and led a multidisciplinary team while staying hands-on with evaluation design, complex root-cause investigations, and decisions about product scope and priorities.',
      'Partnered with product and engineering leaders to build AI-native accounting, payroll and payments products for small businesses, accountants and bookkeepers.',
    ],
  },
  {
    employer: 'Walmart',
    role: 'Sr. Data Science Manager',
    dates: 'Mar 2023 – Aug 2024',
    summary: 'Managed data science and data engineering teams for Walmart+.',
    work: [
      'Expanded experimentation across member engagement and retention, member care, and account management. Winning experiments contributed to 44% year-over-year growth in Walmart+ membership.',
      'Established the data engineering function for fraud, trust and safety, and payments products. Led third-party integrations.',
    ],
  },
  {
    employer: 'Coinbase',
    role: 'Sr. Data Scientist',
    dates: 'Apr 2022 – Jan 2023',
    work: [
      'Earned a 2022 High Impact award for helping launch Coinbase NFT and grow Coinbase One from beta to over 200,000 users.',
      'Modeled which activation features predicted NFT retention and estimated a potential 15% lift.',
      'Built a synthetic control to estimate Coinbase One’s incremental impact across Coinbase and modeled the value of new subscriber incentives.',
    ],
  },
  {
    employer: 'Pinterest',
    role: 'Product Data Scientist',
    dates: 'Dec 2017 – Apr 2022',
    work: [
      'Led creator analytics and built a Python model to identify promising creators. It replaced manual review as the program grew from hundreds to millions of creators.',
      'Identified the causes of app crashes and built alerts to speed up incident response, helping raise the crash-free user rate from 95% to 99.8%.',
      'Defined success metrics and used experiments to secure executive backing for a visual redesign that reached over 450 million users each month.',
    ],
  },
  {
    employer: 'PicsArt Inc.',
    role: 'Sr. Business Analyst',
    dates: 'Jul 2016 – Nov 2017',
    summary: 'Led analytics at San Francisco headquarters. Used Spark and Python for user clustering and funnel analysis, managed the team behind weekly business reporting and trained junior analysts.',
  },
  {
    employer: 'Yahoo! Inc.',
    dates: 'Jan 2013 – Jul 2016',
    progression: [
      { role: 'Data Insights Analyst III', dates: 'Mar 2015 – Jul 2016' },
      { role: 'Data Insights Analyst II', dates: 'Aug 2013 – Mar 2015' },
      { role: 'Data Analyst', dates: 'Jan 2013 – Aug 2013' },
    ],
    work: [
      'Cut Yahoo Shopping reporting latency from 30 minutes to real time by migrating its data mart. Designed A/B tests for desktop and mobile redesigns as Shopping’s sole product analyst.',
      'Standardized Yahoo Search instrumentation, owned the Search Insights dashboard and trained teams across the organization to query Search data in Hive.',
    ],
  },
];

export const earlierExperience = [
  {
    employer: 'Blackhawk Network',
    role: 'Customer Service Analyst',
    dates: 'Aug 2010 – Dec 2012',
    summary: 'Forecasted monthly call volumes from historical demand and projected sales.',
  },
  {
    employer: 'Property Sciences',
    role: 'Accounting Specialist',
    dates: 'May 2009 – Feb 2010',
    summary: 'Reconciled accounts and investigated credit card chargebacks.',
  },
  {
    employer: 'Chevron',
    role: 'Payroll Representative',
    dates: 'Oct 2008 – Jan 2009',
    summary: 'Validated biweekly payroll in SAP.',
  },
  {
    employer: 'COLSearch',
    role: 'Consulting Firm Intern',
    dates: 'Jun 2006 – Aug 2006',
    summary: 'Sourced candidates for Yahoo and other clients.',
  },
];
