import cards from "../data/bowman-cards.json";

export type BowmanTrendPoint = {
  month: string;
  value: number;
};

export type BowmanSourceLink = {
  label: string;
  url: string;
};

export type BowmanCard = {
  id: string;
  year: number;
  setName: string;
  cardNumber: string;
  playerName: string;
  team: string;
  position?: string;
  imageUrl: string;
  imageCredit: string;
  sourceLinks: BowmanSourceLink[];
  currentValue: number;
  previousValue: number;
  releaseDate?: string;
  lastUpdated: string;
  trend: BowmanTrendPoint[];
};

export const bowmanCards = cards as BowmanCard[];

export function getBowmanCard(cardId: string) {
  return bowmanCards.find((card) => card.id === cardId) || null;
}

export function summarizeBowmanCards(cardIds: string[]) {
  const selected = cardIds
    .map((cardId) => getBowmanCard(cardId))
    .filter((card): card is BowmanCard => Boolean(card));

  const totalValue = selected.reduce((sum, card) => sum + card.currentValue, 0);
  const strongestRiser = selected.reduce<BowmanCard | null>((best, card) => {
    if (!best) return card;
    return card.currentValue - card.previousValue > best.currentValue - best.previousValue ? card : best;
  }, null);

  return {
    cards: selected,
    totalValue,
    strongestRiser
  };
}
