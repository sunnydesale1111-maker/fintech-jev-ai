import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Sparkles,
  Activity,
  Gauge,
  ClipboardList,
  ArrowRight,
  ArrowDown,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentinel AI — Transaction Decision Engine" },
      {
        name: "description",
        content:
          "AI-assisted transaction decisioning prototype for fintech risk teams: approve, review, or block card/UPI transactions with confidence scores and reasons.",
      },
      { property: "og:title", content: "Sentinel AI — Transaction Decision Engine" },
      {
        property: "og:description",
        content:
          "AI-assisted transaction decisioning prototype for fintech risk teams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DecisionEngine,
});

// ---------- Types & logic (simulated AI decision model — product concept only) ----------

type Decision = "APPROVE" | "REVIEW" | "BLOCK";

interface TxnInput {
  amount: number;
  category: string;
  usualAmount: number;
  location: string;
  device: "known" | "new";
  frequency: "normal" | "unusual";
  time: string;
}

interface Analysis {
  decision: Decision;
  confidence: number;
  risk: "Low" | "Medium" | "High";
  reasons: string[];
  action: string;
}

const CATEGORIES = [
  "Groceries & Essentials",
  "Dining & Food Delivery",
  "Travel & Fuel",
  "Electronics",
  "Jewellery & Luxury",
  "Money Transfer / P2P",
  "Gaming & Betting",
  "Healthcare",
];

const LOCATIONS = ["Usual city", "Other Indian city", "International"];

function analyze(t: TxnInput): Analysis {
  let riskScore = 0;
  const reasons: { score: number; text: string }[] = [];

  const multiple = t.usualAmount > 0 ? t.amount / t.usualAmount : 1;

  if (multiple > 20 || t.amount >= 100000) {
    riskScore += 45;
    reasons.push({
      score: 45,
      text: `Amount ₹${t.amount.toLocaleString("en-IN")} is far above the user's usual ₹${t.usualAmount.toLocaleString("en-IN")} pattern`,
    });
  } else if (multiple > 8 || t.amount >= 40000) {
    riskScore += 28;
    reasons.push({
      score: 28,
      text: `Amount is ${multiple.toFixed(1)}× the user's typical transaction size`,
    });
  } else {
    reasons.push({
      score: 0,
      text: "Amount is consistent with the user's historical spending pattern",
    });
  }

  if (t.device === "new") {
    riskScore += 25;
    reasons.push({ score: 25, text: "Transaction originates from an unrecognized device" });
  } else {
    reasons.push({ score: 0, text: "Device fingerprint matches a known, trusted device" });
  }

  if (t.frequency === "unusual") {
    riskScore += 22;
    reasons.push({ score: 22, text: "Transaction frequency is unusual for this account in the recent window" });
  }

  if (t.location === "International") {
    riskScore += 18;
    reasons.push({ score: 18, text: "Location is outside the user's usual geography" });
  } else if (t.location === "Other Indian city") {
    riskScore += 8;
    reasons.push({ score: 8, text: "Location differs from the user's home city" });
  }

  const hour = Number(t.time.split(":")[0]);
  if (hour >= 0 && hour < 5) {
    riskScore += 10;
    reasons.push({ score: 10, text: "Transaction occurs during low-activity night hours" });
  }

  if (["Money Transfer / P2P", "Gaming & Betting", "Jewellery & Luxury"].includes(t.category)) {
    riskScore += 10;
    reasons.push({ score: 10, text: `Merchant category "${t.category}" carries elevated fraud rates` });
  }

  let decision: Decision;
  if (riskScore < 30) decision = "APPROVE";
  else if (riskScore < 60) decision = "REVIEW";
  else decision = "BLOCK";

  const distanceFromThreshold =
    decision === "APPROVE" ? 30 - riskScore : decision === "REVIEW" ? Math.min(riskScore - 30, 60 - riskScore) : riskScore - 60;
  const confidence = Math.min(99, Math.max(62, Math.round(78 + distanceFromThreshold * 1.4)));

  const risk = riskScore < 30 ? "Low" : riskScore < 60 ? "Medium" : "High";

  const topReasons = reasons
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.text);

  const action =
    decision === "APPROVE"
      ? "Process transaction immediately — no friction added to the customer journey."
      : decision === "REVIEW"
        ? "Send for manual verification — request step-up authentication (OTP / call) before processing."
        : "Block transaction and notify the customer via push + SMS with an option to dispute.";

  return { decision, confidence, risk, reasons: topReasons, action };
}

const PRESETS: { label: string; description: string; value: TxnInput }[] = [
  {
    label: "A · Everyday spend",
    description: "₹800 · known device · usual location",
    value: {
      amount: 800,
      category: "Groceries & Essentials",
      usualAmount: 1200,
      location: "Usual city",
      device: "known",
      frequency: "normal",
      time: "13:30",
    },
  },
  {
    label: "B · Large purchase",
    description: "₹45,000 · new device · other city",
    value: {
      amount: 45000,
      category: "Electronics",
      usualAmount: 2000,
      location: "Other Indian city",
      device: "new",
      frequency: "normal",
      time: "16:10",
    },
  },
  {
    label: "C · High-risk burst",
    description: "₹1,20,000 · unusual frequency · new device",
    value: {
      amount: 120000,
      category: "Money Transfer / P2P",
      usualAmount: 1500,
      location: "International",
      device: "new",
      frequency: "unusual",
      time: "02:45",
    },
  },
];

// ---------- UI ----------

const decisionStyles: Record<
  Decision,
  { bg: string; ring: string; text: string; icon: typeof ShieldCheck; label: string }
> = {
  APPROVE: {
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    text: "text-emerald-700",
    icon: ShieldCheck,
    label: "Approve",
  },
  REVIEW: {
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    text: "text-amber-700",
    icon: ShieldAlert,
    label: "Flag for Review",
  },
  BLOCK: {
    bg: "bg-red-50",
    ring: "ring-red-200",
    text: "text-red-700",
    icon: ShieldX,
    label: "Block",
  },
};

const inputCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25";

function DecisionEngine() {
  const [txn, setTxn] = useState<TxnInput>(PRESETS[0].value);
  const [result, setResult] = useState<Analysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [stats, setStats] = useState({ total: 0, approved: 0, review: 0, blocked: 0 });

  const runAnalysis = () => {
    setAnalyzing(true);
    setResult(null);
    window.setTimeout(() => {
      const r = analyze(txn);
      setResult(r);
      setStats((s) => ({
        total: s.total + 1,
        approved: s.approved + (r.decision === "APPROVE" ? 1 : 0),
        review: s.review + (r.decision === "REVIEW" ? 1 : 0),
        blocked: s.blocked + (r.decision === "BLOCK" ? 1 : 0),
      }));
      setAnalyzing(false);
    }, 900);
  };

  const pctApproved = useMemo(
    () => (stats.total ? Math.round((stats.approved / stats.total) * 100) : 0),
    [stats],
  );
  const pctReview = useMemo(
    () => (stats.total ? Math.round((stats.review / stats.total) * 100) : 0),
    [stats],
  );

  const ds = result ? decisionStyles[result.decision] : null;
  const Icon = ds?.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-foreground">
                Sentinel AI Decision Engine
              </h1>
              <p className="text-xs text-muted-foreground">
                Real-time transaction risk decisioning · prototype
              </p>
            </div>
          </div>
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Risk Ops Console
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {/* PM metrics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            icon={<Activity className="h-4 w-4" />}
            label="Transactions analyzed"
            value={String(stats.total)}
          />
          <MetricCard
            icon={<Gauge className="h-4 w-4" />}
            label="% automatically approved"
            value={`${pctApproved}%`}
          />
          <MetricCard
            icon={<ClipboardList className="h-4 w-4" />}
            label="% sent for manual review"
            value={`${pctReview}%`}
          />
        </section>

        {/* Presets */}
        <section className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Examples
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setTxn(p.value);
                setResult(null);
              }}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:border-ring hover:bg-secondary"
              title={p.description}
            >
              {p.label}
              <span className="ml-1.5 text-muted-foreground">{p.description}</span>
            </button>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Input card */}
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-2">
            <h2 className="text-sm font-semibold text-foreground">Transaction Input</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter the transaction context for the model.
            </p>

            <div className="mt-5 space-y-4">
              <Field label="Transaction amount (₹)">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={txn.amount}
                  onChange={(e) => setTxn({ ...txn, amount: Number(e.target.value) })}
                />
              </Field>

              <Field label="Merchant category">
                <select
                  className={inputCls}
                  value={txn.category}
                  onChange={(e) => setTxn({ ...txn, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>

              <Field label="User's usual transaction amount (₹)">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={txn.usualAmount}
                  onChange={(e) => setTxn({ ...txn, usualAmount: Number(e.target.value) })}
                />
              </Field>

              <Field label="Transaction location">
                <select
                  className={inputCls}
                  value={txn.location}
                  onChange={(e) => setTxn({ ...txn, location: e.target.value })}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Device status">
                  <div className="flex rounded-lg border border-input p-1">
                    {(["known", "new"] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => setTxn({ ...txn, device: d })}
                        className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition ${
                          txn.device === d
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Frequency">
                  <div className="flex rounded-lg border border-input p-1">
                    {(["normal", "unusual"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setTxn({ ...txn, frequency: f })}
                        className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition ${
                          txn.frequency === f
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              <Field label="Time of transaction">
                <input
                  type="time"
                  className={inputCls}
                  value={txn.time}
                  onChange={(e) => setTxn({ ...txn, time: e.target.value })}
                />
              </Field>

              <button
                onClick={runAnalysis}
                disabled={analyzing}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
              >
                {analyzing ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze Transaction
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Output card */}
          <section className="lg:col-span-3">
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-foreground">AI Decision Output</h2>

              {!result && !analyzing && (
                <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <Sparkles className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground">No analysis yet</p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Fill in the transaction context or pick an example, then run the analysis.
                  </p>
                </div>
              )}

              {analyzing && (
                <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
                  <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-border border-t-primary" />
                  <p className="mt-4 text-sm font-medium text-foreground">Evaluating signals…</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Scoring amount deviation, device trust, frequency and geo-velocity.
                  </p>
                </div>
              )}

              {result && ds && Icon && (
                <div className="mt-4 flex flex-1 flex-col gap-4">
                  {/* Decision banner */}
                  <div
                    className={`flex items-center gap-4 rounded-xl px-5 py-4 ring-1 ${ds.bg} ${ds.ring}`}
                  >
                    <Icon className={`h-9 w-9 ${ds.text}`} />
                    <div className="flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Decision
                      </p>
                      <p className={`text-2xl font-bold tracking-tight ${ds.text}`}>
                        {result.decision}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Confidence
                      </p>
                      <p className="text-2xl font-bold tabular-nums text-foreground">
                        {result.confidence}%
                      </p>
                    </div>
                  </div>

                  {/* Confidence + risk */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs font-medium text-muted-foreground">Confidence score</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${result.confidence}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                        {result.confidence} / 100
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-xs font-medium text-muted-foreground">Risk level</p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          result.risk === "Low"
                            ? "bg-emerald-100 text-emerald-800"
                            : result.risk === "Medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.risk}
                      </span>
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      Top reasons behind this decision
                    </p>
                    <ul className="mt-2 space-y-2">
                      {result.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended action */}
                  <div className="rounded-lg border border-border bg-secondary/50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Recommended action
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">{result.action}</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Flow strip */}
        <section className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-5 sm:flex-row sm:gap-4">
          {["Transaction Context", "AI Decision", "Confidence", "Action"].map((step, i) => (
            <div key={step} className="flex items-center gap-2 sm:gap-4">
              {i > 0 && (
                <>
                  <ArrowRight className="hidden h-4 w-4 text-muted-foreground sm:block" />
                  <ArrowDown className="h-4 w-4 text-muted-foreground sm:hidden" />
                </>
              )}
              <span className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                {step}
              </span>
            </div>
          ))}
        </section>

        <footer className="space-y-1 pb-6 text-center">
          <p className="text-xs font-medium text-muted-foreground">
            AI-assisted decisioning — human review remains available for high-risk cases.
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            Prototype demonstrating a product concept. Decisions are simulated locally and are not a
            real fraud detection system or a Jev API integration.
          </p>
        </footer>
      </main>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
