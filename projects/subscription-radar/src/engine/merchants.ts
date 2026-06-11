import type { MerchantInfo } from "./types";

/**
 * Known merchants, matched as substrings against the normalized uppercase key.
 * Cancellation info is the heart of the app: every entry should tell the user
 * exactly where to go.
 */
export const MERCHANTS: MerchantInfo[] = [
  {
    id: "netflix",
    name: "Netflix",
    category: "streaming",
    patterns: ["NETFLIX"],
    cancel: {
      method: "link",
      url: "https://www.netflix.com/cancelplan",
      steps: "Sign in and confirm cancellation. If you subscribed through Apple, cancel in iPhone Settings → your name → Subscriptions instead.",
    },
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "music",
    patterns: ["SPOTIFY"],
    cancel: {
      method: "link",
      url: "https://www.spotify.com/account/subscription/",
      steps: "Account → Manage your plan → Change plan → Cancel Premium.",
    },
  },
  {
    id: "apple",
    name: "Apple (App Store / iCloud / Apple services)",
    category: "software",
    patterns: ["APPLE.COM/BILL", "APPLE.COM BILL", "ITUNES.COM", "APPLE SERVICES", "蘋果"],
    cancel: {
      method: "apple",
      url: "https://apps.apple.com/account/subscriptions",
      steps: "One Apple charge can hide several subscriptions. iPhone Settings → your name → Subscriptions lists every active one with its price — cancel there. iCloud storage is under Settings → your name → iCloud → Manage Storage.",
    },
  },
  {
    id: "google",
    name: "Google (Play / YouTube / Google One)",
    category: "software",
    patterns: ["GOOGLE YOUTUBE", "GOOGLE ONE", "GOOGLE PLAY", "GOOGLE STORAGE", "YOUTUBEPREMIUM", "YOUTUBE PREMIUM"],
    cancel: {
      method: "google",
      url: "https://play.google.com/store/account/subscriptions",
      steps: "Sign in with the Google account that pays. YouTube Premium can also be cancelled at youtube.com/paid_memberships.",
    },
  },
  {
    id: "disney",
    name: "Disney+",
    category: "streaming",
    patterns: ["DISNEY"],
    cancel: {
      method: "link",
      url: "https://www.disneyplus.com/account",
      steps: "Account → Subscription → Cancel subscription. In Taiwan Disney+ is sometimes bundled with a telecom plan — if so, cancel through the telecom instead.",
    },
  },
  {
    id: "kkbox",
    name: "KKBOX",
    category: "music",
    patterns: ["KKBOX"],
    cancel: {
      method: "link",
      url: "https://www.kkbox.com/my/",
      steps: "會員中心 (Member Center) → 帳務資訊 → cancel auto-renew (取消自動扣款). If subscribed via Apple/Google, cancel in that store's subscription page.",
    },
  },
  {
    id: "line",
    name: "LINE (Music / stickers / LINE Pay auto-charge)",
    category: "software",
    patterns: ["LINE MUSIC", "LINE PAY", "LINE TAXI", "LINEPAY"],
    cancel: {
      method: "link",
      steps: "In the LINE app: Settings → 服務 → check active subscriptions. LINE Pay auto-charges are under LINE Pay → 設定 → 自動扣款.",
    },
  },
  {
    id: "amazon",
    name: "Amazon (Prime / Kindle / Audible)",
    category: "shopping",
    patterns: ["AMAZON", "AMZN", "AUDIBLE", "KINDLE"],
    cancel: {
      method: "link",
      url: "https://www.amazon.com/yourmemberships",
      steps: "Your Account → Memberships & Subscriptions → End membership.",
    },
  },
  {
    id: "openai",
    name: "OpenAI / ChatGPT",
    category: "software",
    patterns: ["OPENAI", "CHATGPT"],
    cancel: {
      method: "link",
      url: "https://chatgpt.com/#settings",
      steps: "ChatGPT → Settings → Subscription → Manage → Cancel plan.",
    },
  },
  {
    id: "anthropic",
    name: "Anthropic / Claude",
    category: "software",
    patterns: ["ANTHROPIC", "CLAUDE.AI"],
    cancel: {
      method: "link",
      url: "https://claude.ai/settings/billing",
      steps: "Claude → Settings → Billing → Cancel subscription.",
    },
  },
  {
    id: "microsoft",
    name: "Microsoft 365 / Xbox / OneDrive",
    category: "software",
    patterns: ["MICROSOFT", "MSFT", "XBOX"],
    cancel: {
      method: "link",
      url: "https://account.microsoft.com/services",
      steps: "Services & subscriptions → Manage → Cancel.",
    },
  },
  {
    id: "adobe",
    name: "Adobe",
    category: "software",
    patterns: ["ADOBE"],
    cancel: {
      method: "link",
      url: "https://account.adobe.com/plans",
      steps: "Manage plan → Cancel plan. Watch out: annual plans cancelled mid-term charge an early-termination fee — cancelling within 14 days of renewal avoids it.",
    },
  },
  {
    id: "dropbox",
    name: "Dropbox",
    category: "software",
    patterns: ["DROPBOX"],
    cancel: {
      method: "link",
      url: "https://www.dropbox.com/account/plan",
      steps: "Plan → Cancel plan.",
    },
  },
  {
    id: "iqiyi",
    name: "iQIYI 愛奇藝",
    category: "streaming",
    patterns: ["IQIYI", "愛奇藝"],
    cancel: {
      method: "link",
      steps: "iQIYI app → 我的 → VIP會員 → 自動續費管理 → cancel auto-renew. If billed through Apple, use iPhone Settings → Subscriptions.",
    },
  },
  {
    id: "catchplay",
    name: "CATCHPLAY+",
    category: "streaming",
    patterns: ["CATCHPLAY"],
    cancel: {
      method: "link",
      url: "https://www.catchplay.com",
      steps: "會員帳戶 → 我的方案 → 取消自動續訂.",
    },
  },
  {
    id: "myvideo",
    name: "MyVideo (台灣大哥大)",
    category: "streaming",
    patterns: ["MYVIDEO"],
    cancel: {
      method: "link",
      steps: "MyVideo → 會員中心 → 帳務管理 → cancel auto-renew, or through Taiwan Mobile customer service if bundled with your phone plan.",
    },
  },
  {
    id: "cht",
    name: "Chunghwa Telecom 中華電信",
    category: "telecom",
    patterns: ["中華電信", "CHT", "HINET", "EMOME"],
    cancel: {
      method: "phone",
      steps: "Plan changes/cancellation: dial 123 from a Chunghwa line (or 0800-080-090), use the 中華電信 app, or visit any service center with ID. Note this charge may be your phone/internet bill rather than an optional subscription.",
    },
  },
  {
    id: "twm",
    name: "Taiwan Mobile 台灣大哥大",
    category: "telecom",
    patterns: ["台灣大哥大", "台灣大", "TWM TAIWAN MOBILE", "TAIWAN MOBILE"],
    cancel: {
      method: "phone",
      steps: "Dial 188 from a Taiwan Mobile line or visit a store with ID. Check the MyVideo / Disney+ add-ons on your plan — they're often the hidden recurring part.",
    },
  },
  {
    id: "fet",
    name: "FarEasTone 遠傳電信",
    category: "telecom",
    patterns: ["遠傳", "FAREASTONE", "FETNET"],
    cancel: {
      method: "phone",
      steps: "Dial 888 from a FarEasTone line, use the 遠傳行動客服 app, or visit a store with ID.",
    },
  },
  {
    id: "worldgym",
    name: "World Gym",
    category: "fitness",
    patterns: ["WORLD GYM", "WORLDGYM"],
    cancel: {
      method: "in-person",
      steps: "Go to your home branch in person with ID and your contract; written 30-day notice is usually required. If they stall, you can also revoke the card authorization at your bank (your statement is from the card side, so the bank can stop future charges).",
    },
  },
  {
    id: "fitnessfactory",
    name: "Fitness Factory 健身工廠",
    category: "fitness",
    patterns: ["健身工廠", "FITNESS FACTORY"],
    cancel: {
      method: "in-person",
      steps: "Visit your branch with ID to terminate the contract; check your contract for the notice period and any early-termination fee.",
    },
  },
  {
    id: "taipower",
    name: "Taipower 台灣電力 (electricity)",
    category: "utility",
    isBill: true,
    patterns: ["台灣電力", "台電", "電費"],
  },
  {
    id: "water",
    name: "Taiwan Water 台水 (water)",
    category: "utility",
    isBill: true,
    patterns: ["自來水", "台水", "水費"],
  },
  {
    id: "gas",
    name: "Gas 瓦斯",
    category: "utility",
    isBill: true,
    patterns: ["瓦斯", "欣欣天然氣", "大台北瓦斯"],
  },
  {
    id: "insurance",
    name: "Insurance 保險 (auto-pay premium)",
    category: "insurance",
    isBill: true,
    patterns: ["人壽", "保險", "產險", "保費"],
  },
];

export function matchMerchant(normalizedKey: string): MerchantInfo | undefined {
  for (const m of MERCHANTS) {
    for (const p of m.patterns) {
      if (normalizedKey.includes(p.toUpperCase())) return m;
    }
  }
  return undefined;
}
