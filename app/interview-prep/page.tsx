"use client";

import CodeMirror from "@uiw/react-codemirror";
import { indentWithTab } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap, placeholder as editorPlaceholder } from "@codemirror/view";
import initSqlJs, { type Database as SqlDatabase, type SqlJsStatic } from "sql.js";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  CheckCircle2,
  Clock3,
  Database,
  FileCode2,
  ListChecks,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  SplitSquareHorizontal,
  Table2,
  TerminalSquare,
  Timer,
  Wand2
} from "lucide-react";
import styles from "./page.module.css";

type Language = "sql" | "python";
type CellValue = string | number | null;

type DataTable = {
  name: string;
  columns: string[];
  rows: CellValue[][];
};

type BaseProblem = {
  id: string;
  language: Language;
  title: string;
  focus: string;
  prompt: string;
  starter: string;
  checks: string[];
  hints: string[];
};

type SqlProblem = BaseProblem & {
  language: "sql";
  tables: DataTable[];
  seedSql: string;
  solutionSql: string;
};

type PythonProblem = BaseProblem & {
  language: "python";
  expected: string[];
};

type PracticeProblem = SqlProblem | PythonProblem;

type QueryResult = {
  columns: string[];
  rows: CellValue[][];
};

type RunReport = {
  mode: Language;
  status: "correct" | "wrong" | "error";
  score: number;
  passed: string[];
  missed: string[];
  message: string;
  detail?: string;
  userResult?: QueryResult;
};

const subscriptionTables: DataTable[] = [
  {
    name: "customers",
    columns: ["customer_id", "customer_name", "segment", "signup_date", "is_test"],
    rows: [
      [1, "Acme Retail", "SMB", "2025-11-15", 0],
      [2, "Beacon Health", "Healthcare", "2025-10-02", 0],
      [3, "Cedar Studio", null, "2026-01-12", 0],
      [4, "Demo Labs", "SMB", "2026-02-01", 1],
      [5, "Eastside Foods", "Enterprise", "2025-09-18", 0],
      [6, "Flow Fitness", "SMB", "2026-02-20", 0],
      [7, "Greenline Bank", "Finance", "2025-12-03", 0],
      [8, "Harbor Homes", null, "2026-01-30", 0]
    ]
  },
  {
    name: "subscriptions",
    columns: ["subscription_id", "customer_id", "plan_name", "start_date", "monthly_amount"],
    rows: [
      [101, 1, "Pro", "2025-12-12", 240],
      [102, 1, "Starter", "2026-01-03", 80],
      [103, 2, "Enterprise", "2025-11-02", 1200],
      [104, 3, "Pro", "2026-02-10", 260],
      [105, 4, "Pro", "2026-02-12", 999],
      [106, 5, "Enterprise", "2025-09-09", 1500],
      [107, 6, "Starter", "2026-03-01", 90],
      [108, 7, "Pro", "2026-01-17", 300],
      [109, 8, "Starter", "2026-02-22", 75],
      [110, 2, "Pro", "2026-03-15", 280]
    ]
  },
  {
    name: "subscription_events",
    columns: ["event_id", "subscription_id", "event_at", "status"],
    rows: [
      [1, 101, "2025-12-12", "active"],
      [2, 101, "2026-04-01", " Active "],
      [3, 102, "2026-01-03", "active"],
      [4, 102, "2026-04-20", "canceled"],
      [5, 103, "2025-11-02", "active"],
      [6, 103, "2026-03-15", "paused"],
      [7, 103, "2026-04-18", "ACTIVE"],
      [8, 104, "2026-02-10", "trial"],
      [9, 104, "2026-04-02", "active"],
      [10, 105, "2026-02-12", "active"],
      [11, 106, "2025-09-09", "active"],
      [12, 106, "2026-04-25", "ACTIVE"],
      [13, 107, "2026-03-01", "active"],
      [14, 107, "2026-04-10", "failed_payment"],
      [15, 108, "2026-01-17", "active"],
      [16, 108, "2026-03-31", "canceled"],
      [17, 109, "2026-02-22", "  active"],
      [18, 110, "2026-03-15", "active"],
      [19, 110, "2026-04-19", "paused"]
    ]
  }
];

const revenueTables: DataTable[] = [
  {
    name: "products",
    columns: ["product_id", "product_name", "category"],
    rows: [
      [201, "Analytics Seat", "SaaS"],
      [202, "Onboarding Package", "Services"],
      [203, "Data Export Add-on", "SaaS"],
      [204, "Premium Support", "Services"],
      [205, "Training Workshop", "Education"]
    ]
  },
  {
    name: "orders",
    columns: ["order_id", "customer_id", "order_date", "status"],
    rows: [
      [5001, 1, "2026-04-02", "completed"],
      [5002, 2, "2026-04-05", "completed"],
      [5003, 3, "2026-04-08", "completed"],
      [5004, 5, "2026-04-12", "canceled"],
      [5005, 6, "2026-04-18", "completed"],
      [5006, 7, "2026-04-21", "completed"],
      [5007, 8, "2026-05-01", "completed"],
      [5008, 1, "2026-04-28", "completed"]
    ]
  },
  {
    name: "order_items",
    columns: ["order_id", "product_id", "quantity", "unit_price"],
    rows: [
      [5001, 201, 3, 120],
      [5001, 203, 1, 49],
      [5002, 202, 1, 800],
      [5002, 201, 5, 115],
      [5003, 204, 1, 450],
      [5003, 203, 2, 49],
      [5004, 201, 10, 100],
      [5005, 205, 2, 300],
      [5005, 201, 2, 125],
      [5006, 202, 1, 750],
      [5006, 204, 1, 430],
      [5008, 203, 4, 45],
      [5008, 201, 1, 130]
    ]
  },
  {
    name: "refunds",
    columns: ["refund_id", "order_id", "product_id", "refund_amount", "refund_date"],
    rows: [
      [1, 5002, 201, 115, "2026-04-07"],
      [2, 5003, 204, 100, "2026-04-11"],
      [3, 5005, 205, 300, "2026-04-22"],
      [4, 5007, 201, 120, "2026-05-04"]
    ]
  }
];

function createTableSql(table: DataTable) {
  const columnDefs = table.columns.map((column) => {
    const numeric = table.rows.every((row) => row[table.columns.indexOf(column)] == null || typeof row[table.columns.indexOf(column)] === "number");
    return `${column} ${numeric ? "NUMERIC" : "TEXT"}`;
  });
  return `CREATE TABLE ${table.name} (${columnDefs.join(", ")});`;
}

function cellSql(value: CellValue) {
  if (value == null) return "NULL";
  if (typeof value === "number") return String(value);
  return `'${value.replaceAll("'", "''")}'`;
}

function seedSqlFor(tables: DataTable[]) {
  return tables
    .flatMap((table) => [
      createTableSql(table),
      ...table.rows.map((row) => `INSERT INTO ${table.name} (${table.columns.join(", ")}) VALUES (${row.map(cellSql).join(", ")});`)
    ])
    .join("\n");
}

const sqlProblems: SqlProblem[] = [
  {
    id: "sql-active-subscriptions",
    language: "sql",
    title: "Active Subscriptions Report",
    focus: "real SQLite dataset, latest event, joins, null handling",
    prompt:
      "Write a SQL query from scratch. Return active subscriptions as of the latest event per subscription. Normalize status with LOWER(TRIM(status)), exclude test customers, replace missing customer segment with 'unknown', and aggregate by plan and segment. Output columns exactly: plan_name, customer_segment, active_subscriptions, monthly_recurring_revenue. Sort by plan_name ASC, customer_segment ASC.",
    starter: "",
    checks: ["Valid read-only SQL", "Exact required columns", "Correct row count", "Correct rows and values", "Correct ordering"],
    hints: [
      "Find the latest event per subscription first. ROW_NUMBER() OVER (PARTITION BY subscription_id ORDER BY event_at DESC, event_id DESC) is the cleanest path.",
      "The latest status has inconsistent casing and spaces. Compare LOWER(TRIM(status)) to 'active'.",
      "Join latest events to subscriptions and customers, filter c.is_test = 0, and use COALESCE(c.segment, 'unknown') before grouping."
    ],
    tables: subscriptionTables,
    seedSql: seedSqlFor(subscriptionTables),
    solutionSql: `WITH latest_events AS (
  SELECT
    subscription_id,
    LOWER(TRIM(status)) AS normalized_status,
    event_at,
    ROW_NUMBER() OVER (
      PARTITION BY subscription_id
      ORDER BY event_at DESC, event_id DESC
    ) AS rn
  FROM subscription_events
)
SELECT
  s.plan_name,
  COALESCE(c.segment, 'unknown') AS customer_segment,
  COUNT(*) AS active_subscriptions,
  SUM(s.monthly_amount) AS monthly_recurring_revenue
FROM latest_events le
JOIN subscriptions s
  ON s.subscription_id = le.subscription_id
JOIN customers c
  ON c.customer_id = s.customer_id
WHERE le.rn = 1
  AND le.normalized_status = 'active'
  AND c.is_test = 0
GROUP BY s.plan_name, COALESCE(c.segment, 'unknown')
ORDER BY s.plan_name ASC, customer_segment ASC;`
  },
  {
    id: "sql-net-revenue",
    language: "sql",
    title: "April Product Net Revenue",
    focus: "real SQLite dataset, joins, CTEs, aggregate refunds",
    prompt:
      "Write a SQL query from scratch. For completed April 2026 orders, calculate product-level net revenue after refunds. Output columns exactly: product_name, category, units_sold, gross_revenue, refund_amount, net_revenue. Include products from completed April orders even when they have no refund, and sort by net_revenue DESC, product_name ASC.",
    starter: "",
    checks: ["Valid read-only SQL", "Exact required columns", "Correct row count", "Correct rows and values", "Correct ordering"],
    hints: [
      "Start with a CTE for completed April orders: order_date >= '2026-04-01' and order_date < '2026-05-01'.",
      "Aggregate refunds by order_id and product_id before joining, otherwise refunds can duplicate item rows.",
      "Use COALESCE(refund_amount, 0) and ROUND(gross_revenue - refund_amount, 2) for net_revenue."
    ],
    tables: revenueTables,
    seedSql: seedSqlFor(revenueTables),
    solutionSql: `WITH completed_april_orders AS (
  SELECT order_id
  FROM orders
  WHERE status = 'completed'
    AND order_date >= '2026-04-01'
    AND order_date < '2026-05-01'
),
item_totals AS (
  SELECT
    oi.product_id,
    SUM(oi.quantity) AS units_sold,
    ROUND(SUM(oi.quantity * oi.unit_price), 2) AS gross_revenue
  FROM completed_april_orders o
  JOIN order_items oi
    ON oi.order_id = o.order_id
  GROUP BY oi.product_id
),
refund_totals AS (
  SELECT
    r.product_id,
    SUM(r.refund_amount) AS refund_amount
  FROM completed_april_orders o
  JOIN refunds r
    ON r.order_id = o.order_id
  GROUP BY r.product_id
)
SELECT
  p.product_name,
  p.category,
  it.units_sold,
  it.gross_revenue,
  COALESCE(rt.refund_amount, 0) AS refund_amount,
  ROUND(it.gross_revenue - COALESCE(rt.refund_amount, 0), 2) AS net_revenue
FROM item_totals it
JOIN products p
  ON p.product_id = it.product_id
LEFT JOIN refund_totals rt
  ON rt.product_id = it.product_id
ORDER BY net_revenue DESC, p.product_name ASC;`
  }
];

const pythonProblems: PythonProblem[] = [
  {
    id: "python-review",
    language: "python",
    title: "Review Existing Business Logic",
    focus: "control flow, functions, edge cases",
    prompt:
      "Improve a function that assigns risk labels to accounts. Explain the gaps you see, handle incomplete requirements, and make the function easier to test.",
    starter: `def classify_account(account):
    score = account["score"]
    overdue = account["overdue_days"]

    if score > 700 and overdue == 0:
        return "low"
    if score > 600:
        return "medium"
    return "high"


sample_accounts = [
    {"id": 1, "score": 720, "overdue_days": 0},
    {"id": 2, "score": None, "overdue_days": 12},
    {"id": 3, "score": 640, "overdue_days": 90},
]`,
    checks: ["Handles missing keys", "Handles None values", "Separates logic into a function", "Documents ambiguous assumptions", "Adds test cases"],
    hints: [
      "Use dict.get() or validation before reading fields.",
      "Decide how missing score should behave, then state that assumption.",
      "Boundary tests matter: 600, 601, 700, 701, and overdue days."
    ],
    expected: ["clear assumptions", "safe defaults", "boundary tests", "readable branches"]
  },
  {
    id: "python-optimize",
    language: "python",
    title: "Optimize a Data Transformation",
    focus: "reasoning, data structures, performance",
    prompt:
      "Given orders and refunds, return net revenue by customer. The first version loops through refunds for every order. Improve the performance and call out any requirements you would clarify.",
    starter: `def net_revenue_by_customer(orders, refunds):
    totals = {}
    for order in orders:
        refund_total = 0
        for refund in refunds:
            if refund["order_id"] == order["order_id"]:
                refund_total += refund["amount"]

        customer_id = order["customer_id"]
        totals[customer_id] = totals.get(customer_id, 0) + order["amount"] - refund_total

    return totals`,
    checks: ["Avoids nested scan", "Uses dictionaries well", "Handles duplicate refunds", "Handles missing amounts", "Explains complexity"],
    hints: [
      "Precompute refund totals by order_id before iterating orders.",
      "Use defaultdict or dict.get() to accumulate safely.",
      "Mention whether negative net revenue is allowed."
    ],
    expected: ["O(n + m) approach", "refunds_by_order", "input validation", "complexity explanation"]
  }
];

const problems: PracticeProblem[] = [...sqlProblems, ...pythonProblems];

function isSqlProblem(problem: PracticeProblem): problem is SqlProblem {
  return problem.language === "sql";
}

function evaluatePython(problem: PythonProblem, code: string): RunReport {
  const lower = code.toLowerCase();
  const checks: Record<string, boolean> = {
    "Handles missing keys": lower.includes(".get(") || lower.includes("keyerror") || lower.includes("in account"),
    "Handles None values": lower.includes("none") || lower.includes("is not"),
    "Separates logic into a function": lower.includes("def "),
    "Documents ambiguous assumptions": lower.includes("assume") || lower.includes("#") || lower.includes('"""'),
    "Adds test cases": lower.includes("assert") || lower.includes("pytest") || lower.includes("unittest"),
    "Avoids nested scan": !(lower.includes("for refund in refunds") && lower.includes("for order in orders")) || lower.includes("refunds_by_order"),
    "Uses dictionaries well": lower.includes("{}") || lower.includes("defaultdict") || lower.includes(".get("),
    "Handles duplicate refunds": lower.includes("+=") || lower.includes("sum("),
    "Handles missing amounts": lower.includes(".get(\"amount") || lower.includes(".get('amount") || lower.includes("none"),
    "Explains complexity": lower.includes("o(") || lower.includes("complexity")
  };

  const passed = problem.checks.filter((check) => checks[check]);
  const missed = problem.checks.filter((check) => !checks[check]);

  return {
    mode: "python",
    status: missed.length === 0 ? "correct" : "wrong",
    score: Math.round((passed.length / problem.checks.length) * 100),
    passed,
    missed,
    message: missed.length === 0 ? "Looks good for an interview walkthrough." : "Tighten the missed areas before moving on.",
    detail: problem.expected.join(" | ")
  };
}

function normalizeCell(value: unknown): CellValue {
  if (value == null) return null;
  if (typeof value === "number") return Number.isInteger(value) ? value : Math.round(value * 100) / 100;
  return String(value);
}

function runSelect(db: SqlDatabase, sql: string): QueryResult {
  const resultSets = db.exec(sql);
  if (resultSets.length === 0) return { columns: [], rows: [] };
  const lastResult = resultSets[resultSets.length - 1];
  return {
    columns: lastResult.columns,
    rows: lastResult.values.map((row) => row.map(normalizeCell))
  };
}

function rowKey(row: CellValue[]) {
  return JSON.stringify(row.map((value) => (typeof value === "number" ? Math.round(value * 100) / 100 : value)));
}

function compareResults(problem: SqlProblem, userResult: QueryResult, expectedResult: QueryResult): RunReport {
  const actualColumns = userResult.columns.map((column) => column.toLowerCase());
  const expectedColumns = expectedResult.columns.map((column) => column.toLowerCase());
  const columnsMatch = JSON.stringify(actualColumns) === JSON.stringify(expectedColumns);
  const rowCountMatch = userResult.rows.length === expectedResult.rows.length;
  const orderedRowsMatch = JSON.stringify(userResult.rows.map(rowKey)) === JSON.stringify(expectedResult.rows.map(rowKey));
  const unorderedRowsMatch =
    JSON.stringify([...userResult.rows.map(rowKey)].sort()) === JSON.stringify([...expectedResult.rows.map(rowKey)].sort());

  const checks = {
    "Valid read-only SQL": true,
    "Exact required columns": columnsMatch,
    "Correct row count": rowCountMatch,
    "Correct rows and values": orderedRowsMatch || unorderedRowsMatch,
    "Correct ordering": orderedRowsMatch
  };

  const passed = problem.checks.filter((check) => checks[check as keyof typeof checks]);
  const missed = problem.checks.filter((check) => !checks[check as keyof typeof checks]);
  const correct = missed.length === 0;

  let message = "Correct. Your query returned the exact expected result.";
  let detail = "Nice. You can now practice explaining the joins, filters, and tradeoffs out loud.";

  if (!correct && !columnsMatch) {
    message = "Column mismatch.";
    detail = `Return exactly these columns in this order: ${expectedResult.columns.join(", ")}.`;
  } else if (!correct && !rowCountMatch) {
    message = "Row count mismatch.";
    detail = `Your query returned ${userResult.rows.length} row${userResult.rows.length === 1 ? "" : "s"}; the expected result has ${expectedResult.rows.length}. Recheck filters and join cardinality.`;
  } else if (!correct && unorderedRowsMatch) {
    message = "The values are right, but the ordering is wrong.";
    detail = "Revisit the ORDER BY requirement in the prompt.";
  } else if (!correct) {
    const firstMismatchIndex = userResult.rows.findIndex((row, index) => rowKey(row) !== rowKey(expectedResult.rows[index]));
    message = "The returned rows do not match the expected result.";
    detail =
      firstMismatchIndex >= 0
        ? `First mismatch appears around row ${firstMismatchIndex + 1}. Recheck latest-record logic, null handling, refund aggregation, or filters.`
        : "Recheck joins, grouping, and calculated fields.";
  }

  return {
    mode: "sql",
    status: correct ? "correct" : "wrong",
    score: Math.round((passed.length / problem.checks.length) * 100),
    passed,
    missed,
    message,
    detail,
    userResult
  };
}

function validateReadOnlySql(sql: string) {
  const trimmed = sql.trim();
  if (!trimmed) return "Write a SELECT query first.";
  if (!/^(with|select)\b/i.test(trimmed)) return "Only SELECT queries or WITH CTE queries are allowed.";
  if (/\b(insert|update|delete|drop|alter|create|pragma|attach|detach|vacuum|replace)\b/i.test(trimmed)) {
    return "This practice runner only accepts read-only SELECT queries.";
  }
  return null;
}

function runSqlPractice(SQL: SqlJsStatic, problem: SqlProblem, code: string): RunReport {
  const validationError = validateReadOnlySql(code);
  if (validationError) {
    return {
      mode: "sql",
      status: "error",
      score: 0,
      passed: [],
      missed: problem.checks,
      message: validationError
    };
  }

  const db = new SQL.Database();
  try {
    db.run(problem.seedSql);
    const userResult = runSelect(db, code);
    const expectedResult = runSelect(db, problem.solutionSql);
    return compareResults(problem, userResult, expectedResult);
  } catch (error) {
    return {
      mode: "sql",
      status: "error",
      score: 0,
      passed: ["Valid read-only SQL"].filter(() => false),
      missed: problem.checks,
      message: "SQLite could not run that query.",
      detail: error instanceof Error ? error.message : "Unknown SQL error"
    };
  } finally {
    db.close();
  }
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function ResultTable({ result }: { result: QueryResult }) {
  if (result.columns.length === 0) {
    return <div className={styles.emptyOutput}>The query ran, but did not return a result set.</div>;
  }

  return (
    <div className={styles.resultTableWrap}>
      <table className={styles.resultTable}>
        <thead>
          <tr>
            {result.columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, rowIndex) => (
            <tr key={`${rowIndex}-${rowKey(row)}`}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell == null ? "NULL" : cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function InterviewPrepPage() {
  const [sqlEngine, setSqlEngine] = useState<SqlJsStatic | null>(null);
  const [sqlEngineError, setSqlEngineError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>("sql");
  const [problemId, setProblemId] = useState(problems[0].id);
  const [codeByProblem, setCodeByProblem] = useState<Record<string, string>>(() =>
    Object.fromEntries(problems.map((problem) => [problem.id, problem.starter]))
  );
  const [revealedHints, setRevealedHints] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [report, setReport] = useState<RunReport | null>(null);

  useEffect(() => {
    let cancelled = false;
    initSqlJs({ locateFile: () => "/sql-wasm.wasm" })
      .then((SQL) => {
        if (!cancelled) setSqlEngine(SQL);
      })
      .catch((error) => {
        if (!cancelled) setSqlEngineError(error instanceof Error ? error.message : "Could not load SQLite.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft]);

  const visibleProblems = problems.filter((problem) => problem.language === language);
  const problem = problems.find((item) => item.id === problemId) ?? visibleProblems[0];
  const code = codeByProblem[problem.id] ?? problem.starter;
  const visibleHints = problem.hints.slice(0, revealedHints[problem.id] ?? 0);

  const progress = useMemo(() => Math.round(((25 * 60 - timeLeft) / (25 * 60)) * 100), [timeLeft]);
  const editorExtensions = useMemo(
    () => [
      language === "sql" ? sql({ upperCaseKeywords: true }) : python(),
      EditorState.tabSize.of(2),
      indentUnit.of("  "),
      editorPlaceholder(language === "sql" ? "SELECT ...\nFROM ...\n..." : "Write or revise Python here..."),
      Prec.high(keymap.of([indentWithTab])),
      EditorView.lineWrapping,
      EditorView.theme({
        "&": {
          minHeight: "560px",
          height: "100%",
          backgroundColor: "#101820",
          color: "#ecf4f1",
          fontSize: "14px"
        },
        ".cm-scroller": {
          minHeight: "560px",
          fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
          lineHeight: "1.62"
        },
        ".cm-content": {
          padding: "18px 0"
        },
        ".cm-line": {
          padding: "0 18px"
        },
        ".cm-gutters": {
          backgroundColor: "#0b1219",
          color: "#6f8191",
          borderRight: "1px solid rgba(255,255,255,.08)"
        },
        ".cm-activeLine": {
          backgroundColor: "rgba(125, 192, 164, .09)"
        },
        ".cm-activeLineGutter": {
          backgroundColor: "rgba(125, 192, 164, .13)",
          color: "#b8e2cf"
        },
        ".cm-cursor": {
          borderLeftColor: "#b8e2cf"
        },
        ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
          backgroundColor: "rgba(125, 192, 164, .28)"
        },
        ".cm-placeholder": {
          color: "#6f8191"
        }
      })
    ],
    [language]
  );

  function selectLanguage(nextLanguage: Language) {
    const nextProblem = problems.find((item) => item.language === nextLanguage);
    if (!nextProblem) return;
    setLanguage(nextLanguage);
    setProblemId(nextProblem.id);
    setReport(null);
  }

  function runPractice() {
    if (isSqlProblem(problem)) {
      if (sqlEngineError) {
        setReport({
          mode: "sql",
          status: "error",
          score: 0,
          passed: [],
          missed: problem.checks,
          message: "SQLite did not load.",
          detail: sqlEngineError
        });
        return;
      }

      if (!sqlEngine) {
        setReport({
          mode: "sql",
          status: "error",
          score: 0,
          passed: [],
          missed: problem.checks,
          message: "SQLite is still loading. Try again in a second."
        });
        return;
      }

      setReport(runSqlPractice(sqlEngine, problem, code));
      return;
    }

    setReport(evaluatePython(problem, code));
  }

  function resetProblem() {
    setCodeByProblem((current) => ({ ...current, [problem.id]: problem.starter }));
    setReport(null);
    setRevealedHints((current) => ({ ...current, [problem.id]: 0 }));
  }

  function resetTimer() {
    setTimeLeft(25 * 60);
  }

  function tryAgain() {
    setReport(null);
  }

  function revealHint() {
    setRevealedHints((current) => ({
      ...current,
      [problem.id]: Math.min(problem.hints.length, (current[problem.id] ?? 0) + 1)
    }));
  }

  return (
    <main className={styles.practiceShell}>
      <section className={styles.topbar} aria-label="Assessment controls">
        <div className={styles.identity}>
          <span className={styles.logo}>
            <TerminalSquare size={21} />
          </span>
          <div>
            <p>Technical Assessment</p>
            <h1>SQL + Python Interview Pad</h1>
          </div>
        </div>

        <div className={styles.assessmentStats}>
          <div>
            <Clock3 size={18} />
            <span>20-25 min</span>
          </div>
          <div>
            <Database size={18} />
            <span>Runnable SQLite datasets</span>
          </div>
          <div>
            <FileCode2 size={18} />
            <span>Python logic review</span>
          </div>
        </div>

        <div className={styles.timerBox}>
          <Timer size={18} />
          <strong>{formatTime(timeLeft)}</strong>
          <button type="button" onClick={resetTimer} aria-label="Reset timer">
            <RefreshCw size={15} />
          </button>
        </div>
      </section>

      <section className={styles.workspace}>
        <aside className={styles.promptRail} aria-label="Practice prompts">
          <div className={styles.languageSwitch} aria-label="Language">
            <button type="button" className={language === "sql" ? styles.active : ""} onClick={() => selectLanguage("sql")}>
              <Database size={16} />
              SQL
            </button>
            <button type="button" className={language === "python" ? styles.active : ""} onClick={() => selectLanguage("python")}>
              <FileCode2 size={16} />
              Python
            </button>
          </div>

          <div className={styles.problemList}>
            {visibleProblems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={item.id === problem.id ? styles.selectedProblem : ""}
                onClick={() => {
                  setProblemId(item.id);
                  setReport(null);
                }}
              >
                <span>{item.language}</span>
                <b>{item.title}</b>
                <small>{item.focus}</small>
              </button>
            ))}
          </div>

          {isSqlProblem(problem) && (
            <div className={styles.schemaPanel}>
              <div className={styles.sectionTitle}>
                <Table2 size={16} />
                <span>Dataset tables</span>
              </div>
              {problem.tables.map((table) => (
                <details key={table.name} open>
                  <summary>{table.name}</summary>
                  <ul>
                    {table.columns.map((column) => (
                      <li key={column}>{column}</li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          )}
        </aside>

        <section className={styles.mainColumn}>
          <div className={styles.problemHeader}>
            <div>
              <p>{problem.focus}</p>
              <h2>{problem.title}</h2>
            </div>
            <div className={styles.progressRing} style={{ "--progress": `${progress}%` } as CSSProperties}>
              <span>{progress}%</span>
            </div>
          </div>

          <div className={styles.promptBox}>
            <Search size={18} />
            <p>{problem.prompt}</p>
          </div>

          {isSqlProblem(problem) && (
            <div className={styles.dataPreview}>
              {problem.tables.map((table) => (
                <details key={table.name}>
                  <summary>
                    {table.name} <span>{table.rows.length} rows</span>
                  </summary>
                  <ResultTable result={{ columns: table.columns, rows: table.rows }} />
                </details>
              ))}
            </div>
          )}

          <div className={styles.editorToolbar}>
            <div>
              <SplitSquareHorizontal size={17} />
              <span>{language === "sql" ? (sqlEngine ? "SQLite ready" : "Loading SQLite") : "Python 3"}</span>
            </div>
            <div className={styles.editorActions}>
              <button type="button" onClick={resetProblem}>
                <RotateCcw size={15} />
                Reset
              </button>
              <button type="button" className={styles.runButton} onClick={runPractice}>
                <Play size={15} />
                {language === "sql" ? "Run SQL" : "Run checks"}
              </button>
            </div>
          </div>

          <label className={styles.editorLabel} htmlFor="practice-editor">
            {language === "sql" ? "Write your SQL query from scratch" : "Solution editor"}
          </label>
          <div className={styles.editor} aria-label={language === "sql" ? "Write your SQL query from scratch" : "Solution editor"}>
            <CodeMirror
              id="practice-editor"
              basicSetup={{
                autocompletion: true,
                bracketMatching: true,
                closeBrackets: true,
                foldGutter: true,
                highlightActiveLine: true,
                highlightActiveLineGutter: true,
                highlightSelectionMatches: true,
                lineNumbers: true
              }}
              extensions={editorExtensions}
              height="100%"
              theme="dark"
              value={code}
              onChange={(value) => {
                setCodeByProblem((current) => ({ ...current, [problem.id]: value }));
                setReport(null);
              }}
            />
          </div>
          <textarea
            className={styles.hiddenEditorValue}
            readOnly
            value={code}
            aria-hidden="true"
            tabIndex={-1}
          />
        </section>

        <aside className={styles.outputRail} aria-label="Run output and notes">
          <section className={styles.outputPanel}>
            <div className={styles.sectionTitle}>
              <ListChecks size={16} />
              <span>{language === "sql" ? "SQL grader" : "Interview rubric"}</span>
            </div>
            <ul className={styles.checkList}>
              {problem.checks.map((check) => {
                const passed = report?.passed.includes(check);
                const missed = report?.missed.includes(check);
                return (
                  <li key={check} className={passed ? styles.pass : missed ? styles.miss : ""}>
                    <CheckCircle2 size={16} />
                    <span>{check}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className={styles.outputPanel}>
            <div className={styles.sectionTitle}>
              <Wand2 size={16} />
              <span>{language === "sql" ? "Result + feedback" : "Run output"}</span>
            </div>
            {report ? (
              <div className={`${styles.report} ${report.status === "correct" ? styles.correctReport : report.status === "error" ? styles.errorReport : styles.wrongReport}`}>
                <strong>{report.status === "correct" ? "Correct" : report.status === "error" ? "Error" : "Not quite"}</strong>
                <p>{report.message}</p>
                {report.detail && <code>{report.detail}</code>}
                {report.status !== "correct" && (
                  <div className={styles.feedbackActions}>
                    <button type="button" onClick={tryAgain}>
                      Try again
                    </button>
                    <button type="button" onClick={revealHint} disabled={(revealedHints[problem.id] ?? 0) >= problem.hints.length}>
                      Get a hint
                    </button>
                  </div>
                )}
                {report.userResult && (
                  <>
                    <span className={styles.resultLabel}>Your result</span>
                    <ResultTable result={report.userResult} />
                  </>
                )}
              </div>
            ) : (
              <div className={styles.emptyOutput}>
                <span>{language === "sql" ? "Run your query to see actual rows and grading feedback." : "Run checks to compare your answer against the interview signals."}</span>
              </div>
            )}
          </section>

          <section className={styles.outputPanel}>
            <div className={styles.sectionTitle}>
              <TerminalSquare size={16} />
              <span>{language === "sql" ? "Hints" : "Clarifying questions"}</span>
            </div>
            {visibleHints.length > 0 ? (
              <ul className={styles.hints}>
                {visibleHints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            ) : (
              <div className={styles.emptyHint}>Hints stay hidden until you ask for one.</div>
            )}
          </section>

          <section className={styles.notesPanel}>
            <label htmlFor="interview-notes">Scratchpad</label>
            <textarea
              id="interview-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Assumptions, edge cases, complexity, and what you would say aloud..."
            />
          </section>
        </aside>
      </section>
    </main>
  );
}
