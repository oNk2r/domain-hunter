export interface ScannedEvidence {
  id: string;
  title: string;
  location: string;
  observation: string;
  tag: string;
  tagType: "error" | "warning" | "info" | "success";
  imageUrl?: string;
  type: "fake_login" | "obfuscated_js" | "stolen_assets" | "mx_disposable";
}

export interface TimelineEvent {
  id: string;
  time: string;
  type: string;
  description: string;
  riskLevel: "error" | "primary" | "warning" | "success";
  icon: string;
}

export interface InvestigatedDomain {
  id: string;
  domainName: string;
  status: "SUSPICIOUS" | "LEGITIMATE" | "INVESTIGATING";
  confidence: number;
  ip: string;
  regDate: string;
  evidenceCount: number;
  owner?: string;
  registrar: string;
  sslValid: boolean;
  sslIssuer?: string;
  phishingScore: number;
  highlight?: string;
  supportingEvidence: string[];
  contradictoryEvidence: string[];
  evidences: ScannedEvidence[];
  timeline: TimelineEvent[];
}

export interface InvestigationCase {
  id: string;
  brandName: string;
  primaryDomain: string;
  targetId: string;
  threatLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  elapsed: string;
  currentStep: number; // 0 to 4 (Discovery, Triage, Web Investigation, Evidence Extractor, Verdict)
  stats: {
    totalFound: number;
    actionRequired: number;
    likelyLegit: number;
    suspicious: number;
  };
  domains: InvestigatedDomain[];
  liveLogs: string[];
}

export const INITIAL_CASE: InvestigationCase = {
  id: "case_acme_092",
  brandName: "ACME CORP",
  primaryDomain: "acmecorp.com",
  targetId: "ACME_CORP_092",
  threatLevel: "MODERATE",
  elapsed: "00:14:42",
  currentStep: 2, // Web Investigation active
  stats: {
    totalFound: 54,
    actionRequired: 12,
    likelyLegit: 38,
    suspicious: 4,
  },
  domains: [
    {
      id: "dom-1",
      domainName: "acme-corp-login-secure.net",
      status: "SUSPICIOUS",
      confidence: 94,
      ip: "192.168.1.100",
      regDate: "2 DAYS AGO",
      evidenceCount: 12,
      registrar: "Bulletproof Domains LLC (Panama)",
      sslValid: false,
      sslIssuer: "Self-Signed / Untrusted Root",
      phishingScore: 96,
      highlight: "Direct replica of internal Single Sign-On portal targeting enterprise credentials.",
      supportingEvidence: [
        "SSL Certificate is self-signed, invalid for target brand domain.",
        "MX records point to disposable email relay service (proton-relay.ru).",
        "DOM structure matches 98.4% of legitimate ACME Okta login template.",
        "Obfuscated JavaScript payload detected exfiltrating credentials to C2 server."
      ],
      contradictoryEvidence: [
        "IP block belongs to Cloudflare reverse-proxy edge node (traffic masked).",
        "No known historical ransomware hash matches in current payload."
      ],
      evidences: [
        {
          id: "ev-1",
          title: "Suspicious Login Form Replica",
          location: "/login.php?auth=enterprise",
          observation: "Exact visual clone of ACME enterprise login with hijacked SVG logos and credential harvester endpoint.",
          tag: "FAKED LOGO",
          tagType: "error",
          type: "fake_login"
        },
        {
          id: "ev-2",
          title: "Obfuscated Exfiltration Script",
          location: "/assets/js/main.js",
          observation: "Hex-encoded keylogger payload intercepting keystrokes on password inputs before form submit.",
          tag: "MALICIOUS SCRIPT",
          tagType: "warning",
          type: "obfuscated_js"
        },
        {
          id: "ev-3",
          title: "Brand Asset Copyright Theft",
          location: "/cdn/branding/acme-lockup.png",
          observation: "Stolen vector brand assets pulled directly from corporate styleguide.",
          tag: "BRAND INFRINGEMENT",
          tagType: "info",
          type: "stolen_assets"
        }
      ],
      timeline: [
        {
          id: "tl-1",
          time: "10:05 AM",
          type: "HIGH RISK",
          description: "Domain registered anonymously via known bulletproof host in offshore jurisdiction.",
          riskLevel: "error",
          icon: "warning"
        },
        {
          id: "tl-2",
          time: "10:15 AM",
          type: "SCAN RUN",
          description: "Port scan reveals open ports 80, 443, 2222. Standard credential harvesting deployment.",
          riskLevel: "primary",
          icon: "search"
        },
        {
          id: "tl-3",
          time: "10:20 AM",
          type: "ANALYSIS",
          description: "DOM similarity engine calculated 94.2% match against legitimate ACME employee login.",
          riskLevel: "warning",
          icon: "rule"
        },
        {
          id: "tl-4",
          time: "10:28 AM",
          type: "EVIDENCE SEALED",
          description: "Captured immutable DOM snapshot, HAR network bundle, and SHA256 checksums.",
          riskLevel: "success",
          icon: "verified_user"
        }
      ]
    },
    {
      id: "dom-2",
      domainName: "support-acmecorp.com",
      status: "SUSPICIOUS",
      confidence: 88,
      ip: "HIDDEN (Proxied)",
      regDate: "5 DAYS AGO",
      evidenceCount: 8,
      registrar: "NameCheap Inc. / Withheld for Privacy",
      sslValid: true,
      sslIssuer: "Let's Encrypt Authority X3",
      phishingScore: 88,
      highlight: "Fake customer support ticket desk requesting user 2FA backup codes.",
      supportingEvidence: [
        "Unregistered brand sub-affiliate requesting elevated OTP codes.",
        "Contains spoofed Zendesk webhook listener sending data to telegram bot.",
        "Registered with anonymous crypto payment gateway."
      ],
      contradictoryEvidence: [
        "Valid Let's Encrypt SSL certificate configured.",
        "Uses legitimate Google Analytics tracking tag ID."
      ],
      evidences: [
        {
          id: "ev-21",
          title: "Support Ticket Clone",
          location: "/ticket/verify-identity",
          observation: "Asks user for SMS 2FA code under the guise of an urgent account unlock request.",
          tag: "2FA HARVESTER",
          tagType: "error",
          type: "fake_login"
        }
      ],
      timeline: [
        {
          id: "tl-21",
          time: "09:30 AM",
          type: "TRIAGE FLAG",
          description: "Identified domain via newly registered Certificate Transparency logs.",
          riskLevel: "warning",
          icon: "radar"
        },
        {
          id: "tl-22",
          time: "09:45 AM",
          type: "SCRIPT EXTRACTION",
          description: "Extracted Telegram Bot API token embedded in client-side webhook dispatcher.",
          riskLevel: "error",
          icon: "code"
        }
      ]
    },
    {
      id: "dom-3",
      domainName: "acmecorp.com",
      status: "LEGITIMATE",
      confidence: 99,
      ip: "104.26.12.33",
      regDate: "1998 (28 YEARS)",
      evidenceCount: 0,
      owner: "ACME INC. (VERIFIED)",
      registrar: "MarkMonitor Inc.",
      sslValid: true,
      sslIssuer: "DigiCert Global Root CA (EV)",
      phishingScore: 0,
      highlight: "Verified authoritative primary apex domain owned by ACME Inc.",
      supportingEvidence: [],
      contradictoryEvidence: [
        "Authoritative DNSSEC verified keys matched.",
        "Extended Validation SSL certificate issued to ACME Inc.",
        "WHOIS record matches official corporate registry."
      ],
      evidences: [],
      timeline: [
        {
          id: "tl-31",
          time: "10:00 AM",
          type: "BASELINE ESTABLISHED",
          description: "Authoritative brand fingerprint baseline generated from apex DNS & SSL.",
          riskLevel: "success",
          icon: "check"
        }
      ]
    },
    {
      id: "dom-4",
      domainName: "acmecorp-internal.com",
      status: "INVESTIGATING",
      confidence: 45,
      ip: "172.67.189.44",
      regDate: "18 DAYS AGO",
      evidenceCount: 2,
      registrar: "GoDaddy.com LLC",
      sslValid: true,
      sslIssuer: "Cloudflare Inc ECC CA-3",
      phishingScore: 45,
      highlight: "Active crawler extracting scripts and comparing against brand lexicon.",
      supportingEvidence: [
        "Unrecognized domain parking page with sponsored links targeting ACME competitors."
      ],
      contradictoryEvidence: [
        "Currently resolving to parked lander without active credential input fields."
      ],
      evidences: [
        {
          id: "ev-41",
          title: "Parked Monetization Lander",
          location: "/index.html",
          observation: "Ad-farm parking page intercepting typo traffic for ACME brand keywords.",
          tag: "TYPOSQUATTING",
          tagType: "warning",
          type: "stolen_assets"
        }
      ],
      timeline: [
        {
          id: "tl-41",
          time: "10:14 AM",
          type: "DISCOVERY",
          description: "Detected typosquat variance in global DNS buffer.",
          riskLevel: "primary",
          icon: "search"
        }
      ]
    }
  ],
  liveLogs: [
    "> INIT SEQUENCE STARTED...",
    "> ESTABLISHING CONNECTION TO OSINT REGISTRIES...",
    "> CONNECTION SECURED [200 OK].",
    "> SKILL LOADED: WEB_INVESTIGATION_V2",
    "> CRAWLING HOMEPAGE HTML DOM...",
    "> FOUND 12 SUSPICIOUS SCRIPT TAGS.",
    "> MCP CONNECTOR: CERTIFICATE_TRANSPARENCY_STREAM [ACTIVE]",
    "> WARNING: DOMAIN REGISTRATION MISMATCH DETECTED.",
    "> ANALYZING SSL CERTIFICATE FINGERPRINT...",
    "> EXTRACTED ASSET HASHES: 94.2% OVERLAP WITH BRAND ASSETS.",
    "> CROSS-CHECKING AGAINST PASSIVE DNS HISTORIES...",
    "> DETECTED TELEGRAM BOT EXFILTRATION WEBHOOK.",
    "> HAR RECORDING SAVED TO EVIDENCE VAULT.",
    "> GENERATING HEURISTIC THREAT REPORT [CONFIDENCE 94%]...",
    "> READY FOR HUMAN AUTHORIZATION DISPATCH."
  ]
};

export const PAST_ARCHIVES = [
  {
    id: "case_paypal_041",
    brandName: "PayPal",
    targetDomain: "paypal-auth-verify-security.org",
    status: "TAKEDOWN DISPATCHED",
    date: "AUG 24, 2026",
    threatScore: 98,
    resolvedBy: "AGENT_007",
    findings: 18
  },
  {
    id: "case_stripe_088",
    brandName: "Stripe",
    targetDomain: "dashboard-stripe-payouts.net",
    status: "DISMANTLED / OFFLINE",
    date: "AUG 22, 2026",
    threatScore: 95,
    resolvedBy: "AGENT_007",
    findings: 14
  },
  {
    id: "case_netflix_012",
    brandName: "Netflix",
    targetDomain: "update-netflix-billing-account.co",
    status: "REGISTRAR SUSPENDED",
    date: "AUG 19, 2026",
    threatScore: 91,
    resolvedBy: "AGENT_007",
    findings: 9
  },
  {
    id: "case_github_004",
    brandName: "GitHub",
    targetDomain: "github-enterprise-token-reset.com",
    status: "BLOCKED VIA DNS",
    date: "AUG 15, 2026",
    threatScore: 96,
    resolvedBy: "AGENT_007",
    findings: 22
  }
];

export function generateDynamicInvestigation(brandName: string): InvestigationCase {
  const cleanBrand = brandName.trim().toUpperCase() || "BRAND";
  const slug = cleanBrand.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const randomId = Math.floor(100 + Math.random() * 900);

  return {
    id: `case_${slug}_${randomId}`,
    brandName: cleanBrand,
    primaryDomain: `${slug}.com`,
    targetId: `${cleanBrand.replace(/\s+/g, "_")}_${randomId}`,
    threatLevel: "HIGH",
    elapsed: "00:06:18",
    currentStep: 2,
    stats: {
      totalFound: 36 + Math.floor(Math.random() * 30),
      actionRequired: 8 + Math.floor(Math.random() * 10),
      likelyLegit: 24 + Math.floor(Math.random() * 15),
      suspicious: 3 + Math.floor(Math.random() * 5),
    },
    domains: [
      {
        id: `dom-${slug}-1`,
        domainName: `${slug}-login-auth-portal.net`,
        status: "SUSPICIOUS",
        confidence: 96,
        ip: "185.220.101.5",
        regDate: "1 DAY AGO",
        evidenceCount: 14,
        registrar: "TjDomain Privacy Guardian / Seychelles",
        sslValid: false,
        sslIssuer: "Self-Signed PhishCert v1",
        phishingScore: 97,
        highlight: `Exact visual clone of ${cleanBrand} authentication gateway targeting single sign-on credentials.`,
        supportingEvidence: [
          `Self-signed SSL certificate impersonating ${cleanBrand} corporate authority.`,
          "Form submission redirects directly to offshore payload collector endpoint.",
          "Image assets scraped directly from the official corporate website.",
          "WHOIS records shielded behind anonymous offshore proxy."
        ],
        contradictoryEvidence: [
          "CDN routing masked through major global edge network.",
          "No registered malware binaries in VirusTotal database yet."
        ],
        evidences: [
          {
            id: `ev-${slug}-1`,
            title: `Fake ${cleanBrand} SSO Screen`,
            location: "/login?redirect=portal",
            observation: `Spoofed corporate login form mimicking ${cleanBrand} typography, colors, and button styling.`,
            tag: "PHISHING FORM",
            tagType: "error",
            type: "fake_login"
          },
          {
            id: `ev-${slug}-2`,
            title: "Credential Scraper Payload",
            location: "/static/auth-hook.js",
            observation: "Obfuscated script sending cleartext password inputs to external webhook server.",
            tag: "MALICIOUS CODE",
            tagType: "warning",
            type: "obfuscated_js"
          }
        ],
        timeline: [
          {
            id: `tl-${slug}-1`,
            time: "10:02 AM",
            type: "DISCOVERY",
            description: `Identified new domain matching brand pattern [${cleanBrand}*].`,
            riskLevel: "warning",
            icon: "radar"
          },
          {
            id: `tl-${slug}-2`,
            time: "10:05 AM",
            type: "ACTIVE PROBE",
            description: "Completed headless browser rendering & DOM structural comparison.",
            riskLevel: "primary",
            icon: "biotech"
          },
          {
            id: `tl-${slug}-3`,
            time: "10:08 AM",
            type: "VERDICT REACHED",
            description: "High-confidence brand impersonation confirmed. Evidence sealed.",
            riskLevel: "error",
            icon: "gavel"
          }
        ]
      },
      {
        id: `dom-${slug}-2`,
        domainName: `verify-${slug}-account.co`,
        status: "SUSPICIOUS",
        confidence: 89,
        ip: "91.218.245.12",
        regDate: "3 DAYS AGO",
        evidenceCount: 7,
        registrar: "NameSilo LLC / Privacy Protected",
        sslValid: true,
        sslIssuer: "ZeroSSL RSA Domain CA",
        phishingScore: 89,
        highlight: `Phishing lure email landing page claiming ${cleanBrand} accounts require urgent verification.`,
        supportingEvidence: [
          `Urgency trigger claiming user ${cleanBrand} account will be suspended in 24 hours.`,
          "Harvests credit card information and billing addresses.",
          "Domain was registered in the last 72 hours."
        ],
        contradictoryEvidence: [
          "Uses standard ZeroSSL domain certificate.",
          "Hosted on standard shared hosting platform."
        ],
        evidences: [
          {
            id: `ev-${slug}-21`,
            title: "Urgent Verification Lure",
            location: "/verify/card-billing",
            observation: `Requests user full payment details to 'verify' ${cleanBrand} subscription status.`,
            tag: "BILLING HARVESTER",
            tagType: "error",
            type: "fake_login"
          }
        ],
        timeline: [
          {
            id: `tl-${slug}-21`,
            time: "09:50 AM",
            type: "TRIAGE FLAG",
            description: "Surfaced via brand keyword monitoring telemetry.",
            riskLevel: "warning",
            icon: "search"
          }
        ]
      },
      {
        id: `dom-${slug}-3`,
        domainName: `${slug}.com`,
        status: "LEGITIMATE",
        confidence: 99,
        ip: "104.18.22.189",
        regDate: "2004",
        evidenceCount: 0,
        owner: `${cleanBrand} INC.`,
        registrar: "MarkMonitor Inc.",
        sslValid: true,
        sslIssuer: "DigiCert Global Root G2",
        phishingScore: 0,
        highlight: `Official verified corporate home of ${cleanBrand}.`,
        supportingEvidence: [],
        contradictoryEvidence: [
          "Authoritative DNS and official brand trademark registered.",
          "Extended Validation certificates present."
        ],
        evidences: [],
        timeline: [
          {
            id: `tl-${slug}-31`,
            time: "09:40 AM",
            type: "AUTHORITATIVE MATCH",
            description: `Apex domain verified as genuine ${cleanBrand} property.`,
            riskLevel: "success",
            icon: "verified"
          }
        ]
      },
      {
        id: `dom-${slug}-4`,
        domainName: `${slug}-security-updates.org`,
        status: "INVESTIGATING",
        confidence: 52,
        ip: "172.64.80.12",
        regDate: "12 DAYS AGO",
        evidenceCount: 3,
        registrar: "Porkbun LLC",
        sslValid: true,
        sslIssuer: "Let's Encrypt",
        phishingScore: 52,
        highlight: "Pending automated sandbox crawler execution.",
        supportingEvidence: [
          "New domain using brand name without verified corporate DNS record."
        ],
        contradictoryEvidence: [
          "Page currently displays a 'Under Construction' placeholder."
        ],
        evidences: [],
        timeline: [
          {
            id: `tl-${slug}-41`,
            time: "10:11 AM",
            type: "DISCOVERY",
            description: "Queued for periodic behavioral re-crawl.",
            riskLevel: "primary",
            icon: "sync"
          }
        ]
      }
    ],
    liveLogs: [
      `> SCAN INITIATED FOR BRAND: ${cleanBrand}...`,
      "> QUERYING GLOBAL CERTIFICATE TRANSPARENCY LOGS...",
      `> FILTERED 14,820 CANDIDATE DOMAINS DOWN TO ACTIVE [${cleanBrand}*] VARIANTS...`,
      "> DISPATCHING DEEP CRAWLER TO SUSPICIOUS HOSTS...",
      "> DOMAIN: " + `${slug}-login-auth-portal.net` + " IDENTIFIED AS HIGH THREAT.",
      "> EXTRACTED FAKE LOGIN DOM WITH EMBEDDED HARVESTER.",
      "> SEALING EVIDENCE BUNDLE & HASH INTEGRITY...",
      "> THREAT CONFIDENCE SCORE: 96% (CRITICAL SUSPICIOUS).",
      "> CASE GENERATED AND READY FOR OPERATOR REVIEW."
    ]
  };
}
