export type Experience = {
  employer: string;
  role: string;
  dates: string;
  location?: string;
  summary?: string;
  work?: string[];
  closing?: string;
};

export const experience: Experience[] = [
  {
    employer: 'Xero',
    role: 'Director of Data Science',
    dates: 'Sep 2024 – Present',
    summary: 'Lead data science across Payments, Payroll and Ecosystem, shaping how teams operate in an AI-native world.',
    work: [
      'Defined the direction for AI adoption within data science, connecting emerging capabilities to valuable business problems and changes in how teams work.',
      'Developed agentic analytics and decision-support workflows grounded in business context, shared metrics and domain expertise.',
      'Built the foundations for trustworthy AI-assisted analysis: reusable context, evaluation methods, human review and clear accountability for recommendations.',
      'Coached data scientists to frame ambiguous problems, direct AI-assisted investigations, challenge outputs and exercise strong scientific and product judgment.',
      'Partnered with product and engineering leaders to prioritize AI opportunities, guide pilots and establish the evidence needed to expand their use.',
    ],
    closing: 'My focus is building an organization that can continually adapt as AI capabilities evolve. Where I thrive is in combining experimentation, technical judgment and team development to turn new capabilities into better business decisions.',
  },
  {
    employer: 'Walmart',
    role: 'Sr. Data Science Manager',
    dates: 'Mar 2023 – Aug 2024',
    summary: 'Managed data science teams across Member Engagement and Retention, Member Care/Account Management, and Data Engineering. Built data foundations for Fraud/Trust and Safety and Payments products, scaled experimentation, and led 3P integration efforts.',
  },
  {
    employer: 'Coinbase',
    role: 'Sr. Data Scientist',
    dates: 'Apr 2022 – Jan 2023',
    location: 'San Francisco Bay Area',
    summary: 'Lead DS for NFT Growth, Lead DS for Coinbase One (Subscriptions)',
    work: [
      'Earned a 2022 High Impact award for playing a critical role in a successful NFT site launch and the growth of Coinbase One from beta to over 200k users',
      'Leveraged machine learning models to find which activation features are most predictive for retention on Coinbase NFT. This analysis estimated a +15% impact to retention',
      'Built and utilized a synthetic control as the central part of an analysis to find the incremental impact of Coinbase One on the larger Coinbase ecosystem',
      'Performed various modeling scenarios to size the impact of adding new incentives to the Coinbase One subscription package',
      'Led experimentation design, reviews, and analysis for both CB NFT and CB1',
    ],
  },
  {
    employer: 'Pinterest',
    role: 'Product Data Scientist',
    dates: 'Dec 2017 – Apr 2022',
    location: 'San Francisco, CA',
    summary: 'Led analytics for multiple company-wide strategic initiatives and managed an agile analytics team that covered the following product teams: creator tools, creator analytics, creator monetization/rewards, and creator management',
    work: [
      'Led analytics for our Creators initiative and built the foundations for the product team to drive from zero-to-one and to scale from a skeleton team to the largest team and biggest bet at Pinterest.',
      'Built a creator sourcing tool in Python that leverages ML modeling to discover and predict top creators that the company should partner with. This removed the need for manual review which became increasingly problematic as the program scaled from hundreds to millions of creators.',
      'Identified drivers of crashes on Pinterest and built metrics, pipelines, and alerting to expedite response time for incidents. This resulted in improving our crash-free user rate from 95% to 99.8%.',
      'Drove the largest visual redesign that Pinterest has done since the first mobile app, and secured buy-in from teams across the company and executive leadership through OKR-defining and experiment/landscape analysis. This new design is seen by over 450M users each month, and the insights provided mitigated any potential loss in revenue or engagement.',
    ],
  },
  {
    employer: 'PicsArt Inc.',
    role: 'Sr. Business Analyst',
    dates: 'Jul 2016 – Nov 2017',
    location: 'San Francisco, California',
    summary: 'Head analyst for SF headquarters. Responsible for analytics needs across all teams in the office',
    work: [
      'Designed and created user behavior studies, such as clustering and funnel analyses, through the use of Spark and Python',
      'Oversaw the company’s business intelligence efforts and managed a team of analysts to provide weekly support for our dashboards',
      'Trained junior analysts and built a knowledge and code repository for the analytics organization',
    ],
  },
  {
    employer: 'Yahoo! Inc.',
    role: 'Data Insights Analyst III',
    dates: 'Mar 2015 – Jul 2016',
    location: 'Sunnyvale, CA',
    summary: 'Product analyst supporting Yahoo Aviate, Search, Shopping, Local, and Maps. Responsible for standardizing instrumentation for Yahoo Search.',
    work: [
      'Drove instrumentation and owned product analysis for emerging mobile Search apps',
      'Utilized Hive, SQL, and Tableau to provide business intelligence insights for executives',
      'Served as product manager for a highly-used Search Insights dashboard',
      'Generated actionable insights on Yahoo Search modules by creating ad-hoc analyses and dashboards',
      'Worked alongside business leads to verify and analyze user data, providing our external partners with necessary guidance for Yahoo product performance',
      'Led organization-wide training sessions on understanding Search data and how to perform queries via Hive/Hue',
    ],
  },
  {
    employer: 'Yahoo! Inc.',
    role: 'Data Insights Analyst II',
    dates: 'Aug 2013 – Mar 2015',
    location: 'Sunnyvale, CA',
    summary: 'Sole product analyst for Yahoo Shopping. Handled all analytics needs for the product, including dashboarding, experimentation, and business intelligence.',
    work: [
      'Drove the transition from a legacy data mart to a next-generation proprietary tool that reduced reporting latency from 30 minutes to real-time',
      'Partnered with product managers and engineers to build data-driven Desktop and Mobile redesigns of the Yahoo Shopping property',
      'Designed A/B tests with product managers and provided immediate feedback to drive product change',
      'Modeled the financial and content engagement impact of changes to the Yahoo Shopping product',
    ],
  },
  {
    employer: 'Yahoo! Inc.',
    role: 'Data Analyst',
    dates: 'Jan 2013 – Aug 2013',
    location: 'Sunnyvale',
    summary: 'Owner of analytical insights for Commerce properties. Responsible for the development of dashboards for Y! Groups and Answers.',
    work: [
      'Drove the procurement of new data and metrics to find property-specific KPIs',
      'Provided product insights and analysis of trends based on big data sets',
      'Extracted large quantities of user data via the use of Hadoop, Pig, and Hive',
      'Collaborated with product managers and engineers to strategize data gathering going forward',
    ],
  },
  {
    employer: 'Blackhawk Network',
    role: 'Customer Service Analyst',
    dates: 'Aug 2010 – Dec 2012',
    location: 'Pleasanton, CA',
    work: [
      'Developed reporting databases through the use of Excel, MicroStrategy, and Qlikview',
      'Created executive summary reports on behalf of our department and call centers',
      'Forecasted monthly call volumes using historical data and projected sales',
      'Constructed metric reports to measure customer support across several departments',
      'Strategized with directors and analysts for the growth of new products',
      'Collaborated with business partners to reduce financial losses due to fraud',
      'Trained both call center agents and associates on procedures used by the department',
    ],
  },
  {
    employer: 'Property Sciences',
    role: 'Accounting Specialist',
    dates: 'May 2009 – Feb 2010',
    work: [
      'Designed and developed programs and policies to effectively reduce company losses',
      'Handled the processing of all credit card activity, including sales and refunds',
      'Researched, assembled, and submitted disputes to credit card companies for chargebacks',
      'Maintained and balanced company accounts through the use of the Great Plains program',
      'Processed affiliate check cycles twice a month',
      "Prepared monthly statements for clients' unpaid invoices",
    ],
  },
  {
    employer: 'Chevron',
    role: 'Payroll Representative',
    dates: 'Oct 2008 – Jan 2009',
    work: [
      'Compiled a high volume of payroll data using the SAP program',
      'Corresponded with clients daily to answer their payroll questions',
      'Analyzed and validated bi-weekly payroll reports',
      'Verified compensation amounts for employees, including executives',
    ],
  },
  {
    employer: 'COLSearch',
    role: 'Consulting Firm Intern',
    dates: 'Jun 2006 – Aug 2006',
    work: [
      'Identified suitable candidates for job listings with Yahoo! being the primary employer',
      'Generated portfolios of resumes for supervisors',
      'Contacted clients on job opportunities and set up appointments for interviews',
      'Completed data entry of possible candidates and their respective qualifications',
      'Communicated research findings with supervisors regularly',
    ],
  },
];
