import seed from "../data/transactions.json";

export const categories = [
  "Flights",
  "Hotels",
  "Dining",
  "Airport",
  "Ground Transport",
  "Travel Services",
  "Other"
] as const;

export type ExpenseCategory = (typeof categories)[number];

export type ExpenseStatus =
  | "posted"
  | "pending"
  | "receipt_detected"
  | "matched"
  | "refunded";

export type NormalizedExpense = {
  id: string;
  source: string;
  date: string;
  merchant: string;
  title: string;
  amount: number | null;
  currency: string;
  category: ExpenseCategory;
  confidence: "high" | "review" | "pending";
  status: ExpenseStatus;
  notes: string;
  rawSource: Record<string, unknown>;
};

export type TripSummary = {
  postedTotal: number;
  pendingTotal: number;
  detectedReceiptTotal: number;
  count: number;
  byCategory: Array<{ category: ExpenseCategory; total: number }>;
};

const categoryRules: Array<[ExpenseCategory, RegExp]> = [
  ["Flights", /united|flight|airline|sfo|icn|incheon/i],
  ["Hotels", /hotel|lodging|fine hotels|resorts|josun/i],
  ["Dining", /restaurant|dining|cafe|coffee|bar|bakery/i],
  ["Airport", /airport|incheon|cu/i],
  ["Ground Transport", /taxi|uber|lyft|train|metro|subway|transport/i],
  ["Travel Services", /clear|tsa|global entry|visa|passport/i]
];

export function categorizeExpense(input: {
  merchant?: string;
  title?: string;
  notes?: string;
}): ExpenseCategory {
  const haystack = `${input.merchant ?? ""} ${input.title ?? ""} ${input.notes ?? ""}`;
  return categoryRules.find(([, pattern]) => pattern.test(haystack))?.[0] ?? "Other";
}

export function normalizeExpense(row: Partial<NormalizedExpense>): NormalizedExpense {
  const merchant = row.merchant?.trim() || "Unknown merchant";
  const title = row.title?.trim() || merchant;
  return {
    id: row.id || `${merchant.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${row.date || "undated"}`,
    source: row.source || "seed",
    date: row.date || new Date().toISOString().slice(0, 10),
    merchant,
    title,
    amount: typeof row.amount === "number" ? row.amount : null,
    currency: row.currency || "USD",
    category: row.category || categorizeExpense({ merchant, title, notes: row.notes }),
    confidence: row.confidence || "review",
    status: row.status || "pending",
    notes: row.notes || "",
    rawSource: row.rawSource || {}
  };
}

export const transactions = (seed as Array<Partial<NormalizedExpense>>).map(normalizeExpense);

export function mergeTransactions(
  baseRows: NormalizedExpense[],
  importedRows: NormalizedExpense[]
): NormalizedExpense[] {
  const merged = new Map(baseRows.map((row) => [row.id, row]));

  for (const imported of importedRows) {
    const explicitTarget = typeof imported.rawSource?.matchedReceiptId === "string" ? imported.rawSource.matchedReceiptId : null;
    const reservationNumber = typeof imported.rawSource?.reservationNumber === "string" ? imported.rawSource.reservationNumber : null;
    const targetId =
      merged.has(imported.id)
        ? imported.id
        : [...merged.values()].find((row) => {
            return (
              row.id === explicitTarget ||
              row.rawSource?.messageId === explicitTarget ||
              (reservationNumber && row.rawSource?.reservationNumber === reservationNumber)
            );
          })?.id;

    if (targetId) {
      const existing = merged.get(targetId);
      if (!existing) continue;
      merged.set(targetId, {
        ...existing,
        ...imported,
        id: targetId,
        rawSource: {
          ...existing.rawSource,
          ...imported.rawSource,
          importedExpenseId: imported.id
        }
      });
    } else {
      merged.set(imported.id, imported);
    }
  }

  return [...merged.values()];
}

export function summarizeTransactions(rows: NormalizedExpense[] = transactions): TripSummary {
  const postedTotal = rows.reduce(
    (sum, row) => sum + (row.status === "posted" || row.status === "matched" ? row.amount || 0 : 0),
    0
  );
  const pendingTotal = rows.reduce(
    (sum, row) => sum + (row.status === "pending" ? row.amount || 0 : 0),
    0
  );
  const detectedReceiptTotal = rows.reduce((sum, row) => {
    const receiptTotal =
      typeof row.rawSource?.receiptTotal === "number" ? row.rawSource.receiptTotal : row.amount || 0;
    return sum + (row.status === "receipt_detected" ? receiptTotal : 0);
  }, 0);

  const byCategory = categories.map((category) => {
    const total = rows
      .filter((row) => row.category === category)
      .reduce((sum, row) => sum + (row.amount || 0), 0);
    return { category, total };
  });

  return {
    postedTotal,
    pendingTotal,
    detectedReceiptTotal,
    count: rows.length,
    byCategory
  };
}
