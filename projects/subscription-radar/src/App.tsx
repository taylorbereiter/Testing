import { useEffect, useMemo, useState } from "react";
import { DEMO_CSV } from "./demo";
import { decodeBytes, dedupe, parseStatement } from "./engine/parse";
import { findRecurring, looksStopped } from "./engine/recur";
import type { CancelMethod, RecurringGroup, Txn } from "./engine/types";

const STORAGE_KEY = "subscription-radar/txns/v1";

const METHOD_LABEL: Record<CancelMethod, string> = {
  link: "Cancel online",
  apple: "Cancel in iPhone Settings",
  google: "Cancel in Google account",
  phone: "Cancel by phone",
  "in-person": "Cancel in person",
  bank: "Stop via your bank",
};

function nt(n: number): string {
  return `NT$${Math.round(n).toLocaleString("en-US")}`;
}

function loadTxns(): Txn[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function GroupCard({ g }: { g: RecurringGroup }) {
  const [open, setOpen] = useState(false);
  const stopped = looksStopped(g);
  const m = g.merchant;
  const title = m ? m.name : g.key;

  return (
    <div className={`card${stopped ? " stopped" : ""}`}>
      <button className="card-head" onClick={() => setOpen(!open)}>
        <div className="card-title">
          <span className="name">{title}</span>
          {m && m.name !== g.sampleDescription && <span className="raw">{g.sampleDescription}</span>}
        </div>
        <div className="card-cost">
          <span className="amount">{nt(g.monthlyCost)}</span>
          <span className="per">/月</span>
        </div>
      </button>
      <div className="card-meta">
        <span className="chip">{g.cadence}</span>
        <span className="chip">{nt(g.typicalAmount)} × {g.txns.length}</span>
        <span className="chip">last {g.lastDate}</span>
        {stopped ? (
          <span className="chip ok">no charge since {g.lastDate} — maybe already cancelled</span>
        ) : (
          <span className="chip">next ~{g.nextExpected}</span>
        )}
        {g.confidence < 0.6 && <span className="chip warn">low confidence</span>}
        {m?.isBill && <span className="chip bill">bill / 必要支出</span>}
      </div>
      {open && (
        <div className="card-body">
          {m?.cancel ? (
            <div className="cancel">
              <div className="cancel-method">{METHOD_LABEL[m.cancel.method]}</div>
              <p>{m.cancel.steps}</p>
              {m.cancel.url && (
                <a className="cancel-link" href={m.cancel.url} target="_blank" rel="noreferrer">
                  Open cancellation page →
                </a>
              )}
            </div>
          ) : m?.isBill ? (
            <p className="muted">This looks like a regular bill (utility/insurance), not an optional subscription.</p>
          ) : (
            <div className="cancel">
              <div className="cancel-method">Unknown merchant</div>
              <p>
                Try searching「{g.sampleDescription.trim()} 取消訂閱」. If you can't find the service, your bank
                can revoke this merchant's charging authorization — call the number on the back of your card and
                ask to stop 定期扣款 from this merchant.
              </p>
            </div>
          )}
          <table className="txn-table">
            <tbody>
              {[...g.txns].reverse().map((t, i) => (
                <tr key={i}>
                  <td>{t.date}</td>
                  <td className="desc">{t.description}</td>
                  <td className="amt">{nt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [txns, setTxns] = useState<Txn[]>(loadTxns);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  }, [txns]);

  const groups = useMemo(() => findRecurring(txns), [txns]);
  const active = groups.filter((g) => !looksStopped(g) && !g.merchant?.isBill);
  const bills = groups.filter((g) => !looksStopped(g) && g.merchant?.isBill);
  const stopped = groups.filter((g) => looksStopped(g));
  const monthlyTotal = active.reduce((s, g) => s + g.monthlyCost, 0);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const msgs: string[] = [];
    let added: Txn[] = [];
    for (const f of Array.from(files)) {
      const text = decodeBytes(await f.arrayBuffer());
      const { txns: parsed, warnings } = parseStatement(text, f.name);
      msgs.push(...warnings);
      if (parsed.length > 0) msgs.push(`${f.name}: imported ${parsed.length} expense rows.`);
      added = added.concat(parsed);
    }
    setTxns((prev) => dedupe([...prev, ...added]));
    setMessages(msgs);
  }

  function loadDemo() {
    const { txns: parsed } = parseStatement(DEMO_CSV, "demo");
    setTxns(dedupe(parsed));
    setMessages(["Loaded demo statement (fake data, Taiwan-style CSV)."]);
  }

  function clearAll() {
    setTxns([]);
    setMessages([]);
  }

  return (
    <div className="app">
      <header>
        <h1>📡 Subscription Radar</h1>
        <p className="tagline">Find what's quietly charging you every month — and how to make it stop.</p>
      </header>

      <section className="import">
        <label className="file-button">
          Import bank CSV（匯入交易明細）
          <input
            type="file"
            accept=".csv,.txt,.tsv,text/csv,text/plain"
            multiple
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        <div className="import-actions">
          <button className="ghost" onClick={loadDemo}>Try demo data</button>
          {txns.length > 0 && (
            <button className="ghost danger" onClick={clearAll}>Clear all data</button>
          )}
        </div>
        {messages.length > 0 && (
          <ul className="messages">
            {messages.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        )}
        <p className="privacy">
          🔒 Everything runs on this device. Your statements are never uploaded anywhere.
        </p>
      </section>

      {txns.length > 0 && (
        <section className="summary">
          <div className="total">
            <span className="total-amount">{nt(monthlyTotal)}</span>
            <span className="total-label">per month in subscriptions ({active.length} active)</span>
          </div>
          <p className="muted">
            ≈ {nt(monthlyTotal * 12)} per year · from {txns.length} imported expense rows
          </p>
        </section>
      )}

      {active.length > 0 && (
        <section>
          <h2>Recurring subscriptions</h2>
          {active.map((g) => (
            <GroupCard key={g.key + g.typicalAmount} g={g} />
          ))}
        </section>
      )}

      {bills.length > 0 && (
        <section>
          <h2>Regular bills（固定帳單）</h2>
          {bills.map((g) => (
            <GroupCard key={g.key + g.typicalAmount} g={g} />
          ))}
        </section>
      )}

      {stopped.length > 0 && (
        <section>
          <h2>Possibly already stopped</h2>
          {stopped.map((g) => (
            <GroupCard key={g.key + g.typicalAmount} g={g} />
          ))}
        </section>
      )}

      {txns.length > 0 && groups.length === 0 && (
        <p className="muted">
          No recurring charges detected yet. Import a longer date range (3+ months works best) so patterns can repeat.
        </p>
      )}

      <footer>
        <p className="muted">
          Tip: export 3–12 months of history from your bank's web banking（交易明細查詢 → 下載 CSV）for both
          accounts and import all the files — duplicates are removed automatically.
        </p>
      </footer>
    </div>
  );
}
