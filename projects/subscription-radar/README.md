# Subscription Radar 📡

Find recurring charges hiding in your (Taiwanese) bank statements and get a
concrete path to cancel each one. Built for personal use with Taiwan
Cooperative Bank (合作金庫) and Cathay United Bank (國泰世華) CSV exports, but
the parser is format-flexible.

**Privacy model:** 100% client-side. Statements are parsed in the browser and
stored only in `localStorage` on your device. Nothing is uploaded.

## How it works

1. Export 3–12 months of transaction history from web banking
   (交易明細查詢 → 下載/匯出 CSV) — works with Big5, UTF-8, or UTF-16 encodings,
   ROC (民國) or Gregorian dates, Chinese or English column headers.
2. Import the file(s). Deposits are ignored; duplicates are removed.
3. The engine groups expenses by normalized merchant key (language-agnostic),
   clusters by amount (so one `APPLE.COM/BILL` biller splits into its separate
   subscriptions), and flags streams that recur weekly/monthly/quarterly/yearly
   at consistent amounts.
4. Each detected subscription shows its monthly cost and a cancellation path
   from a built-in merchant database (direct cancel links, iPhone Settings
   deep-link for Apple subs, phone numbers for telecoms, etc.). Utilities and
   insurance are listed separately as "bills", not cancellable subscriptions.

## Run

```sh
npm install
npm run dev      # local dev server
npm test         # engine tests (parser, normalizer, recurrence detection)
npm run build    # static build in dist/
```

## Use on iPhone

Deploy `dist/` to any static host (GitHub Pages workflow included at the repo
root), open it in Safari, then Share → **Add to Home Screen**. It runs
standalone like a native app.
