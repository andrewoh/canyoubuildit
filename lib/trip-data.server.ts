import "server-only";

import { readImportedTransactions } from "./imported-transactions";
import { mergeTransactions, summarizeTransactions, transactions } from "./trip-data";

export async function refreshTripExpenses() {
  const imported = await readImportedTransactions();
  const merged = mergeTransactions(transactions, imported);

  return {
    generatedAt: new Date().toISOString(),
    transactions: merged,
    summary: summarizeTransactions(merged),
    connectors: {
      gmail: "seeded_from_latest_receipt",
      finance: imported.length > 0 ? "imported_export" : "not_connected",
      importCount: imported.length
    }
  };
}
