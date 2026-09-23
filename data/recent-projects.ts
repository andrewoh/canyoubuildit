export type RecentProject = {
  title: string;
  href: string;
  surface: string;
  touched: string;
  summary: string;
  preview?: {
    eyebrow: string;
    detail: string;
  };
};

export const recentProjectsUpdatedAt = "2026-09-21";

export const recentProjects: RecentProject[] = [
  {
    title: "Tend",
    href: "/projects/tend",
    surface: "Native family task manager",
    touched: "Sep 21",
    summary:
      "A privacy-first iPhone and Mac system that turns bounded communication context into reviewable follow-ups and family tasks.",
    preview: {
      eyebrow: "Native family follow-through system",
      detail:
        "Review-first AI helps a family capture what matters, plan the next move, and keep the human firmly in control.",
    },
  },
  {
    title: "PokéRead",
    href: "/projects/pokeread",
    surface: "Private reading adventure",
    touched: "Sep 20",
    summary:
      "A private iPhone and iPad reading adventure where two young readers practice an adaptive, phonics-led course and earn Pokémon packs and collections.",
    preview: {
      eyebrow: "Native family learning beta",
      detail:
        "Seventy-four trainer lessons turn supported reading practice into a local-first trail of badges, storybooks, packs, and discoveries.",
    },
  },
  {
    title: "SPARK",
    href: "/projects/spark",
    surface: "Native AI-ideas explorer",
    touched: "Sep 15",
    summary:
      "An iPhone app for attributed AI demos and practical ideas, with publication-date filters, local saves, and on-device personalized discovery.",
    preview: {
      eyebrow: "Native ideas-discovery beta",
      detail:
        "A source-backed stream of AI things to try pairs honest trend windows with private boards and recommendations that learn on the phone.",
    },
  },
  {
    title: "Welcome Team",
    href: "/projects/welcome-team",
    surface: "Native church operations beta",
    touched: "Sep 11",
    summary:
      "A Sunday-ready iPhone and iPad workspace for capturing newcomers, preserving context, and coordinating thoughtful follow-up.",
    preview: {
      eyebrow: "Church operations TestFlight beta",
      detail:
        "A provenance-aware people and relationship hub turns newcomer conversations into practical Sunday context and coordinated next steps.",
    },
  },
  {
    title: "Vocal Coach",
    href: "/projects/vocal-coach",
    surface: "Native coaching beta",
    touched: "Sep 5",
    summary:
      "A calm iPhone and iPad practice coach that chooses one useful vocal focus and guides a short daily routine.",
    preview: {
      eyebrow: "Native vocal-practice beta",
      detail:
        "Local, route-aware listening gives one plain-language cue at a time without turning practice into a score chase.",
    },
  },
  {
    title: "Vectorfield for iPhone",
    href: "/projects/vectorfield-ios",
    surface: "Native learning app",
    touched: "Sep 5",
    summary:
      "A private SwiftUI learning companion for data-science directors building stronger AI-native data systems.",
    preview: {
      eyebrow: "Native iPhone and iPad learning app",
      detail:
        "Forty-eight applied director cases, local formative feedback, and privacy-first voice input in an on-device learning loop.",
    },
  },
  {
    title: "FFL Champions",
    href: "/projects/ffl-champions",
    surface: "Live draft companion",
    touched: "Sep 4",
    summary:
      "A private Yahoo fantasy-football draft board with sourced rankings, roster-aware two-pick advice, and manual pick tracking.",
    preview: {
      eyebrow: "Fantasy football draft room",
      detail:
        "A fast, transparent draft companion that keeps the board, queue, roster needs, and next two picks in one place.",
    },
  },
  {
    title: "Family OS",
    href: "/projects/family-os",
    surface: "Household agent prototype",
    touched: "Sep 4",
    summary:
      "A private household context engine that turns source-backed obligations into traceable proposals for an adult to approve.",
    preview: {
      eyebrow: "AI-native household system",
      detail:
        "Shared context becomes coordinated action only after provenance, permissions, and adult approval are clear.",
    },
  },
  {
    title: "DropAlpha",
    href: "/projects/dropalpha",
    surface: "Internal decision-support app",
    touched: "Sep 1",
    summary:
      "A sealed-card opportunity and inventory system with deterministic unit economics, bankroll guidance, and exit routing.",
    preview: {
      eyebrow: "Collectibles decision support",
      detail:
        "Structured evidence turns market signals into transparent buy, hold, sell, and venue recommendations without pretending certainty.",
    },
  },
];
