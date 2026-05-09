import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight, Copy, Check, Loader2, Sparkles, Paperclip, X, ImageIcon,
  Sun, Moon, Plus, ExternalLink, Link as LinkIcon, ChevronDown,
  Mail, MessageSquare, FileText, Reply, Type, Image as ImgIcon,
  Target, Award, Briefcase, User, Layers, Wand2,
  TrendingUp, Trash2, HelpCircle, PenLine, Bot, Send, RotateCcw,
  ChevronUp
} from 'lucide-react';

/* ====================================================================== */
/* PLATFORM PATTERNS                                                      */
/* ====================================================================== */

const TOP_PERFORMER_PATTERNS = {
  portfolio: `
PATTERNS FROM TOP-PERFORMING FREELANCER PORTFOLIOS:
- Hero headline names ONE buyer + ONE outcome. Pattern: "[Action verb] [specific outcome] for [specific niche]."
- Subheadline adds the mechanism or the proof.
- Proof appears immediately, not buried.
- ONE primary CTA above the fold.
- About section uses first person, reads like a 30-second pitch.
- Case studies follow Problem, Approach, Result with named metrics.
- Social proof is specific (named clients, dollar figures), not abstract.
- Voice is human. Contractions. Short sentences.
`.trim(),

  sales: `
PATTERNS FROM TOP-PERFORMING SALES PAGES:
- Headline calls out the avatar and promises a specific outcome with a time frame.
- Subheadline reverses the most common objection.
- First 100 words establish: who this is for, what the outcome is, and why now.
- Pain section uses the reader's own internal language.
- Mechanism section names the unique method or framework.
- Proof appears 3+ times.
- Multiple CTAs throughout, usually 5-8 on a long-form page.
- FAQ kills the last 5-7 objections.
- Risk reversal is loud, not buried.
`.trim(),

  upwork: `
PATTERNS FROM TOP-RATED PLUS UPWORK / FIVERR PROFILES (top 1-3% earners):
- Title is a specific service + outcome. "Shopify Conversion Specialist | +30% AOV in 60 Days."
- Title uses 2-3 high-volume search keywords for the niche.
- First 2 lines of overview must contain: who you serve, the outcome, and a proof point.
- Top earners open with a number or named result, not a greeting.
- Specialization paragraph: "I work with [niche] who [situation]. I do NOT work with [anti-niche]."
- Process section: 3-5 bullets describing the engagement.
- Social proof block: hours worked, JSS, total earned, repeat client rate.
- Skills section is curated. 8-12 high-search skills.
- Hourly rate signals positioning. Top earners price 2-5x platform median.
`.trim(),

  linkedin: `
PATTERNS FROM TOP-PERFORMING LINKEDIN PROFILES:
- Headline pattern: "I help [audience] [outcome] | [credential or proof]."
- Banner image reinforces niche visually.
- Profile photo: high-res, smiling, looking at camera.
- About first 3 lines (visible before "see more") earn the click.
- About narrative arc: 1) Problem audience faces. 2) Why most solutions fail. 3) What you do differently. 4) Proof. 5) CTA.
- Featured section pins: case study, lead magnet, Calendly link, viral post.
- Experience entries lead with outcomes, not duties.
- Each entry: 1-line summary, 2-4 outcome bullets, 1-line "what I'm proud of" close.
- Voice is conversational, opinionated, POV-driven.
`.trim(),

  cv: `
PATTERNS FROM TOP 1% CVS / RESUMES (people who get the interview every time):
- One page only. Exception: very senior roles (10+ years), max two.
- Header: name, role you want (NOT current role), city or 'Remote', email, LinkedIn URL, portfolio URL. Nothing else.
- Professional summary (3 lines max): role + named outcomes + a number or proof point. No buzzwords. No 'passionate'.
- Experience entries lead with outcomes, never duties. Pattern: "[Strong verb] [specific outcome] [number or scope]."
- EVERY bullet has at minimum ONE of: a number, percentage, dollar amount, time frame, or named tool/system. Bullets without proof are deleted.
- Use past tense for past roles, present for current. Active voice always.
- Skills section is curated, not exhaustive. 8-15 high-relevance skills clustered by category. No 'Microsoft Word'.
- No 'References available on request'. No 'Objective'. No photo (in most countries). No graphics, charts, ratings, or progress bars.
- ATS-readable: standard headers, no tables, no columns, no text in images, single column layout.
- Verbs are tactical: 'Shipped', 'Reduced', 'Closed', 'Built', 'Migrated', 'Negotiated', 'Cut', 'Scaled', 'Onboarded'. NEVER: 'Responsible for', 'Helped with', 'Worked on', 'Assisted in', 'Tasked with'.
- No first-person pronouns anywhere. Subject is implied.
- Quantification is everything. "Increased revenue" is weak. "Increased revenue 34% (+$2.1M ARR) in 9 months" is strong.
- Tailor to target role: keywords from the actual job description appear naturally in summary, skills, and at least 2 experience entries.
`.trim(),
};

const PAGE_TYPES = {
  portfolio: {
    label: 'Portfolio / Website', icon: Briefcase,
    desc: 'Personal site, portfolio, or freelancer landing page',
    criteria: [
      'Hero clarity: Does it instantly say WHO you help and WHAT outcome you produce?',
      'Positioning sharpness: Is the niche obvious?',
      'Proof density: Are testimonials placed where they matter?',
      'Call-to-action strength: Is there ONE clear next step above the fold?',
      'Voice consistency: Does the copy sound like a person?',
      'Visual hierarchy: Does the eye know where to land first?',
    ],
    rewriteSections: ['Hero headline', 'Subheadline', 'About section', 'Primary CTA', 'Proof block', 'Footer CTA'],
  },
  sales: {
    label: 'Client Sales Page', icon: Target,
    desc: 'Landing page or sales page for a product, service, or offer',
    criteria: [
      'Hook strength: Does the headline stop the scroll?',
      'Pain articulation: Does the copy name the problem in the reader\'s own words?',
      'Mechanism clarity: Is the unique solution explained?',
      'Proof and risk reversal: Are testimonials placed near the asks?',
      'CTA pressure: Are there enough CTAs throughout?',
      'Friction audit: What objections are unanswered?',
    ],
    rewriteSections: ['Headline', 'Subheadline', 'Pain section opener', 'Mechanism section', 'CTA copy', 'Risk reversal'],
  },
  upwork: {
    label: 'Upwork / Fiverr Profile', icon: Award,
    desc: 'Freelance marketplace profile (Upwork, Fiverr, Contra)',
    criteria: [
      'Title: Does it use buyer-search keywords AND name a specific outcome?',
      'Overview hook: Does the first 2 lines stop the read?',
      'Specialization: Are you positioned as a specialist?',
      'Proof formatting: Are results, hours, JSS used as social proof?',
      'Portfolio relevance: Do pieces match the buyer they\'re targeting?',
      'Skills and tags: Are they tactical for search?',
    ],
    rewriteSections: ['Title', 'Overview (first 2 lines)', 'Full overview', 'Specialization paragraph', 'Process section', 'Skills list (8-12)'],
  },
  linkedin: {
    label: 'LinkedIn Profile', icon: User,
    desc: 'LinkedIn profile for inbound clients or recruiter-led work',
    criteria: [
      'Headline: Is it a positioning statement?',
      'Banner and photo: Do they signal credibility?',
      'About hook: Does the first 3 lines earn the click?',
      'About narrative: Does it move from problem to proof to CTA?',
      'Featured section: Are the right artifacts pinned?',
      'Experience copy: Does it read as outcomes-and-impact?',
    ],
    rewriteSections: ['Headline', 'About first 3 lines (hook)', 'Full About section', 'Featured section recommendation', 'Top experience entry', 'Banner copy direction'],
  },
  cv: {
    label: 'CV / Resume', icon: FileText,
    desc: 'CV or resume for full-time, contract, or freelance roles',
    criteria: [
      'Header clarity: Does it show the role they want, contact, and key links cleanly?',
      'Professional summary: Does it lead with named outcomes and proof, not buzzwords?',
      'Quantified achievements: Does every bullet carry a number, percentage, dollar amount, or time frame?',
      'Verbs and voice: Are bullets active, tactical, and outcome-led?',
      'Skills relevance: Are the listed skills aligned to the target role and free of obvious filler?',
      'ATS friendliness: Standard headers, no tables, no graphics, single column, parseable?',
      'Length and signal density: Tight, no padding, no generic phrases?',
    ],
    rewriteSections: ['Header (name, role, contact, links)', 'Professional summary (3 lines)', 'Top experience entry (with bullets)', 'Skills section (clustered)', 'One weak bullet rewritten as proof'],
  },
};

const CLOSER_MODES = {
  proposal: { label: 'Proposal', icon: FileText, desc: 'Full proposal, DM, and matched attachments', cta: 'Generate Proposal' },
  dm: { label: 'Cold DM', icon: MessageSquare, desc: 'Short, pattern-breaking direct message', cta: 'Generate DM' },
  email: { label: 'Cold Email', icon: Mail, desc: 'Subject line and email body', cta: 'Generate Email' },
  followup: { label: 'Follow-up', icon: Reply, desc: 'Reply or re-engage based on a conversation', cta: 'Draft Follow-up' },
  coverletter: { label: 'Cover Letter', icon: PenLine, desc: 'Tailored cover letter for a specific job', cta: 'Generate Cover Letter' },
};

const TONE_OPTIONS = [
  { id: 'Auto', desc: 'Adapts to the audience' },
  { id: 'Direct', desc: 'No fluff. Punchy.' },
  { id: 'Warm', desc: 'Friendly, human' },
  { id: 'Sharp', desc: 'Confident, assertive' },
  { id: 'Persuasive', desc: 'Active selling, builds desire' },
  { id: 'Casual', desc: 'Founder-to-founder' },
  { id: 'Bold', desc: 'Strong opinions, conviction' },
  { id: 'Witty', desc: 'Clever, light humor' },
  { id: 'Empathetic', desc: 'Acknowledges pain, builds trust' },
  { id: 'Curious', desc: 'Asks questions, learns first' },
  { id: 'Authoritative', desc: 'Expert voice, no doubt' },
  { id: 'Playful', desc: 'Energetic, breaks the mold' },
];

const TONE_DIRECTIVES = {
  Auto: '',
  Direct: "Write in a DIRECT voice: no fluff, short sentences, get to the point fast.",
  Warm: "Write in a WARM voice: friendly and conversational, with human warmth.",
  Sharp: "Write in a SHARP voice: confident, slightly assertive, results-focused.",
  Persuasive: "Write in a PERSUASIVE voice: actively selling without sounding salesy.",
  Casual: "Write in a CASUAL voice: relaxed and conversational.",
  Bold: "Write in a BOLD voice: strong opinions, take a clear position, no hedging. Make claims you'd defend in person.",
  Witty: "Write in a WITTY voice: clever, light humor, unexpected turns of phrase. Never forced or punny.",
  Empathetic: "Write in an EMPATHETIC voice: acknowledge their situation first, show you understand the pain, then offer a path forward.",
  Curious: "Write in a CURIOUS voice: lead with questions, show interest in their world before pitching anything. Sound like you want to learn, not sell.",
  Authoritative: "Write in an AUTHORITATIVE voice: speak as the expert. State things as fact. No 'I think' or 'maybe.' Quiet confidence.",
  Playful: "Write in a PLAYFUL voice: energetic, surprising, breaks expectations. Still professional but anything but boring.",
};

const STRICT_RULES = `
=== STRICT WRITING RULES ===
1. EM DASHES ARE FORBIDDEN. Use periods, commas, parentheses, or colons.
2. GRAMMAR MUST BE IMPECCABLE. Vary sentence openers.
3. NO GENERIC AI / CORPORATE WORDS. Forbidden: leverage, utilize, synergy, streamline, cutting-edge, innovative, world-class, best-in-class, top-notch, game-changer, unlock, empower, optimize, maximize, robust, seamless, transform, revolutionize, supercharge, level up, holistic, ecosystem, paradigm, scalable, dynamic, results-driven, deep dive, foster, cultivate, harness, elevate, dive into, embark on.
4. NO GENERIC OPENERS. No "I hope this finds you well", "I came across your post", "passionate about".
5. PREFER SPECIFIC OVER ABSTRACT. Numbers, named outcomes, concrete time frames.
`;

const CV_STRICT_RULES = `
=== CV-SPECIFIC RULES (additional, NEVER violate) ===
A. NEVER use these phrases anywhere: "results-driven", "team player", "passionate about", "proven track record", "strong communication skills", "detail-oriented", "self-motivated", "go-getter", "out-of-the-box thinker", "wear many hats", "spearheaded", "drove results", "highly motivated", "strategic thinker", "collaborate with cross-functional teams", "responsible for", "duties included", "tasked with", "helped to", "worked on", "assisted in", "References available on request".
B. EVERY bullet point MUST contain at least ONE of: a number, a percentage, a dollar amount, a time frame (e.g. 9 months, Q3 2024), a specific tool/system name (e.g. Salesforce, Postgres), or a named outcome (e.g. Series A close, app launch). If a bullet has none of these, REWRITE it or DELETE it.
C. ZERO first-person pronouns (no "I", "my", "me"). Subject is implied.
D. Use ONLY active, tactical past-tense verbs (or present for current role). Examples of strong starts: Shipped, Reduced, Closed, Built, Migrated, Negotiated, Cut, Scaled, Onboarded, Launched, Authored, Architected, Recovered, Delivered, Eliminated.
E. NEVER add "Objective", "References available on request", or photos.
F. ATS-friendly format only: standard headers (Experience, Education, Skills), no tables, no columns, no graphics, no progress bars or rating scales.
`;

const stripEmDashes = (s) => {
  if (typeof s !== 'string') return s;
  return s.replace(/\s*—\s*/g, ', ').replace(/\s*–\s*/g, ', ')
    .replace(/,\s*,/g, ',').replace(/,\s*\./g, '.');
};

/* ====================================================================== */
/* ASK ANYTHING — SUGGESTED PROMPTS                                       */
/* ====================================================================== */

const SUGGESTED_PROMPTS = [
  { label: 'Rate my hourly', text: 'How do I figure out what to charge per hour as a freelancer? I do UX design.' },
  { label: 'Niche down advice', text: 'Should I niche down or stay a generalist? I currently do branding, web design, and social media.' },
  { label: 'Handle lowball offers', text: 'A client just offered me 40% of my quoted rate. How should I respond without losing the deal?' },
  { label: 'Write a bio', text: 'Help me write a sharp 3-sentence bio. I am a freelance copywriter who specializes in SaaS onboarding emails.' },
  { label: 'Raise my rates', text: 'How do I tell existing clients I am raising my rates by 30% without losing them?' },
  { label: 'Scope creep script', text: 'Give me a script to push back on a client who keeps adding work outside the original scope.' },
];

/* ====================================================================== */
/* DESIGN SYSTEM — Apple-inspired, blue primary                            */
/* ====================================================================== */

const CSS = `
@import url('https://rsms.me/inter/inter.css');
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');

.ff-root {
  --font-display: 'DM Serif Display', 'Georgia', serif;
  --font-text: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', ui-monospace, monospace;

  --r-sm: 6px;
  --r-md: 8px;
  --r-lg: 12px;
  --r-xl: 16px;
  --r-pill: 999px;

  --sh-1: 0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02);
  --sh-2: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
  --sh-3: 0 12px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
  --sh-blue: 0 4px 14px rgba(37, 99, 235, 0.32), 0 2px 6px rgba(37, 99, 235, 0.18);
  --sh-focus: 0 0 0 3px rgba(37, 99, 235, 0.18);

  --t-fast: 140ms cubic-bezier(0.4, 0, 0.2, 1);
  --t-med: 220ms cubic-bezier(0.4, 0, 0.2, 1);
  --t-slow: 380ms cubic-bezier(0.4, 0, 0.2, 1);

  /* LIGHT MODE */
  --bg: #ffffff;
  --bg-elev-1: #fafafa;
  --bg-elev-2: #f4f4f5;
  --bg-input: #ffffff;
  --text-1: #0a0a0a;
  --text-2: #4a4a4f;
  --text-3: #6b6b70;
  --border: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.12);
  --accent: #2563eb;
  --accent-hover: #1d4ed8;
  --accent-active: #1e40af;
  --accent-vivid: #1d4ed8;
  --accent-vivid-hover: #1e40af;
  --accent-bg-soft: #eff6ff;
  --accent-border-soft: #bfdbfe;
  --accent-text-on: #ffffff;
  --warning: #b45309;
  --warning-bg: #fef3c7;
  --success: #15803d;
  --success-bg: #dcfce7;
  --danger: #b91c1c;
  --danger-bg: #fee2e2;

  font-family: var(--font-text);
  font-feature-settings: 'cv11', 'ss01', 'ss03';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--bg);
  color: var(--text-1);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  transition: background-color var(--t-slow), color var(--t-slow);
  letter-spacing: -0.01em;
}

.ff-root.dark {
  --bg: #0a0a0c;
  --bg-elev-1: #131316;
  --bg-elev-2: #1a1a1e;
  --bg-input: #0f0f12;
  --text-1: #f5f5f7;
  --text-2: #b8b8bd;
  --text-3: #8a8a90;
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.14);
  --accent: #3b82f6;
  --accent-hover: #60a5fa;
  --accent-active: #2563eb;
  --accent-vivid: #2563eb;
  --accent-vivid-hover: #3b82f6;
  --accent-bg-soft: rgba(59, 130, 246, 0.12);
  --accent-border-soft: rgba(59, 130, 246, 0.32);
  --accent-text-on: #ffffff;
  --warning: #f59e0b;
  --warning-bg: rgba(245, 158, 11, 0.12);
  --success: #4ade80;
  --success-bg: rgba(74, 222, 128, 0.12);
  --danger: #f87171;
  --danger-bg: rgba(248, 113, 113, 0.12);
  --sh-1: 0 1px 2px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.3);
  --sh-2: 0 2px 8px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5);
  --sh-3: 0 12px 32px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.3);
  --sh-blue: 0 4px 16px rgba(59, 130, 246, 0.4), 0 2px 6px rgba(59, 130, 246, 0.2);
  --sh-focus: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.ff-display {
  font-family: var(--font-display);
  letter-spacing: -0.02em;
  font-weight: 400;
  font-feature-settings: 'kern';
}
.ff-mono { font-family: var(--font-mono); font-feature-settings: 'tnum', 'zero'; }

.ff-bg { background-color: var(--bg); }
.ff-surface { background-color: var(--bg-elev-1); }
.ff-text-1 { color: var(--text-1); }
.ff-text-2 { color: var(--text-2); }
.ff-text-3 { color: var(--text-3); }
.ff-text-accent { color: var(--accent); }

/* INPUTS */
.ff-input, .ff-textarea {
  background-color: var(--bg-input);
  border: 1px solid var(--border-strong);
  color: var(--text-1);
  font-family: var(--font-text);
  width: 100%;
  outline: none;
  transition: border-color var(--t-fast), box-shadow var(--t-fast), background-color var(--t-slow);
  border-radius: var(--r-md);
  letter-spacing: -0.01em;
  font-size: 16px; /* prevents iOS zoom on focus */
}
.ff-input { padding: 11px 13px; }
.ff-textarea { line-height: 1.5; padding: 13px 14px; resize: vertical; }
@media (min-width: 768px) {
  .ff-input { font-size: 14px; padding: 10px 12px; }
  .ff-textarea { font-size: 15px; padding: 12px 14px; }
}
.ff-input:focus, .ff-textarea:focus {
  border-color: var(--accent);
  box-shadow: var(--sh-focus);
}
.ff-input::placeholder, .ff-textarea::placeholder { color: var(--text-3); }

/* BUTTONS */
.ff-btn {
  background-color: var(--accent);
  color: var(--accent-text-on);
  font-family: var(--font-text);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: -0.005em;
  padding: 12px 20px;
  border: none;
  cursor: pointer;
  border-radius: var(--r-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform var(--t-fast), box-shadow var(--t-fast), background-color var(--t-fast), opacity var(--t-fast);
  width: 100%;
  box-shadow: var(--sh-1);
}
.ff-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--sh-blue);
}
.ff-btn:active:not(:disabled) { transform: translateY(0); background-color: var(--accent-active); }
.ff-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ff-btn-secondary {
  background-color: transparent;
  color: var(--text-1);
  border: 1px solid var(--border-strong);
  box-shadow: none;
}
.ff-btn-secondary:hover:not(:disabled) {
  background-color: var(--bg-elev-1);
  transform: translateY(-1px);
  box-shadow: var(--sh-1);
}

.ff-btn-dark {
  background-color: var(--text-1);
  color: var(--bg);
}
.ff-btn-dark:hover:not(:disabled) {
  background-color: var(--text-2);
  box-shadow: var(--sh-2);
}

.ff-icon-btn {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-2);
  padding: 6px 10px;
  font-family: var(--font-text);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--r-sm);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all var(--t-fast);
}
.ff-icon-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background-color: var(--accent-bg-soft);
}

.ff-theme-toggle {
  background: var(--bg-elev-1);
  border: 1px solid var(--border);
  color: var(--text-2);
  padding: 7px 12px;
  font-family: var(--font-text);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--r-pill);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all var(--t-fast);
}
.ff-theme-toggle:hover {
  border-color: var(--border-strong);
  color: var(--text-1);
  background-color: var(--bg-elev-2);
}

.ff-attach-btn {
  background: transparent;
  border: 1px dashed var(--border-strong);
  color: var(--text-2);
  padding: 12px 16px;
  font-family: var(--font-text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--r-md);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all var(--t-fast);
  width: 100%;
  justify-content: center;
}
.ff-attach-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background-color: var(--accent-bg-soft);
  border-style: solid;
}

/* SEGMENTED CONTROL */
.ff-segment {
  background: var(--bg-elev-1);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: 3px;
  display: inline-flex;
  gap: 2px;
  flex-wrap: wrap;
}
.ff-segment-item {
  background: transparent;
  border: none;
  color: var(--text-2);
  padding: 7px 14px;
  font-family: var(--font-text);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--r-sm);
  transition: all var(--t-fast);
  letter-spacing: -0.005em;
}
.ff-segment-item:hover { color: var(--text-1); }
.ff-segment-item-active {
  background: var(--bg);
  color: var(--text-1);
  box-shadow: var(--sh-1);
}
.ff-root.dark .ff-segment-item-active { background: var(--bg-elev-2); }

/* COLORED SEGMENTED CONTROL */
.ff-segment-color {
  background: var(--accent-bg-soft);
  border-color: var(--accent-border-soft);
  border-radius: var(--r-pill);
}
.ff-segment-color .ff-segment-item {
  color: var(--accent);
  border-radius: var(--r-pill);
}
.ff-segment-color .ff-segment-item:hover:not(.ff-segment-item-active) {
  color: var(--accent-hover);
  background: rgba(255, 255, 255, 0.5);
}
.ff-root.dark .ff-segment-color .ff-segment-item:hover:not(.ff-segment-item-active) {
  background: rgba(255, 255, 255, 0.04);
}
.ff-segment-color .ff-segment-item-active {
  background: var(--accent-vivid);
  color: var(--accent-text-on);
  font-weight: 600;
  box-shadow: var(--sh-blue);
}
.ff-segment-color .ff-segment-item-active:hover {
  background: var(--accent-vivid-hover);
  color: var(--accent-text-on);
}
.ff-root.dark .ff-segment-color .ff-segment-item-active {
  background: var(--accent-vivid);
  color: var(--accent-text-on);
}

/* UNDERLINED TABS */
.ff-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.ff-tabs::-webkit-scrollbar { display: none; }
.ff-tab {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-3);
  font-family: var(--font-text);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
  padding: 13px 0;
  margin-right: 24px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: color var(--t-fast), border-color var(--t-fast);
  margin-bottom: -1px;
  white-space: nowrap;
  flex-shrink: 0;
}
.ff-tab:last-child { margin-right: 0; }
.ff-tab:hover:not(.ff-tab-active) { color: var(--text-1); }
.ff-tab-active {
  color: var(--text-1);
  border-bottom-color: var(--accent);
  font-weight: 600;
}
.ff-tab-badge {
  font-size: 9.5px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--r-pill);
  background-color: var(--accent-bg-soft);
  color: var(--accent);
  letter-spacing: 0.03em;
  margin-left: 1px;
}
@media (max-width: 640px) {
  .ff-tab { font-size: 13px; padding: 12px 0; margin-right: 20px; gap: 6px; }
}

/* DROPDOWN */
.ff-dropdown { position: relative; display: inline-block; }
.ff-dropdown-trigger {
  background-color: var(--bg-elev-1);
  border: 1px solid var(--border-strong);
  color: var(--text-1);
  font-family: var(--font-text);
  font-weight: 500;
  font-size: 13px;
  letter-spacing: -0.005em;
  padding: 9px 14px;
  cursor: pointer;
  border-radius: var(--r-md);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all var(--t-fast);
}
.ff-dropdown-trigger:hover {
  background-color: var(--bg-elev-2);
  border-color: var(--text-2);
}
.ff-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background-color: var(--bg);
  border: 1px solid var(--border-strong);
  min-width: 320px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  border-radius: var(--r-lg);
  box-shadow: var(--sh-3);
  overflow: hidden;
  padding: 6px;
}
.ff-dropdown-option {
  background: transparent;
  border: none;
  text-align: left;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-radius: var(--r-sm);
  transition: background var(--t-fast);
}
.ff-dropdown-option:hover { background-color: var(--bg-elev-1); }
.ff-dropdown-option-active { background-color: var(--accent-bg-soft); }
.ff-dropdown-option-icon {
  color: var(--text-2);
  flex-shrink: 0;
  margin-top: 2px;
}
.ff-dropdown-option-active .ff-dropdown-option-icon { color: var(--accent); }
.ff-dropdown-option-text { display: flex; flex-direction: column; gap: 2px; }
.ff-dropdown-option-label {
  font-family: var(--font-text);
  font-size: 13.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-1);
}
.ff-dropdown-option-active .ff-dropdown-option-label { color: var(--accent); }
.ff-dropdown-option-desc {
  font-size: 12px;
  color: var(--text-2);
  letter-spacing: -0.005em;
}

/* CARDS */
.ff-card {
  background-color: var(--bg-elev-1);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 24px;
  transition: background-color var(--t-slow), border-color var(--t-slow);
}
.ff-card-elevated {
  background-color: var(--bg);
  border: 1px solid var(--border);
  box-shadow: var(--sh-2);
}

/* IMAGE PREVIEW */
.ff-image-card {
  background-color: var(--bg-elev-1);
  border: 1px solid var(--border);
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: var(--r-md);
}
.ff-image-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--r-sm);
  flex-shrink: 0;
}
.ff-x-btn {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--text-2);
  width: 28px;
  height: 28px;
  border-radius: var(--r-pill);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--t-fast);
  flex-shrink: 0;
}
.ff-x-btn:hover { border-color: var(--danger); color: var(--danger); }

/* PORTFOLIO */
.ff-portfolio-card {
  background-color: var(--bg-elev-1);
  border: 1px solid var(--border);
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-radius: var(--r-md);
  transition: border-color var(--t-fast);
}
.ff-portfolio-card:hover { border-color: var(--border-strong); }
.ff-tag {
  display: inline-block;
  padding: 3px 9px;
  background-color: var(--accent-bg-soft);
  color: var(--accent);
  font-family: var(--font-text);
  font-size: 11px;
  font-weight: 500;
  border-radius: var(--r-pill);
  letter-spacing: -0.005em;
  border: 1px solid var(--accent-border-soft);
}
.ff-portfolio-form {
  border: 1px dashed var(--border-strong);
  padding: 14px;
  border-radius: var(--r-md);
}

/* SCORE RING */
.ff-score-ring { position: relative; width: 96px; height: 96px; flex-shrink: 0; }
.ff-score-ring svg { transform: rotate(-90deg); }
.ff-score-ring-bg { stroke: var(--border-strong); fill: none; }
.ff-score-ring-fg {
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset 1100ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ff-score-ring-text {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%); text-align: center;
}
.ff-score-ring-num {
  font-family: var(--font-display);
  font-size: 28px;
  line-height: 1;
  font-weight: 600;
  letter-spacing: -0.03em;
  font-feature-settings: 'tnum';
}
.ff-score-ring-label {
  font-family: var(--font-text);
  font-size: 10px;
  color: var(--text-3);
  font-weight: 500;
  margin-top: 3px;
  letter-spacing: 0.02em;
}

/* SCORE BARS */
.ff-score-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0;
}
.ff-score-row + .ff-score-row { border-top: 1px solid var(--border); }
.ff-score-bar-wrap {
  flex: 1; height: 4px;
  background-color: var(--border);
  position: relative; overflow: hidden;
  border-radius: var(--r-pill);
}
.ff-score-bar {
  height: 100%;
  border-radius: var(--r-pill);
  transition: width 900ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ff-score-bar-low { background-color: var(--success); }
.ff-score-bar-medium { background-color: var(--warning); }
.ff-score-bar-high { background-color: var(--danger); }
.ff-score-num-mini {
  font-family: var(--font-text);
  font-size: 12.5px;
  font-weight: 600;
  font-feature-settings: 'tnum';
  width: 44px;
  text-align: right;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}

/* RECOMMENDATIONS */
.ff-rec-list { list-style: none; padding: 0; margin: 0; }
.ff-rec-item {
  display: flex; gap: 14px;
  padding: 14px 0;
}
.ff-rec-item + .ff-rec-item { border-top: 1px solid var(--border); }
.ff-rec-prio {
  font-family: var(--font-text);
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: var(--r-pill);
  flex-shrink: 0;
  height: fit-content;
  margin-top: 2px;
}
.ff-rec-prio-high { color: var(--danger); background-color: var(--danger-bg); }
.ff-rec-prio-medium { color: var(--warning); background-color: var(--warning-bg); }
.ff-rec-prio-low { color: var(--success); background-color: var(--success-bg); }
.ff-rec-content { flex: 1; min-width: 0; }
.ff-rec-issue {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-1);
  margin-bottom: 6px;
  letter-spacing: -0.005em;
}
.ff-rec-fix {
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-2);
  background-color: var(--bg-elev-2);
  padding: 10px 12px;
  border-radius: var(--r-sm);
  margin-top: 8px;
}
.ff-rec-fix-label {
  font-family: var(--font-text);
  font-size: 10.5px;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.02em;
  display: block;
  margin-bottom: 4px;
  text-transform: uppercase;
}

/* REWRITE CARDS */
.ff-rewrite-card {
  background-color: var(--bg-elev-2);
  padding: 14px 16px;
  border-radius: var(--r-md);
  margin-bottom: 10px;
}
.ff-rewrite-card:last-child { margin-bottom: 0; }
.ff-rewrite-section {
  font-family: var(--font-text);
  font-size: 11px;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.ff-rewrite-before {
  font-size: 13px;
  color: var(--text-3);
  text-decoration: line-through;
  text-decoration-color: var(--danger);
  margin-bottom: 8px;
}
.ff-rewrite-after {
  font-size: 14px;
  color: var(--text-1);
  line-height: 1.55;
  font-weight: 500;
  white-space: pre-wrap;
  letter-spacing: -0.005em;
}

/* OPTIMIZE CTA */
.ff-optimize-cta {
  background: var(--accent-bg-soft);
  border: 1px solid var(--accent-border-soft);
  padding: 28px;
  border-radius: var(--r-lg);
}
.ff-optimize-headline {
  font-family: var(--font-display);
  font-size: 24px;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: -0.018em;
  color: var(--text-1);
  margin-bottom: 8px;
  
}
.ff-optimize-sub {
  font-size: 14.5px;
  color: var(--text-2);
  line-height: 1.55;
  letter-spacing: -0.005em;
}

/* PILL */
.ff-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-family: var(--font-text);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  border-radius: var(--r-pill);
}
.ff-pill::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: var(--r-pill);
  background: currentColor;
}
.ff-pill-low { color: var(--success); background-color: var(--success-bg); }
.ff-pill-medium { color: var(--warning); background-color: var(--warning-bg); }
.ff-pill-high { color: var(--danger); background-color: var(--danger-bg); }

.ff-output-text {
  white-space: pre-wrap;
  font-family: var(--font-text);
  font-size: 15px;
  line-height: 1.65;
  color: var(--text-1);
  letter-spacing: -0.005em;
}

.ff-subject-card {
  background-color: var(--bg-elev-2);
  border: 1px solid var(--border);
  padding: 14px 16px;
  border-radius: var(--r-md);
}
.ff-subject-text {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-1);
  line-height: 1.4;
  letter-spacing: -0.012em;
}

.ff-attach-list { list-style: none; padding: 0; margin: 0; }
.ff-attach-item {
  display: flex; gap: 14px;
  padding: 14px 0;
}
.ff-attach-item + .ff-attach-item { border-top: 1px solid var(--border); }
.ff-attach-num {
  font-family: var(--font-text);
  font-size: 12px;
  color: var(--accent);
  font-weight: 600;
  font-feature-settings: 'tnum';
  flex-shrink: 0;
  padding-top: 2px;
  min-width: 28px;
}
.ff-attach-text {
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-1);
  letter-spacing: -0.005em;
}
.ff-attach-links {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  list-style: none;
  padding: 0;
}
.ff-attach-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-text);
  font-size: 12.5px;
  color: var(--accent);
  text-decoration: none;
  word-break: break-all;
  line-height: 1.5;
  padding: 4px 0;
  font-weight: 500;
}
.ff-attach-link:hover { text-decoration: underline; }
.ff-attach-no-link {
  font-family: var(--font-text);
  font-size: 12px;
  color: var(--text-3);
  font-style: italic;
  margin-top: 8px;
}

.ff-context-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  padding: 12px 16px;
  background-color: var(--bg-elev-1);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
}
.ff-context-strip-item { display: flex; flex-direction: column; gap: 2px; }
.ff-context-strip-label {
  font-family: var(--font-text);
  font-size: 10.5px;
  font-weight: 500;
  color: var(--text-3);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.ff-context-strip-value {
  font-size: 13px;
  color: var(--text-1);
  line-height: 1.3;
  font-weight: 500;
  letter-spacing: -0.005em;
}

.ff-verdict {
  font-family: var(--font-text);
  font-size: 16px;
  line-height: 1.5;
  color: var(--text-1);
  letter-spacing: -0.01em;
  font-weight: 400;
}

.ff-section-label {
  font-family: var(--font-text);
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.ff-field-label {
  font-family: var(--font-text);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-1);
  letter-spacing: -0.005em;
  display: block;
  margin-bottom: 6px;
}
.ff-field-hint {
  font-family: var(--font-text);
  font-size: 12px;
  color: var(--text-3);
  letter-spacing: -0.005em;
  font-weight: 400;
}

.ff-subheading {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.018em;
  color: var(--text-1);
  
}

.ff-pulse { animation: ff-pulse 1.6s ease-in-out infinite; }
@keyframes ff-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

.ff-fadeup { animation: ff-fadeup 560ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
@keyframes ff-fadeup {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.ff-fadein { animation: ff-fadein 420ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
@keyframes ff-fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}

.ff-scalein { animation: ff-scalein 480ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
@keyframes ff-scalein {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.ff-slidein { animation: ff-slidein 520ms cubic-bezier(0.16, 1, 0.3, 1) backwards; }
@keyframes ff-slidein {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ===== Modal ===== */
.ff-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(8, 10, 14, 0.42);
  backdrop-filter: saturate(140%) blur(8px);
  -webkit-backdrop-filter: saturate(140%) blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  animation: ff-modal-bg 280ms cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes ff-modal-bg {
  from { opacity: 0; }
  to { opacity: 1; }
}
.ff-modal {
  background: var(--bg-elev-1);
  border: 1px solid var(--border);
  border-radius: 20px;
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 48px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.32), 0 8px 24px -8px rgba(0, 0, 0, 0.24);
  animation: ff-modal-pop 380ms cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes ff-modal-pop {
  from { opacity: 0; transform: translateY(8px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.ff-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}
.ff-modal-body {
  padding: 24px;
  overflow-y: auto;
}
.ff-modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--text-3);
  cursor: pointer;
  transition: background var(--t-fast), color var(--t-fast), transform var(--t-fast);
}
.ff-modal-close:hover {
  background: var(--bg-elev-2);
  color: var(--text-1);
}
.ff-modal-close:active { transform: scale(0.94); }

@keyframes ff-bar-grow {
  from { transform: scaleY(0); opacity: 0; }
  to { transform: scaleY(1); opacity: 1; }
}

.ff-btn:hover:not(:disabled),
.ff-icon-btn:hover,
.ff-tab:hover {
  transform: translateY(-1px);
}
.ff-btn:active:not(:disabled),
.ff-icon-btn:active {
  transform: translateY(0) scale(0.98);
  transition-duration: 80ms;
}

.ff-input, .ff-textarea, .ff-btn, .ff-icon-btn, .ff-dropdown-trigger, .ff-tab {
  transition: background-color var(--t-med),
              border-color var(--t-fast),
              color var(--t-fast),
              transform var(--t-fast),
              box-shadow var(--t-fast);
}

.ff-gradient-bg {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1400px;
  height: 720px;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse 60% 50% at 75% 0%, var(--accent-bg-soft) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 25% 10%, var(--accent-bg-soft) 0%, transparent 55%);
  opacity: 0.7;
  filter: blur(8px);
}
.ff-root.dark .ff-gradient-bg {
  opacity: 0.5;
  background:
    radial-gradient(ellipse 60% 50% at 75% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 25% 10%, rgba(59, 130, 246, 0.12) 0%, transparent 55%);
}

@keyframes ff-ringfill {
  from { stroke-dashoffset: var(--ring-circumference); }
  to { stroke-dashoffset: var(--ring-offset); }
}
.ff-score-ring-fg-anim {
  animation: ff-ringfill 1100ms cubic-bezier(0.34, 1.4, 0.64, 1) forwards;
}
@keyframes ff-barfill {
  from { width: 0; }
}
.ff-score-bar-anim {
  animation: ff-barfill 900ms cubic-bezier(0.34, 1.4, 0.64, 1) backwards;
}

.ff-empty-state {
  background-color: var(--bg-elev-1);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 48px 32px;
  text-align: center;
}

.ff-loading-bar {
  height: 6px;
  background-color: var(--bg-elev-2);
  border-radius: var(--r-pill);
}

.ff-meta-text {
  font-family: var(--font-text);
  font-size: 12px;
  color: var(--text-3);
  font-weight: 500;
  letter-spacing: -0.005em;
}

.ff-status-dot {
  width: 6px; height: 6px;
  border-radius: var(--r-pill);
  background-color: var(--accent);
  display: inline-block;
}

/* TOOLTIP */
.ff-tooltip-wrap {
  display: inline-flex;
  align-items: center;
  position: relative;
}
.ff-tooltip-trigger {
  background: transparent;
  border: none;
  padding: 0;
  cursor: help;
  color: var(--text-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  transition: color var(--t-fast), background-color var(--t-fast), transform var(--t-fast);
}
.ff-tooltip-trigger:hover,
.ff-tooltip-trigger:focus-visible {
  color: var(--accent);
  background-color: var(--accent-bg-soft);
  transform: scale(1.08);
  outline: none;
}
.ff-tooltip-bubble {
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  background: var(--text-1);
  color: var(--bg);
  padding: 9px 12px;
  border-radius: var(--r-md);
  font-family: var(--font-text);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.45;
  letter-spacing: -0.005em;
  width: max-content;
  max-width: 240px;
  z-index: 100;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--t-fast), transform var(--t-fast);
  box-shadow: var(--sh-3);
  text-align: left;
  white-space: normal;
}
.ff-tooltip-bubble::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent var(--text-1) transparent;
}
.ff-tooltip-trigger:hover + .ff-tooltip-bubble,
.ff-tooltip-trigger:focus-visible + .ff-tooltip-bubble,
.ff-tooltip-wrap:hover .ff-tooltip-bubble {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
.ff-tooltip-bubble--right {
  left: auto;
  right: 0;
  transform: translateY(-4px);
}
.ff-tooltip-bubble--right::before {
  left: auto;
  right: 12px;
  transform: none;
}
.ff-tooltip-trigger:hover + .ff-tooltip-bubble--right,
.ff-tooltip-trigger:focus-visible + .ff-tooltip-bubble--right,
.ff-tooltip-wrap:hover .ff-tooltip-bubble--right {
  transform: translateY(0);
}

.ff-input:focus,
.ff-textarea:focus {
  transform: translateY(-1px);
}

.ff-card {
  transition: background-color var(--t-slow),
              border-color var(--t-slow),
              transform var(--t-med),
              box-shadow var(--t-med);
}

.ff-tab {
  transition: color var(--t-fast),
              border-color var(--t-med),
              transform var(--t-fast);
}

.ff-dropdown-trigger:active {
  transform: scale(0.98);
}

@keyframes ff-shimmer {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.85; }
}
.ff-score-ring-num {
  animation: ff-shimmer 800ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes ff-pop {
  0% { transform: scale(1); }
  40% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

@keyframes ff-badge-fade {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.ff-tab-badge {
  animation: ff-badge-fade 480ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
}
*::-webkit-scrollbar { width: 8px; height: 8px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: var(--r-pill);
  transition: background var(--t-fast);
}
*::-webkit-scrollbar-thumb:hover { background: var(--text-3); }

/* ====================================================================== */
/* LAYOUT — RESPONSIVE CONTAINERS                                         */
/* ====================================================================== */

.ff-root-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 72px;
}

.ff-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40px;
  gap: 12px;
}

.ff-hero {
  margin-bottom: 48px;
}

.ff-hero-heading {
  font-size: clamp(34px, 5.6vw, 68px);
  line-height: 1.05;
  font-weight: 400;
  letter-spacing: -0.01em;
  max-width: 22ch;
  margin-bottom: 18px;
}

.ff-hero-sub {
  font-size: clamp(14px, 1.3vw, 17px);
  line-height: 1.6;
  letter-spacing: -0.005em;
  max-width: 48ch;
  color: var(--text-2);
}

.ff-tabs-nav {
  margin-bottom: 40px;
}

.ff-cv-selector {
  margin-bottom: 36px;
}

.ff-pipeline-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 12px;
  flex-wrap: wrap;
}

.ff-stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .ff-stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .ff-pipeline-topbar {
    margin-bottom: 20px;
  }
  .ff-cv-selector {
    margin-bottom: 24px;
  }
}

/* Two-col grid used in tabs */
.ff-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;
}

.ff-2col-stack {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px 56px;
}

.ff-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 20px;
}

@media (max-width: 480px) {
  .ff-detail-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .ff-detail-grid .col-span-2 {
    grid-column: 1;
  }
}

/* Apple-clean refinements */
.ff-card {
  border-radius: var(--r-xl);
}

.ff-empty-state {
  border-radius: var(--r-xl);
}

.ff-optimize-cta {
  border-radius: var(--r-xl);
}

.ff-chat-bubble-ai {
  border-radius: var(--r-lg) var(--r-lg) var(--r-lg) 4px;
}

.ff-chat-bubble-user {
  border-radius: var(--r-lg) var(--r-lg) 4px var(--r-lg);
}

/* Tighter form spacing on mobile */
@media (max-width: 768px) {
  .space-y-5 > * + * { margin-top: 16px !important; }
  .space-y-6 > * + * { margin-top: 20px !important; }
  .ff-textarea { font-size: 14px; }
  .ff-output-text { font-size: 14px; }
  .ff-subheading { font-size: 18px; }
  .ff-dropdown-menu { min-width: min(280px, 90vw); left: 0; right: auto; }
}

/* Pipeline table */
.ff-pipeline-table-header {
  display: grid;
  grid-template-columns: 100px 1fr 90px 120px 90px 32px;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  background-color: var(--bg-elev-2);
  border-top-left-radius: var(--r-lg);
  border-top-right-radius: var(--r-lg);
}

.ff-pipeline-row-grid {
  display: grid;
  grid-template-columns: 100px 1fr 90px 120px 90px 32px;
  gap: 10px;
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  align-items: center;
}

/* Mobile overrides */
@media (max-width: 768px) {
  .ff-root-inner {
    padding: 20px 16px 40px;
  }

  .ff-topbar {
    margin-bottom: 24px;
  }

  .ff-hero {
    margin-bottom: 28px;
  }

  .ff-tabs-nav {
    margin-bottom: 24px;
  }

  .ff-2col {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 24px;
  }

  .ff-2col-stack {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .ff-pipeline-table-header {
    grid-template-columns: 80px 1fr 100px 28px;
  }

  .ff-pipeline-row-grid {
    grid-template-columns: 80px 1fr 100px 28px;
  }

  .ff-pipeline-col-type,
  .ff-pipeline-col-value {
    display: none;
  }

  .ff-card {
    padding: 18px 16px;
  }

  .ff-optimize-cta {
    padding: 20px 18px;
  }


  .ff-dropdown-menu {
    min-width: 260px;
  }
}

@media (max-width: 480px) {
  .ff-hero-heading {
    font-size: 28px;
  }

  .ff-2col-stack {
    gap: 28px;
  }


  .ff-modal {
    border-radius: 16px;
  }
}

/* ====================================================================== */
/* ASK ANYTHING — SIDEBAR + CHAT LAYOUT                                  */
/* ====================================================================== */

.ff-ask-layout {
  display: grid;
  grid-template-columns: 210px 1fr;
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  overflow: hidden;
  height: 560px;
  background: var(--bg);
  box-shadow: var(--sh-2);
}

.ff-chat-sidebar {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  background: var(--bg-elev-1);
  overflow: hidden;
}

.ff-chat-sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 9px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.ff-chat-sidebar-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--text-3);
  font-family: var(--font-text);
}

.ff-chat-new-btn {
  width: 24px; height: 24px;
  background: var(--accent-bg-soft);
  border: 1px solid var(--accent-border-soft);
  border-radius: 7px;
  color: var(--accent);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all var(--t-fast);
  flex-shrink: 0;
}
.ff-chat-new-btn:hover { background: var(--accent); color: var(--accent-text-on); border-color: var(--accent); }

.ff-chat-sidebar-list {
  flex: 1; overflow-y: auto; padding: 5px;
}

.ff-chat-sidebar-item {
  width: 100%; background: transparent; border: none;
  border-radius: 8px; padding: 8px 9px; text-align: left;
  cursor: pointer; transition: background var(--t-fast);
  display: flex; flex-direction: column; gap: 2px; margin-bottom: 1px;
}
.ff-chat-sidebar-item:hover { background: var(--bg-elev-2); }
.ff-chat-sidebar-item-active { background: var(--accent-bg-soft) !important; }

.ff-chat-sidebar-item-title {
  font-size: 12px; font-weight: 600; color: var(--text-1);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  letter-spacing: -0.005em; font-family: var(--font-text);
}
.ff-chat-sidebar-item-active .ff-chat-sidebar-item-title { color: var(--accent); }

.ff-chat-sidebar-item-meta {
  font-size: 10.5px; color: var(--text-3);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  font-family: var(--font-text);
}
.ff-chat-sidebar-item-active .ff-chat-sidebar-item-meta { color: var(--accent); opacity: 0.65; }

.ff-chat-sidebar-empty {
  padding: 20px 10px; text-align: center;
  color: var(--text-3); font-size: 11.5px; line-height: 1.5;
  font-family: var(--font-text);
}

.ff-chat-pane {
  display: flex; flex-direction: column; overflow: hidden; min-width: 0;
}

.ff-chat-wrap { display: contents; }

.ff-chat-messages {
  flex: 1; overflow-y: auto;
  padding: 18px 18px 10px;
  display: flex; flex-direction: column; gap: 14px;
}

.ff-chat-empty {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 20px 20px; text-align: center;
}

.ff-chat-msg {
  display: flex; gap: 9px;
  animation: ff-fadeup 360ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
.ff-chat-msg-user { flex-direction: row-reverse; }

.ff-chat-avatar {
  width: 27px; height: 27px; border-radius: var(--r-pill);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 10.5px; font-weight: 700;
}
.ff-chat-avatar-ai {
  background: var(--accent-bg-soft);
  border: 1px solid var(--accent-border-soft); color: var(--accent);
}
.ff-chat-avatar-user { background: var(--accent); color: var(--accent-text-on); }

.ff-chat-bubble {
  max-width: min(440px, 78%); padding: 9px 12px;
  border-radius: var(--r-lg); font-size: 13.5px; line-height: 1.6;
  letter-spacing: -0.005em;
}
.ff-chat-bubble-ai {
  background: var(--bg); border: 1px solid var(--border);
  color: var(--text-1); border-bottom-left-radius: 4px; box-shadow: var(--sh-1);
}
.ff-chat-bubble-user {
  background: var(--accent); color: var(--accent-text-on); border-bottom-right-radius: 4px;
}
.ff-chat-bubble pre, .ff-chat-bubble code {
  font-family: var(--font-mono); font-size: 12px;
  background: var(--bg-elev-2); padding: 2px 5px; border-radius: var(--r-sm);
}
.ff-chat-bubble-ai pre {
  padding: 9px 11px; border-radius: var(--r-md); overflow-x: auto;
  margin: 6px 0; white-space: pre-wrap; word-break: break-word;
}

.ff-chat-typing { display: flex; align-items: center; gap: 4px; padding: 2px 0; }
.ff-chat-typing span {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent); animation: ff-typing-bounce 1.2s ease-in-out infinite;
}
.ff-chat-typing span:nth-child(2) { animation-delay: 0.15s; }
.ff-chat-typing span:nth-child(3) { animation-delay: 0.3s; }
@keyframes ff-typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-4px); opacity: 1; }
}

.ff-chat-copy-btn {
  background: transparent; border: none; color: var(--text-3); cursor: pointer;
  padding: 3px 5px; border-radius: var(--r-sm);
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10.5px; font-family: var(--font-text); font-weight: 500;
  transition: all var(--t-fast); margin-top: 4px;
}
.ff-chat-copy-btn:hover { color: var(--text-1); background: var(--bg-elev-2); }

.ff-chat-bubble-text { white-space: pre-wrap; }
.ff-chat-bubble-text strong { font-weight: 700; }
.ff-chat-bubble-text em { font-style: italic; }

.ff-suggested-prompt {
  background: var(--bg); border: 1px solid var(--border); color: var(--text-1);
  font-family: var(--font-text); font-size: 11.5px; font-weight: 500;
  padding: 6px 12px; border-radius: var(--r-pill); cursor: pointer;
  letter-spacing: -0.005em; transition: all var(--t-fast); white-space: nowrap;
}
.ff-suggested-prompt:hover {
  border-color: var(--accent); color: var(--accent);
  background: var(--accent-bg-soft); transform: translateY(-1px);
}

.ff-chat-footer {
  padding: 9px 12px 11px; border-top: 1px solid var(--border);
  background: var(--bg); flex-shrink: 0;
}

.ff-chat-input-box {
  background: var(--bg-input); border: 1px solid var(--border-strong);
  border-radius: 13px; transition: border-color var(--t-fast), box-shadow var(--t-fast);
}
.ff-chat-input-box:focus-within {
  border-color: rgba(0,0,0,0.18); box-shadow: 0 0 0 3px rgba(0,0,0,0.04);
}
.ff-root.dark .ff-chat-input-box:focus-within {
  border-color: rgba(255,255,255,0.18); box-shadow: 0 0 0 3px rgba(255,255,255,0.05);
}

.ff-chat-textarea {
  display: block; width: 100%; background: transparent; border: none;
  color: var(--text-1); font-family: var(--font-text); font-size: 16px;
  line-height: 1.5; padding: 11px 13px 0; resize: none; outline: none;
  letter-spacing: -0.005em; max-height: 110px; overflow-y: auto; min-height: 24px;
}
@media (min-width: 768px) { .ff-chat-textarea { font-size: 14px; } }
.ff-chat-textarea::placeholder { color: var(--text-3); }

.ff-chat-input-actions {
  display: flex; align-items: center; justify-content: space-between;
  padding: 5px 7px 7px;
}

.ff-chat-attach-btn {
  width: 27px; height: 27px; background: transparent; border: none;
  border-radius: 7px; color: var(--text-3); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: all var(--t-fast);
}
.ff-chat-attach-btn:hover { background: var(--bg-elev-2); color: var(--text-1); }

.ff-chat-send {
  width: 27px; height: 27px; background: var(--text-1); border: none;
  border-radius: 7px; color: var(--bg); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background var(--t-fast), transform var(--t-fast), opacity var(--t-fast);
}
.ff-chat-send:hover:not(:disabled) { background: var(--text-2); transform: scale(1.05); }
.ff-chat-send:active:not(:disabled) { transform: scale(0.95); }
.ff-chat-send:disabled { opacity: 0.2; cursor: not-allowed; }
.ff-root.dark .ff-chat-send { background: var(--text-1); color: var(--bg); }

/* Mobile: sidebar collapses to overlay */
.ff-chat-sidebar-toggle {
  display: none;
  align-items: center; gap: 6px;
  background: transparent; border: none;
  color: var(--text-3); font-size: 11.5px; font-weight: 600;
  font-family: var(--font-text); cursor: pointer; padding: 4px 0;
  letter-spacing: 0.01em; transition: color var(--t-fast);
}
.ff-chat-sidebar-toggle:hover { color: var(--text-1); }

@media (max-width: 768px) {
  .ff-ask-layout { grid-template-columns: 1fr; height: 520px; position: relative; }
  .ff-chat-sidebar {
    display: none; position: absolute; left: 0; top: 0; bottom: 0;
    width: 230px; z-index: 30;
    box-shadow: var(--sh-3); border-radius: 0 var(--r-lg) var(--r-lg) 0;
  }
  .ff-chat-sidebar.open { display: flex; }
  .ff-chat-sidebar-toggle { display: flex; }
  .ff-chat-messages { padding: 14px 13px 8px; gap: 12px; }
}

@media (max-width: 480px) {
  .ff-ask-layout { height: 480px; border-radius: var(--r-lg); }
}

.ff-chat-attachment-preview-icon {
  width: 30px; height: 30px; background: var(--accent-bg-soft); border-radius: 5px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--accent);
}
.ff-chat-attachment-name {
  flex: 1; min-width: 0; font-weight: 500; color: var(--text-1);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 11.5px;
}
.ff-chat-user-attachment {
  max-width: 170px; border-radius: var(--r-md); overflow: hidden; margin-bottom: 5px;
}
.ff-chat-user-attachment img { width: 100%; display: block; border-radius: var(--r-md); }
.ff-chat-user-attachment-file {
  display: flex; align-items: center; gap: 7px; padding: 6px 9px;
  background: rgba(255,255,255,0.15); border-radius: var(--r-md);
  font-size: 11px; font-weight: 500; margin-bottom: 5px;
}

`;

export default function FreelancersForge() {
  const [theme, setTheme] = useState('light');
  const [tab, setTab] = useState('optimize');

  return (
    <div className={`ff-root ${theme}`}>
      <style>{CSS}</style>

      <div className="ff-gradient-bg" aria-hidden="true"></div>
      <div className="ff-root-inner" style={{ position: 'relative', zIndex: 1 }}>

        {/* HEADER */}
        <div className="ff-topbar">
          <div className="flex items-center gap-3">
            <span className="ff-status-dot"></span>
            <span className="ff-meta-text">Freelancer's Forge</span>
          </div>
          <button
            type="button"
            className="ff-theme-toggle"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* TITLE */}
        <div className="ff-hero">
          <h1 className="ff-display ff-text-1 ff-hero-heading">
            Audit any page. Rewrite it like{' '}
            <span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 500 }}>the top one percent.</span>
          </h1>
          <p className="ff-text-2 ff-hero-sub">
            Score against expert criteria, then one-click rewrite using the patterns of top performers.
          </p>
        </div>

        {/* TABS */}
        <div className="ff-tabs ff-tabs-nav">
          <button
            type="button"
            className={`ff-tab ${tab === 'optimize' ? 'ff-tab-active' : ''}`}
            onClick={() => setTab('optimize')}
          >
            <Layers size={15} />
            Optimize Page
            <span className="ff-tab-badge">CORE</span>
          </button>
          <button
            type="button"
            className={`ff-tab ${tab === 'close' ? 'ff-tab-active' : ''}`}
            onClick={() => setTab('close')}
          >
            <Target size={15} />
            Close Client
          </button>
          <button
            type="button"
            className={`ff-tab ${tab === 'pipeline' ? 'ff-tab-active' : ''}`}
            onClick={() => setTab('pipeline')}
          >
            <TrendingUp size={15} />
            Pipeline
          </button>
          <button
            type="button"
            className={`ff-tab ${tab === 'ask' ? 'ff-tab-active' : ''}`}
            onClick={() => setTab('ask')}
          >
            <Bot size={15} />
            Ask Anything
          </button>
        </div>

        {tab === 'optimize' && <OptimizeTab />}
        {tab === 'close' && <CloseTab />}
        {tab === 'pipeline' && <PipelineTab />}
        {tab === 'ask' && <AskAnythingTab />}

      </div>
    </div>
  );
}

/* ====================================================================== */
/* ASK ANYTHING TAB                                                       */
/* ====================================================================== */

function formatMessageText(text) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={j}>{part.slice(1, -1)}</em>;
          }
          return part;
        })}
        {i < lines.length - 1 && <br />}
      </span>
    );
  });
}


const CHAT_STORAGE_KEY = 'ff_chat_v2';
const CHAT_RETENTION_DAYS = 15;

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function loadConversations() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - CHAT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    return parsed
      .filter(c => c && c.id && Array.isArray(c.messages))
      .map(c => ({
        ...c,
        messages: c.messages.filter(m => m && m.role && m.content && (!m.ts || m.ts >= cutoff)),
      }))
      .filter(c => c.messages.length > 0);
  } catch { return []; }
}

function saveConversations(convos) {
  try {
    const slim = convos.map(c => ({
      ...c,
      messages: c.messages.map(m => ({
        ...m,
        attachment: m.attachment ? { type: m.attachment.type, name: m.attachment.name, preview: null } : null,
      })),
    }));
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(slim));
  } catch {}
}

function getConvoTitle(messages) {
  const first = messages.find(m => m.role === 'user');
  if (!first) return 'New conversation';
  const text = first.content || '';
  return text.length > 36 ? text.slice(0, 36).trimEnd() + '…' : text;
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function AskAnythingTab() {
  const [convos, setConvos] = useState(() => loadConversations());
  const [activeId, setActiveId] = useState(() => {
    const loaded = loadConversations();
    return loaded.length > 0 ? loaded[0].id : null;
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const messages = convos.find(c => c.id === activeId)?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    saveConversations(convos);
  }, [convos]);

  const updateMessages = (id, updater) => {
    setConvos(prev => prev.map(c => c.id === id ? { ...c, messages: updater(c.messages), updatedAt: Date.now() } : c));
  };

  const startNewChat = () => {
    const id = genId();
    setConvos(prev => [{ id, messages: [], createdAt: Date.now(), updatedAt: Date.now() }, ...prev]);
    setActiveId(id);
    setInput('');
    setAttachment(null);
    setError('');
    setSidebarOpen(false);
  };

  const deleteConvo = (id, e) => {
    e.stopPropagation();
    setConvos(prev => {
      const next = prev.filter(c => c.id !== id);
      if (activeId === id) setActiveId(next.length > 0 ? next[0].id : null);
      return next;
    });
  };

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 110) + 'px';
  };

  const handleAttachFile = (file) => {
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const maxSize = isPdf ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) { setError(`File too large (max ${isPdf ? '20MB' : '5MB'}).`); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setAttachment({ type: isImage ? 'image' : (isPdf ? 'pdf' : 'file'), data: dataUrl.split(',')[1], mediaType: isPdf ? 'application/pdf' : file.type, name: file.name, preview: isImage ? dataUrl : null });
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (text) => {
    const trimmed = (text || input).trim();
    if ((!trimmed && !attachment) || loading) return;

    // Create conversation if none active
    let currentId = activeId;
    if (!currentId || !convos.find(c => c.id === currentId)) {
      const id = genId();
      currentId = id;
      setConvos(prev => [{ id, messages: [], createdAt: Date.now(), updatedAt: Date.now() }, ...prev]);
      setActiveId(id);
    }

    const userMsg = { role: 'user', content: trimmed || `[Attached: ${attachment?.name}]`, attachment: attachment ? { type: attachment.type, name: attachment.name, preview: attachment.preview } : null, ts: Date.now() };
    const currentMsgs = convos.find(c => c.id === currentId)?.messages || [];
    const updatedMsgs = [...currentMsgs, userMsg];

    setConvos(prev => prev.map(c => c.id === currentId ? { ...c, messages: updatedMsgs, updatedAt: Date.now() } : c));
    setInput('');
    setAttachment(null);
    setError('');
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const apiMessages = updatedMsgs.map((m, idx) => {
        const isLast = idx === updatedMsgs.length - 1;
        if (m.role !== 'user') return { role: m.role, content: m.content };
        const parts = [];
        if (isLast && attachment) {
          if (attachment.type === 'image') parts.push({ type: 'image', source: { type: 'base64', media_type: attachment.mediaType, data: attachment.data } });
          else if (attachment.type === 'pdf') parts.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: attachment.data } });
        }
        if (trimmed) parts.push({ type: 'text', text: trimmed });
        return { role: 'user', content: parts.length === 1 && parts[0].type === 'text' ? parts[0].text : parts };
      });

      const response = await fetch('/api/claude', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5', max_tokens: 1000,
          system: `You are Forge AI, the expert assistant built into Freelancer's Forge. You specialize in helping freelancers, independent contractors, and solopreneurs with positioning, pricing, niche strategy, writing copy, client management, rates, contracts, negotiation, platform-specific advice, business development, and career moves. You give direct, tactical advice. No fluff. No buzzwords. Short sentences. Specific numbers when possible. Opinions that you'd defend.`,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Request failed (${response.status}). ${errBody.slice(0, 200)}`);
      }
      const data = await response.json();
      const replyText = data.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
      setConvos(prev => prev.map(c => c.id === currentId
        ? { ...c, messages: [...c.messages, { role: 'assistant', content: replyText, ts: Date.now() }], updatedAt: Date.now() }
        : c
      ));
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
      setConvos(prev => prev.map(c => c.id === currentId ? { ...c, messages: c.messages.slice(0, -1) } : c));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const copyMessage = async (text, idx) => {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      }
      setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 1800);
    } catch {}
  };

  const isEmpty = messages.length === 0;
  const sortedConvos = [...convos].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return (
    <div className="ff-fadeup">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 className="ff-display ff-text-1" style={{ fontSize: 26, letterSpacing: '-0.02em', marginBottom: 3 }}>Ask anything</h2>
          <p className="ff-text-2" style={{ fontSize: 13.5, lineHeight: 1.5 }}>Freelance strategy, pricing, copy, clients. Direct answers.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Mobile history toggle */}
          <button type="button" className="ff-chat-sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>
            <MessageSquare size={13} /> History{convos.length > 0 ? ` (${convos.length})` : ''}
          </button>
          <button type="button" className="ff-btn ff-btn-secondary" onClick={startNewChat} style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>
            <Plus size={13} /> New chat
          </button>
        </div>
      </div>

      {/* Layout: sidebar + chat */}
      <div className="ff-ask-layout" style={{ position: 'relative' }}>
        {/* Sidebar overlay backdrop on mobile */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(2px)' }} />
        )}

        {/* Sidebar */}
        <div className={`ff-chat-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="ff-chat-sidebar-head">
            <span className="ff-chat-sidebar-title">Conversations</span>
            <button className="ff-chat-new-btn" onClick={startNewChat} title="New chat" type="button">
              <Plus size={13} />
            </button>
          </div>
          <div className="ff-chat-sidebar-list">
            {sortedConvos.length === 0 ? (
              <div className="ff-chat-sidebar-empty">No conversations yet.<br/>Start chatting to save.</div>
            ) : sortedConvos.map(c => (
              <button
                key={c.id}
                type="button"
                className={`ff-chat-sidebar-item${c.id === activeId ? ' ff-chat-sidebar-item-active' : ''}`}
                onClick={() => { setActiveId(c.id); setSidebarOpen(false); setError(''); }}
              >
                <span className="ff-chat-sidebar-item-title">{getConvoTitle(c.messages)}</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="ff-chat-sidebar-item-meta">{timeAgo(c.updatedAt)} · {Math.floor(c.messages.length / 2)} msg{c.messages.length / 2 !== 1 ? 's' : ''}</span>
                  <button
                    type="button"
                    onClick={(e) => deleteConvo(c.id, e)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '1px 3px', borderRadius: 4, opacity: 0.6, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                    title="Delete"
                  >
                    <X size={11} />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat pane */}
        <div className="ff-chat-pane">
          <div className="ff-chat-messages">
            {isEmpty && !loading && (
              <div className="ff-chat-empty">
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--accent-bg-soft)', border: '1px solid var(--accent-border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Bot size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <p className="ff-display ff-text-1" style={{ fontSize: 19, letterSpacing: '-0.02em', marginBottom: 6 }}>What do you want to know?</p>
                <p className="ff-text-3" style={{ fontSize: 13, lineHeight: 1.5, maxWidth: '32ch', marginBottom: 18 }}>
                  Ask about pricing, niches, client scripts, copy, or upload a file.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 460 }}>
                  {SUGGESTED_PROMPTS.map((p, i) => (
                    <button key={i} type="button" className="ff-suggested-prompt" onClick={() => sendMessage(p.text)} style={{ animationDelay: `${i * 40}ms` }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`ff-chat-msg ${msg.role === 'user' ? 'ff-chat-msg-user' : ''}`}>
                <div className={`ff-chat-avatar ${msg.role === 'user' ? 'ff-chat-avatar-user' : 'ff-chat-avatar-ai'}`}>
                  {msg.role === 'user' ? 'You' : <Bot size={13} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', minWidth: 0 }}>
                  {msg.attachment && msg.attachment.preview && (
                    <div className="ff-chat-user-attachment"><img src={msg.attachment.preview} alt={msg.attachment.name} /></div>
                  )}
                  {msg.attachment && !msg.attachment.preview && (
                    <div className="ff-chat-user-attachment-file"><FileText size={12} /> {msg.attachment.name}</div>
                  )}
                  {msg.content && (
                    <div className={`ff-chat-bubble ${msg.role === 'user' ? 'ff-chat-bubble-user' : 'ff-chat-bubble-ai'}`}>
                      <div className="ff-chat-bubble-text">{formatMessageText(msg.content)}</div>
                    </div>
                  )}
                  {msg.role === 'assistant' && (
                    <button type="button" className="ff-chat-copy-btn" onClick={() => copyMessage(msg.content, i)}>
                      {copiedIdx === i ? <Check size={10} /> : <Copy size={10} />}
                      {copiedIdx === i ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ff-chat-msg ff-fadein">
                <div className="ff-chat-avatar ff-chat-avatar-ai"><Bot size={13} /></div>
                <div className="ff-chat-bubble ff-chat-bubble-ai">
                  <div className="ff-chat-typing"><span /><span /><span /></div>
                </div>
              </div>
            )}

            {error && (
              <div className="ff-fadeup" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '9px 12px', borderRadius: 'var(--r-md)', fontSize: 12.5, fontWeight: 500, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="ff-chat-footer">
            {messages.length > 0 && messages.length < 3 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                {SUGGESTED_PROMPTS.slice(0, 3).map((p, i) => (
                  <button key={i} type="button" className="ff-suggested-prompt" onClick={() => sendMessage(p.text)} style={{ fontSize: 11, padding: '5px 10px' }}>{p.label}</button>
                ))}
              </div>
            )}

            <div className="ff-chat-input-box">
              {attachment && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px 0', borderBottom: '1px solid var(--border)' }}>
                  {attachment.preview
                    ? <img src={attachment.preview} alt={attachment.name} style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />
                    : <div className="ff-chat-attachment-preview-icon"><FileText size={13} style={{ color: 'var(--accent)' }} /></div>
                  }
                  <span className="ff-chat-attachment-name">{attachment.name}</span>
                  <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 3, display: 'flex', alignItems: 'center', borderRadius: 3, flexShrink: 0 }}>
                    <X size={12} />
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf,.txt,.md,.csv,.json,.doc,.docx" style={{ display: 'none' }} onChange={e => { handleAttachFile(e.target.files?.[0]); e.target.value = ''; }} />
              <textarea ref={textareaRef} className="ff-chat-textarea" placeholder="Ask anything about freelancing…" value={input} onChange={(e) => { setInput(e.target.value); autoResize(); }} onKeyDown={handleKeyDown} rows={1} disabled={loading} />
              <div className="ff-chat-input-actions">
                <button type="button" className="ff-chat-attach-btn" onClick={() => fileInputRef.current?.click()} aria-label="Attach file">
                  <Paperclip size={14} />
                </button>
                <button type="button" className="ff-chat-send" onClick={() => sendMessage()} disabled={loading || (!input.trim() && !attachment)} aria-label="Send">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                </button>
              </div>
            </div>
            <p className="ff-text-3" style={{ fontSize: 10.5, textAlign: 'center', marginTop: 6, letterSpacing: '-0.003em' }}>
              Enter to send · Chats saved 15 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* OPTIMIZE TAB                                                           */
/* ====================================================================== */

function OptimizeTab() {
  const [pageType, setPageType] = useState('portfolio');
  const [method, setMethod] = useState('paste');
  const [pasteText, setPasteText] = useState('');
  const [imageData, setImageData] = useState(null);
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');

  const [auditing, setAuditing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [optimized, setOptimized] = useState(null);
  const [copied, setCopied] = useState({});

  const fileInputRef = useRef(null);

  useEffect(() => {
    setResult(null); setOptimized(null); setError('');
  }, [pageType, method]);

  useEffect(() => {
    if (pageType === 'cv' && method !== 'image') {
      setMethod('image');
    }
  }, [pageType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = (file) => {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');

    if (pageType === 'cv') {
      if (!isPdf && !isImage) {
        setError('Upload a PDF or image (PNG, JPG). For Word documents, please export as PDF first.');
        return;
      }
    } else if (!isImage) {
      setError("That doesn't look like an image file.");
      return;
    }

    const sizeLimit = isPdf ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > sizeLimit) {
      setError(`File must be under ${isPdf ? '20MB' : '5MB'}.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const r = e.target.result;
      setImageData({
        data: r.split(',')[1],
        mediaType: isPdf ? 'application/pdf' : file.type,
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        preview: r,
        isPdf,
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const buildPageInputBlock = () => {
    if (method === 'paste') return `PAGE COPY:\n"""\n${pasteText.trim()}\n"""`;
    if (imageData?.isPdf) return '[CV is attached as a PDF document. Read it carefully.]';
    return '[See attached image.]';
  };

  const callClaude = async (prompt, includeAttachment) => {
    const content = [];
    if (includeAttachment && imageData) {
      if (imageData.isPdf) {
        content.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: imageData.data }
        });
      } else {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: imageData.mediaType, data: imageData.data }
        });
      }
    }
    content.push({ type: 'text', text: prompt });
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 8000,
        system: "You are a JSON-only API. You MUST respond with valid, complete JSON only. No prose, no markdown, no commentary, no code fences. Start your response with { and end with }. Every string must be properly escaped. Do not truncate. Make sure all brackets and braces close properly.",
        messages: [{ role: "user", content }]
      })
    });
    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Request failed (${response.status}). ${errBody.slice(0, 200)}`);
    }
    const data = await response.json();
    const rawText = data.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();

    return parseJsonResponse(rawText);
  };

  const parseJsonResponse = (rawText) => {
    if (!rawText) throw new Error('Empty response from API.');

    let text = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    try { return JSON.parse(text); } catch {}

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      try { return JSON.parse(candidate); } catch {}
    }

    if (firstBrace !== -1) {
      let attempt = text.substring(firstBrace);
      const lastClose = attempt.lastIndexOf('}');
      if (lastClose !== -1) attempt = attempt.substring(0, lastClose + 1);
      attempt = attempt.replace(/,(\s*[}\]])/g, '$1');
      try { return JSON.parse(attempt); } catch {}
    }

    const preview = rawText.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(`Could not parse response. The model returned non-JSON output. Preview: "${preview}..."`);
  };

  const handleAudit = async () => {
    if (method === 'paste' && !pasteText.trim()) { setError('Paste the page copy.'); return; }
    if (method === 'image' && !imageData) {
      setError(pageType === 'cv' ? 'Upload your CV (PDF, PNG, or JPG).' : 'Upload a screenshot.');
      return;
    }

    setError(''); setResult(null); setOptimized(null);
    setAuditing(true);

    const pt = PAGE_TYPES[pageType];
    const criteriaList = pt.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n');

    const prompt = `You are an elite conversion strategist auditing a freelancer page. You audit ONLY based on the actual content provided. Do not invent details, do not guess about content not shown. If something is missing, flag it as missing.
${pageType === 'cv' && imageData
  ? (imageData.isPdf
    ? 'NOTE: The applicant\'s CV is attached as a PDF. Read every section carefully. Pull exact phrases, role names, time frames, and metrics from the document.\n'
    : 'NOTE: The applicant\'s CV is attached as an image. Read every visible detail.\n')
  : (imageData && method === 'image' ? 'NOTE: A screenshot of the page is attached. Read every visible detail.\n' : '')}
PAGE TYPE: ${pt.label}
PAGE TYPE DESCRIPTION: ${pt.desc}

AUDIT CRITERIA (score each 1-10):
${criteriaList}

${audience.trim() ? `TARGET AUDIENCE: ${audience.trim()}\n` : ''}${goal.trim() ? `GOAL: ${goal.trim()}\n` : ''}
${buildPageInputBlock()}

Generate ONLY a JSON object:
{
  "overall": { "score": 0-100, "verdict": "3-5 sentences. Lead with a definitive judgment (e.g. 'This page buries the lede.' or 'This profile reads like 90% of competitors.'). Quote or reference an exact phrase from the page when relevant. Then explain what works, what's broken, and the single biggest issue. Brutally honest, no hedging.", "headline": "5-8 word verdict, definitive not vague" },
  "scores": [{ "criterion": "label", "score": 1-10, "note": "one short sentence referencing actual page content" }],
  "recommendations": [{ "priority": "High|Medium|Low", "issue": "1-2 sentences citing what's actually on the page", "fix": "tactical, 1-2 sentences" }],
  "rewrites": [{ "section": "name", "before": "current copy from the page (verbatim or near-verbatim if visible)", "after": "rewritten" }]
}

RULES: Score every criterion. 4-7 recommendations, 3-5 rewrites. Be specific.
${STRICT_RULES}
${pageType === 'cv' ? CV_STRICT_RULES : ''}
Return ONLY JSON. No em dashes.`;

    try {
      const parsed = await callClaude(prompt, method === 'image' || (pageType === 'cv' && !!imageData));
      if (parsed.overall) {
        parsed.overall.verdict = stripEmDashes(parsed.overall.verdict);
        parsed.overall.headline = stripEmDashes(parsed.overall.headline);
      }
      if (Array.isArray(parsed.scores)) parsed.scores = parsed.scores.map(s => ({ ...s, note: stripEmDashes(s.note) }));
      if (Array.isArray(parsed.recommendations)) parsed.recommendations = parsed.recommendations.map(r => ({ ...r, issue: stripEmDashes(r.issue), fix: stripEmDashes(r.fix) }));
      if (Array.isArray(parsed.rewrites)) parsed.rewrites = parsed.rewrites.map(r => ({ ...r, before: stripEmDashes(r.before), after: stripEmDashes(r.after) }));
      setResult(parsed);
    } catch (err) {
      console.error('Audit error:', err);
      setError(err.message || 'Audit failed. Try again, or paste the copy directly.');
    } finally { setAuditing(false); }
  };

  const handleOptimize = async () => {
    if (!result) return;
    setError(''); setOptimizing(true); setOptimized(null);

    const pt = PAGE_TYPES[pageType];
    const sectionsList = pt.rewriteSections.map(s => `- ${s}`).join('\n');

    const platformKeywordGuidance = {
      portfolio: "Weave SEO-friendly niche keywords into the hero headline, subheadline, and About section.",
      sales: "Weave high-intent buying keywords into headline, subheadline, and section headers for paid search and SEO.",
      upwork: "CRITICAL for Upwork/Fiverr. Pull 6-10 highest-volume buyer-search keywords for this niche and weave naturally into title (3-4), first 2 lines of overview (2-3), and skills list (every keyword as a skill). Do not stuff.",
      linkedin: "Weave keywords into the headline, the About section first 3 lines, and across experience entries.",
      cv: "Pull 8-12 ATS keywords from the target role / target audience. Weave them naturally into the professional summary, skills section, and top 2 experience entries. Use the exact phrasing recruiters and ATS systems search for. No keyword stuffing. If no target role is given, infer the most likely role from the CV itself and optimize for that.",
    };

    const prompt = `You are an elite copywriter who studies what TOP-PERFORMING freelancers do, AND you weave in search keywords.

PAGE TYPE: ${pt.label}

${TOP_PERFORMER_PATTERNS[pageType]}

KEYWORD STRATEGY:
${platformKeywordGuidance[pageType]}

PAGE WAS AUDITED. Do NOT repeat these mistakes:
- Verdict: ${result.overall?.headline || 'Underperforming'}
- Issues: ${(result.recommendations || []).map(r => r.issue).join(' | ')}
- Score: ${result.overall?.score || 0}/100

${audience.trim() ? `TARGET: ${audience.trim()}\n` : ''}${goal.trim() ? `GOAL: ${goal.trim()}\n` : ''}

ORIGINAL:
${buildPageInputBlock()}

YOUR TASK:
1. Identify the niche, pull 6-10 highest-search keywords buyers use to find this kind of freelancer.
2. Rewrite the entire page as ONE continuous, ready-to-paste block. Use ALL CAPS section headers (followed by blank line). Sections to cover:
${sectionsList}
3. Weave keywords naturally where they have maximum search impact. No stuffing.
4. Voice: human, specific, direct. No corporate buzzwords. No em dashes. If the original page has any voice (sarcastic, warm, blunt, technical), preserve and amplify it. Do NOT flatten it into generic "professional" tone. The rewrite should sound like the same person, just sharper.
5. Specificity rule: every claim needs a number, named outcome, time frame, or specific niche term. No abstractions. Bad: "I help startups grow." Good: "I help Series A SaaS founders cut churn 18-40% in 90 days."

Generate ONLY:
{
  "summary": {
    "headline": "5-8 word strategic shift",
    "shift": "2 sentences. First explains positioning move. Second explains keyword strategy.",
    "patterns_applied": ["short label", "short label", "short label"],
    "niche": "the niche identified",
    "keywords": ["keyword 1", "keyword 2", "..."]
  },
  "fullRewrite": "COMPLETE rewritten page as one continuous text. ALL CAPS section headers followed by \\n\\n then content. Use \\n for line breaks within sections. All sections: ${pt.rewriteSections.join(', ')}. No commentary."
}

REQUIRED: fullRewrite is finished page copy, not a template. Every section appears in fullRewrite. Keywords woven naturally.
${STRICT_RULES}
${pageType === 'cv' ? CV_STRICT_RULES : ''}
Return ONLY JSON. No em dashes.`;

    try {
      const parsed = await callClaude(prompt, method === 'image' || (pageType === 'cv' && !!imageData));
      if (parsed.summary) {
        parsed.summary.headline = stripEmDashes(parsed.summary.headline);
        parsed.summary.shift = stripEmDashes(parsed.summary.shift);
        parsed.summary.niche = stripEmDashes(parsed.summary.niche);
      }
      if (typeof parsed.fullRewrite === 'string') {
        parsed.fullRewrite = stripEmDashes(parsed.fullRewrite);
      }
      setOptimized(parsed);
      setTimeout(() => {
        document.querySelector('[data-optimized-anchor]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Optimize error:', err);
      setError(err.message || 'Optimization failed.');
    } finally { setOptimizing(false); }
  };

  const copyText = async (which, text) => {
    if (!text) return;
    const mark = () => {
      setCopied(c => ({ ...c, [which]: true }));
      setTimeout(() => setCopied(c => ({ ...c, [which]: false })), 1800);
    };
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        mark(); return;
      }
    } catch {}
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) { mark(); return; }
    } catch {}
    setError('Copy blocked.');
    setTimeout(() => setError(''), 3000);
  };

  const copyAllOptimized = () => {
    if (!optimized?.fullRewrite) return;
    copyText('all', optimized.fullRewrite);
  };

  return (
    <>
      <div className={pageType === 'cv' ? 'ff-cv-selector' : 'ff-2col'}>
        <div>
          <label className="ff-section-label mb-3" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Page Type
            <Tooltip text="Tells the audit which expert criteria and proven patterns to score against. A portfolio is judged differently than an Upwork profile." />
          </label>
          <div className="block"><PageTypeDropdown value={pageType} onChange={setPageType} /></div>
          <p className="ff-field-hint mt-2">{PAGE_TYPES[pageType].desc}</p>
        </div>
        {pageType !== 'cv' && (
          <div>
            <label className="ff-section-label mb-3" style={{ display: 'inline-flex', alignItems: 'center' }}>
              Submission Method
              <Tooltip text="How you want to provide the page. Pasting the copy gives the most accurate audit. A screenshot reads visual hierarchy and copy together." />
            </label>
            <div className="block"><MethodDropdown value={method} onChange={setMethod} /></div>
            <p className="ff-field-hint mt-2">
              {method === 'paste' ? 'Best results: paste the visible copy' : 'Visual and copy audit from a screenshot'}
            </p>
          </div>
        )}
      </div>

      <div className="ff-2col-stack">
        <div>
          <h2 className="ff-section-label mb-5">The Page</h2>

          <div className="space-y-5">
            {method === 'paste' && (
              <div>
                <label className="ff-field-label">Page Copy <span className="ff-text-accent">*</span></label>
                <textarea className="ff-textarea" rows={12} placeholder="Paste headline, subheadline, About section, CTAs, testimonials..." value={pasteText} onChange={e => setPasteText(e.target.value)} />
              </div>
            )}

            {method === 'image' && (
              <div>
                <label className="ff-field-label">
                  {pageType === 'cv' ? 'Your CV / Resume' : 'Screenshot'} <span className="ff-text-accent">*</span>
                </label>
                {!imageData && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={pageType === 'cv' ? '.pdf,application/pdf,image/*' : 'image/*'}
                      onChange={(e) => { handleFileSelect(e.target.files?.[0]); e.target.value = ''; }}
                      style={{ display: 'none' }}
                    />
                    <button type="button" className="ff-attach-btn" style={{ padding: '36px 16px' }} onClick={() => fileInputRef.current?.click()}>
                      <Paperclip size={14} />
                      {pageType === 'cv' ? 'Click to upload your CV (PDF, PNG, or JPG)' : 'Click to upload a screenshot'}
                    </button>
                  </>
                )}
                {imageData && (
                  <div className="ff-image-card ff-fadeup">
                    {imageData.isPdf ? (
                      <div style={{
                        width: 48, height: 48,
                        background: 'var(--accent-bg-soft)',
                        borderRadius: 'var(--r-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <FileText size={20} style={{ color: 'var(--accent)' }} />
                      </div>
                    ) : (
                      <img src={imageData.preview} alt="" className="ff-image-thumb" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" style={{ fontSize: 13, color: 'var(--text-1)' }}>{imageData.name}</div>
                      <div className="flex items-center gap-2 mt-1" style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {imageData.isPdf ? <FileText size={11} /> : <ImageIcon size={11} />}
                        <span>{imageData.sizeKb} KB</span>
                        <span>·</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Attached</span>
                      </div>
                    </div>
                    <button className="ff-x-btn" onClick={() => setImageData(null)}><X size={14} /></button>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="ff-fadeup" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button className="ff-btn" onClick={handleAudit} disabled={auditing || optimizing} style={{ marginTop: 8 }}>
              {auditing ? <><Loader2 size={15} className="animate-spin" />Auditing</> :
               <><Sparkles size={15} />Audit Page<ArrowRight size={15} /></>}
            </button>
          </div>
        </div>

        <div>
          <h2 className="ff-section-label mb-5">The Audit</h2>
          {!result && !auditing && <OptimizeEmpty />}
          {auditing && <OptimizeLoading message="Auditing your page..." />}
          {result && (
            <OptimizeOutput
              result={result}
              pageType={pageType}
              optimized={optimized}
              onOptimize={handleOptimize}
              optimizing={optimizing}
              copied={copied}
              copyText={copyText}
              copyAllOptimized={copyAllOptimized}
            />
          )}
        </div>
      </div>
    </>
  );
}

function OptimizeOutput({ result, pageType, optimized, onOptimize, optimizing, copied, copyText, copyAllOptimized }) {
  const score = Math.max(0, Math.min(100, result.overall?.score ?? 0));
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  const ringColor = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="space-y-6">
      <div className="ff-fadeup ff-card">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="ff-score-ring">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="42" className="ff-score-ring-bg" strokeWidth="5" />
              <circle cx="48" cy="48" r="42" className="ff-score-ring-fg" strokeWidth="5" stroke={ringColor} strokeDasharray={circumference} strokeDashoffset={offset} />
            </svg>
            <div className="ff-score-ring-text">
              <div className="ff-score-ring-num" style={{ color: ringColor }}>{score}</div>
              <div className="ff-score-ring-label">/ 100</div>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="ff-mono mb-2" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {result.overall?.headline}
            </p>
            <p className="ff-verdict">{result.overall?.verdict}</p>
          </div>
        </div>
      </div>

      {result.scores?.length > 0 && (
        <div className="ff-fadeup ff-card" style={{ animationDelay: '60ms' }}>
          <h3 className="ff-subheading mb-4">Criteria</h3>
          {result.scores.map((s, i) => (
            <div key={i}>
              <div className="ff-score-row">
                <div style={{ flex: '0 0 38%', minWidth: '160px' }}>
                  <div style={{ fontSize: 13.5, color: 'var(--text-1)', fontWeight: 500 }}>{s.criterion}</div>
                </div>
                <div className="ff-score-bar-wrap">
                  <div className={`ff-score-bar ff-score-bar-${s.score >= 8 ? 'low' : s.score >= 5 ? 'medium' : 'high'}`} style={{ width: `${(s.score / 10) * 100}%` }} />
                </div>
                <span className="ff-score-num-mini" style={{ color: s.score >= 8 ? 'var(--success)' : s.score >= 5 ? 'var(--warning)' : 'var(--danger)' }}>
                  {s.score}/10
                </span>
              </div>
              {s.note && <p className="ff-text-3" style={{ fontSize: 12.5, marginTop: -2, marginBottom: 6 }}>{s.note}</p>}
            </div>
          ))}
        </div>
      )}

      {result.recommendations?.length > 0 && (
        <div className="ff-fadeup ff-card" style={{ animationDelay: '120ms' }}>
          <h3 className="ff-subheading mb-4">Recommendations</h3>
          <ul className="ff-rec-list">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="ff-rec-item">
                <span className={`ff-rec-prio ff-rec-prio-${(rec.priority || 'medium').toLowerCase()}`}>{rec.priority || 'Medium'}</span>
                <div className="ff-rec-content">
                  <p className="ff-rec-issue">{rec.issue}</p>
                  <div className="ff-rec-fix">
                    <span className="ff-rec-fix-label">Fix</span>
                    {rec.fix}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.rewrites?.length > 0 && (
        <div className="ff-fadeup ff-card" style={{ animationDelay: '180ms' }}>
          <h3 className="ff-subheading mb-4">Quick Rewrites</h3>
          {result.rewrites.map((rw, i) => (
            <div key={i} className="ff-rewrite-card">
              <div className="ff-rewrite-section">{rw.section}</div>
              {rw.before && <div className="ff-rewrite-before">{rw.before}</div>}
              <div className="ff-rewrite-after">{rw.after}</div>
            </div>
          ))}
        </div>
      )}

      <div className="ff-fadeup" style={{ animationDelay: '240ms' }}>
        <div className="ff-optimize-cta" data-optimized-anchor>
          <div className="flex items-start gap-3 mb-4">
            <Wand2 size={20} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />
            <div>
              <p className="ff-optimize-headline">
                Rewrite this page like the top {pageType === 'upwork' ? '1-3%' : '5%'}.
              </p>
              <p className="ff-optimize-sub">
                Apply patterns from top-performing freelancers, weave in niche keywords, and get a complete ready-to-paste rewrite in one click.
              </p>
            </div>
          </div>
          <button className="ff-btn" onClick={onOptimize} disabled={optimizing}>
            {optimizing ? (
              <><Loader2 size={15} className="animate-spin" />Rewriting...</>
            ) : (
              <><Sparkles size={15} />Optimize Now<ArrowRight size={15} /></>
            )}
          </button>
        </div>
      </div>

      {optimized && (
        <div className="ff-fadeup">
          <div className="flex items-end justify-between mb-4">
            <h3 className="ff-subheading">Optimized Page</h3>
            <button className="ff-icon-btn" onClick={copyAllOptimized}>
              {copied.all ? <Check size={12} /> : <Copy size={12} />}
              {copied.all ? 'Copied' : 'Copy All'}
            </button>
          </div>

          {optimized.summary && (
            <div className="ff-card mb-4">
              <p className="ff-mono mb-3" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {optimized.summary.headline}
              </p>
              {optimized.summary.niche && (
                <div className="mb-3 flex items-baseline gap-2">
                  <span className="ff-section-label">Niche</span>
                  <span style={{ fontSize: 13.5, color: 'var(--text-1)', fontWeight: 500 }}>{optimized.summary.niche}</span>
                </div>
              )}
              <p className="ff-verdict mb-4">{optimized.summary.shift}</p>

              {optimized.summary.keywords?.length > 0 && (
                <div className="pt-4 mb-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="ff-section-label block mb-2">Keywords woven in</span>
                  <div className="flex flex-wrap gap-2">
                    {optimized.summary.keywords.map((k, i) => (
                      <span key={i} className="ff-tag">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {optimized.summary.patterns_applied?.length > 0 && (
                <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="ff-section-label block mb-2">Patterns applied</span>
                  <div className="flex flex-wrap gap-2">
                    {optimized.summary.patterns_applied.map((p, i) => (
                      <span key={i} className="ff-tag">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {optimized.fullRewrite && (
            <div className="ff-fadeup ff-card-elevated ff-card" style={{ animationDelay: '60ms' }}>
              <p className="ff-text-3 mb-4" style={{ fontSize: 12, fontStyle: 'italic' }}>
                Ready to paste. Single block, all sections included.
              </p>
              <p
                className="ff-output-text"
                onClick={(e) => {
                  try {
                    const range = document.createRange();
                    range.selectNodeContents(e.currentTarget);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                  } catch {}
                }}
                title="Click to select all"
                style={{ cursor: 'text' }}
              >
                {optimized.fullRewrite}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ====================================================================== */
/* CLOSE TAB                                                              */
/* ====================================================================== */

function CloseTab() {
  const [mode, setMode] = useState('proposal');
  const [intel, setIntel] = useState('');
  const [offer, setOffer] = useState('');
  const [proof, setProof] = useState('');
  const [tone, setTone] = useState('Auto');
  const [imageData, setImageData] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newTag, setNewTag] = useState('');
  const [clientMessage, setClientMessage] = useState('');
  const [myMessage, setMyMessage] = useState('');
  const [goal, setGoal] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [cvFile, setCvFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [resultMode, setResultMode] = useState(null);
  const [copied, setCopied] = useState({});
  const fileInputRef = useRef(null);
  const cvFileInputRef = useRef(null);

  useEffect(() => { setResult(null); setError(''); }, [mode]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError("That's not an image."); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const r = e.target.result;
      setImageData({ data: r.split(',')[1], mediaType: file.type, name: file.name, sizeKb: Math.round(file.size / 1024), preview: r });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleCvFileSelect = (file) => {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = file.type.startsWith('image/');
    if (!isPdf && !isImage) {
      setError('CV must be a PDF, PNG, or JPG. For Word documents, please export as PDF first.');
      return;
    }
    const sizeLimit = isPdf ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > sizeLimit) {
      setError(`CV must be under ${isPdf ? '20MB' : '5MB'}.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const r = e.target.result;
      setCvFile({
        data: r.split(',')[1],
        mediaType: isPdf ? 'application/pdf' : file.type,
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        preview: r,
        isPdf,
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const addPortfolioItem = () => {
    const u = newUrl.trim();
    if (!u) return;
    setPortfolio(p => [...p, { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), url: u, label: newLabel.trim(), tag: newTag.trim() }]);
    setNewUrl(''); setNewLabel(''); setNewTag('');
  };

  const removePortfolioItem = (id) => setPortfolio(p => p.filter(x => x.id !== id));

  const buildPrompt = () => {
    const toneInstruction = tone === 'Auto' ? 'Adapt naturally.' : `${TONE_DIRECTIVES[tone]} Apply consistently.`;

    if (mode === 'followup') {
      const clientBlock = clientMessage.trim() ? `THE CLIENT'S MESSAGE:\n"""\n${clientMessage.trim()}\n"""` : (imageData ? "[The client's message is in the attached image.]" : '[No client message provided.]');
      const myBlock = myMessage.trim() ? `MY LAST REPLY (what I sent before):\n"""\n${myMessage.trim()}\n"""` : '[I have not replied yet, this is the first follow-up.]';

      return `You are an expert freelance closer drafting a follow-up message.
${imageData ? 'NOTE: Image attached, may contain the conversation.\n' : ''}

${clientBlock}

${myBlock}

GOAL OF THIS FOLLOW-UP: ${goal.trim() || 'Re-engage and move the conversation forward.'}

Generate ONLY this JSON:
{
  "clientRead": "1-2 sentences. What kind of client is this? (e.g. 'Cautious buyer testing fit, mentions budget twice.' or 'Decisive operator, wants to move fast.')",
  "situation": "1-2 sentences reading the room. What's the actual state of this conversation? Where did it stall, or what is the client really asking?",
  "followup": "The follow-up message, ready to send. Use \\n for line breaks. 3-6 short paragraphs max. No greeting fluff like 'Hope you're well.'"
}

RULES:
- Match the client's energy and formality from their message.
- Acknowledge without summarizing what they said back to them.
- Move toward the goal without being pushy.
- Offer a soft off-ramp if the client has gone silent (e.g. "If timing isn't right, no worries, just let me know.").
- Reference something specific from their message to prove you read it.
- If I haven't replied yet, treat this as a fresh follow-up that opens new energy. If I have replied, build on what I last said.

VOICE: ${toneInstruction}
${STRICT_RULES}

Return ONLY JSON. No em dashes.`;
    }

    if (mode === 'coverletter') {
      const cvBlock = cvFile
        ? '[The applicant\'s CV is attached. Read it carefully and pull specific outcomes, roles, time frames, and named tools to weave into the letter.]'
        : '[No CV attached. Use only the positioning and proof fields below to write the letter.]';

      const jobBlock = jobDescription.trim()
        ? `JOB DESCRIPTION / POSTING:\n"""\n${jobDescription.trim()}\n"""`
        : `JOB CONTEXT (no full posting given):\n"""\n${intel.trim() || '[Nothing provided.]'}\n"""`;

      return `You are an elite cover letter writer who has gotten people interviews at top companies. You are NOT a cliche generator. Your letters sound like a real, specific person.

${cvBlock}

${jobBlock}

${offer.trim() ? `APPLICANT POSITIONING (their angle):\n"""\n${offer.trim()}\n"""\n` : ''}${proof.trim() ? `APPLICANT PROOF POINT:\n"""\n${proof.trim()}\n"""\n` : ''}

Generate ONLY this JSON:
{
  "extraction": {
    "targetRole": "4-8 words. The actual role being applied for.",
    "company": "The company name if visible, else 'the company'.",
    "topNeed": "1-2 sentences. The single biggest thing this employer is solving for, pulled from the posting.",
    "fitAngle": "1-2 sentences. The applicant's strongest angle for this role, pulled from CV or proof."
  },
  "subject": "Email subject line if applicable. <60 chars. Specific. No 'Application for the X role'.",
  "coverLetter": "The full letter, ready to send. 3-4 short paragraphs max. Use \\n for line breaks between paragraphs."
}

RULES:
- Open with a specific observation about the company, role, or industry. NEVER 'I am writing to apply for' or 'I came across' or 'I'm excited to'.
- Paragraph 1: Hook. State why this role specifically (1-2 sentences max). Reference something concrete from the posting.
- Paragraph 2: Best-fit proof. Pull ONE specific outcome from the CV that matches the role's biggest need. Use a number, time frame, named tool, or dollar figure.
- Paragraph 3: A second angle or point of difference. Why this person, not just any qualified candidate.
- Paragraph 4 (close): One clean sentence asking for the next step. Confident, not begging.
- NEVER use these phrases: 'I am writing to apply', 'I am excited to', 'I'm a great fit', 'I bring a unique blend', 'passionate about', 'proven track record', 'team player', 'I hope this finds you well', 'thank you for your consideration', 'attached is my resume', 'please find my CV', 'I look forward to hearing from you', 'I would love the opportunity'.
- NEVER restate the job posting back at them.
- NEVER use first person more than necessary. Active voice. Present tense for current work, past tense for past wins.
- ZERO buzzwords. Every claim has proof.
- Length: 200-280 words total. Tight.

VOICE: ${toneInstruction}
${STRICT_RULES}

Return ONLY JSON. No em dashes.`;
    }

    if (mode === 'dm') {
      return `You are an expert freelance closer.
${imageData ? 'NOTE: Image attached.\n' : ''}
Generate ONLY: { "clientType": "4-8 words", "hook": "4-10 words", "coldDM": "3-5 lines max, \\n breaks" }
RULES: pattern-breaking opener, reference specific, value fast, soft CTA.
VOICE: ${toneInstruction}
${STRICT_RULES}
INPUT: ${intel.trim() || (imageData ? '[See attached.]' : '')}
${offer.trim() ? `\nOFFER: ${offer}` : ''}
${proof.trim() ? `\nPROOF: ${proof}` : ''}
Return ONLY JSON. No em dashes.`;
    }

    if (mode === 'email') {
      return `You are an expert freelance closer.
${imageData ? 'NOTE: Image attached.\n' : ''}
Generate ONLY: { "clientType": "4-8 words", "subject": "<50 chars no emoji", "body": "4-7 short paragraphs, \\n breaks, sign 'Best, [Your name]'" }
RULES: subject <50 chars, hook in first line, specific reference in first 2 sentences, one low-friction CTA.
VOICE: ${toneInstruction}
${STRICT_RULES}
INPUT: ${intel.trim() || (imageData ? '[See attached.]' : '')}
${offer.trim() ? `\nOFFER: ${offer}` : ''}
${proof.trim() ? `\nPROOF: ${proof}` : ''}
Return ONLY JSON. No em dashes.`;
    }

    const portfolioBlock = portfolio.length > 0
      ? `\nPORTFOLIO:\n${portfolio.map((p, i) => `[${i+1}] URL: ${p.url}${p.label ? ` | LABEL: ${p.label}` : ''}${p.tag ? ` | TAG: ${p.tag}` : ''}`).join('\n')}`
      : '';

    return `You are an expert freelance closer. Write a SHORT, scannable proposal that a busy client can read in 30 seconds.
${imageData ? 'NOTE: Image attached.\n' : ''}

CRITICAL PROPOSAL FORMAT RULES:
- The proposal MUST be structured into exactly 4 named sections
- Each section is SHORT. No walls of text. Clients skim, not read.
- Section 1 "hook": 1-2 punchy sentences max. Name their exact problem. No fluff opener.
- Section 2 "fit": 2-3 bullet points max. Each bullet = one specific reason you are right for this. Numbers where possible.
- Section 3 "process": 3 numbered steps max. Very short. Each step = 5-8 words.
- Section 4 "cta": 1 sentence. Soft, specific next step. No "I look forward to hearing from you."
- coldDM: 3 lines max. Pattern-breaking opener. Immediate value. One question to reply to.

Generate ONLY:
{
  "extraction": { "clientType": "4-8 words", "projectType": "4-7 words", "tone": "3-6 words", "coreProblem": "1-2 sentences", "urgency": "Low|Medium|High", "budgetSignal": "Low|Medium|High", "hiddenIntent": "1-2 sentences" },
  "attachments": [{ "description": "1-2 sentences", "links": ["url from portfolio if matches"] }],
  "proposal": {
    "hook": "1-2 sentences. Their problem, named directly. No greeting. No 'I came across your post'.",
    "fit": ["bullet 1: specific reason with proof/number", "bullet 2: specific reason with proof/number", "bullet 3: specific reason with proof/number"],
    "process": ["Step 1: 5-8 words", "Step 2: 5-8 words", "Step 3: 5-8 words"],
    "cta": "One sentence. Specific and soft. e.g. 'Happy to send over 2-3 relevant examples if useful.'"
  },
  "coldDM": "3 lines, \\n breaks"
}

RULES: 3-5 attachments max. Include EVERY matching portfolio URL. Never invent URLs.
VOICE: ${toneInstruction}
${STRICT_RULES}
INPUT: ${intel.trim() || (imageData ? '[See attached.]' : '')}
${portfolioBlock}
Return ONLY JSON. No em dashes.`;
  };

  const handleGenerate = async () => {
    if (mode === 'followup' && !clientMessage.trim() && !myMessage.trim() && !imageData) { setError("Paste either the client's message or your last reply."); return; }
    if (mode === 'coverletter' && !jobDescription.trim() && !intel.trim() && !cvFile) {
      setError('Paste the job description or upload your CV.');
      return;
    }
    if (mode !== 'followup' && mode !== 'coverletter' && !intel.trim() && !imageData) { setError('Add intel.'); return; }
    setError(''); setLoading(true); setResult(null);

    try {
      const content = [];
      if (mode === 'coverletter' && cvFile) {
        if (cvFile.isPdf) {
          content.push({
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: cvFile.data }
          });
        } else {
          content.push({
            type: 'image',
            source: { type: 'base64', media_type: cvFile.mediaType, data: cvFile.data }
          });
        }
      }
      if (imageData) content.push({ type: 'image', source: { type: 'base64', media_type: imageData.mediaType, data: imageData.data } });
      content.push({ type: 'text', text: buildPrompt() });

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 4000,
          system: "You are a JSON-only API. You MUST respond with valid, complete JSON only. No prose, no markdown, no commentary, no code fences. Start your response with { and end with }. Every string must be properly escaped.",
          messages: [{ role: "user", content }]
        })
      });
      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Request failed (${response.status}). ${errBody.slice(0, 200)}`);
      }

      const data = await response.json();
      const rawText = data.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();

      let parsed;
      let attemptText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      try {
        parsed = JSON.parse(attemptText);
      } catch {
        const firstBrace = attemptText.indexOf('{');
        const lastBrace = attemptText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
          let candidate = attemptText.substring(firstBrace, lastBrace + 1);
          candidate = candidate.replace(/,(\s*[}\]])/g, '$1');
          try { parsed = JSON.parse(candidate); } catch (e) {
            throw new Error(`Could not parse response. Preview: "${rawText.slice(0, 100)}..."`);
          }
        } else {
          throw new Error(`Could not parse response. Preview: "${rawText.slice(0, 100)}..."`);
        }
      }

      Object.keys(parsed).forEach(k => { if (typeof parsed[k] === 'string') parsed[k] = stripEmDashes(parsed[k]); });
      if (parsed.extraction) Object.keys(parsed.extraction).forEach(k => { if (typeof parsed.extraction[k] === 'string') parsed.extraction[k] = stripEmDashes(parsed.extraction[k]); });
      // Handle structured proposal object
      if (parsed.proposal && typeof parsed.proposal === 'object') {
        const p = parsed.proposal;
        if (typeof p.hook === 'string') p.hook = stripEmDashes(p.hook);
        if (typeof p.cta === 'string') p.cta = stripEmDashes(p.cta);
        if (Array.isArray(p.fit)) p.fit = p.fit.map(s => stripEmDashes(s));
        if (Array.isArray(p.process)) p.process = p.process.map(s => stripEmDashes(s));
      } else if (typeof parsed.proposal === 'string') {
        parsed.proposal = stripEmDashes(parsed.proposal);
      }
      if (typeof parsed.coldDM === 'string') parsed.coldDM = stripEmDashes(parsed.coldDM);
      if (Array.isArray(parsed.attachments)) {
        const portfolioUrls = new Set(portfolio.map(p => p.url));
        parsed.attachments = parsed.attachments.map(a => {
          if (typeof a === 'string') return { description: stripEmDashes(a), links: [] };
          return { description: stripEmDashes(a.description || ''), links: Array.isArray(a.links) ? a.links.filter(u => portfolioUrls.has(u)) : [] };
        });
      }

      setResult(parsed);
      setResultMode(mode);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Generation failed.');
    } finally { setLoading(false); }
  };

  const copyText = async (which, text) => {
    if (!text) return;
    const mark = () => { setCopied(c => ({ ...c, [which]: true })); setTimeout(() => setCopied(c => ({ ...c, [which]: false })), 1800); };
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); mark(); return; } } catch {}
    try {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) { mark(); return; }
    } catch {}
    setError('Copy blocked.');
    setTimeout(() => setError(''), 3000);
  };

  const selectAllText = (e) => {
    try {
      const range = document.createRange(); range.selectNodeContents(e.currentTarget);
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    } catch {}
  };

  const pillClass = (level) => {
    const l = (level || '').toLowerCase();
    if (l.includes('high')) return 'ff-pill ff-pill-high';
    if (l.includes('low')) return 'ff-pill ff-pill-low';
    return 'ff-pill ff-pill-medium';
  };

  const portfolioCount = portfolio.length;

  return (
    <>
      <div className="ff-2col">
        <div>
          <label className="ff-section-label mb-3" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Mode
            <Tooltip text="What you're sending. Each mode produces a different format with rules tuned for that channel. A proposal isn't a DM and a DM isn't an email." />
          </label>
          <div className="block"><CloserModeDropdown value={mode} onChange={setMode} /></div>
          <p className="ff-field-hint mt-2">{CLOSER_MODES[mode].desc}</p>
        </div>
        <div>
          <label className="ff-section-label mb-3" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Tone
            <Tooltip text="The voice the message will be written in. Pick one that matches you and the client. The 'auto' option adapts based on the situation." align="right" />
          </label>
          <div className="block"><ToneDropdown value={tone} onChange={setTone} /></div>
          <p className="ff-field-hint mt-2">{TONE_OPTIONS.find(t => t.id === tone)?.desc}</p>
        </div>
      </div>

      <div className="ff-2col-stack">
        <div>
          <h2 className="ff-section-label mb-5">The Input</h2>

          <div className="space-y-5">
            {mode === 'followup' ? (
              <>
                <div>
                  <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Client's last message <span className="ff-text-accent" style={{ marginLeft: 4 }}>*</span>
                    <Tooltip text="Paste their exact words. The follow-up will reference real phrases from this and adapt to the client's tone and pace." />
                  </label>
                  <textarea
                    className="ff-textarea"
                    rows={6}
                    placeholder="Paste exactly what the client wrote..."
                    value={clientMessage}
                    onChange={e => setClientMessage(e.target.value)}
                  />
                  <p className="ff-field-hint mt-2">Used to read the client's tone, intent, and where they're hesitating.</p>
                </div>

                <div>
                  <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Your last reply
                    <span className="ff-field-hint" style={{ fontWeight: 400, marginLeft: 6 }}>· optional</span>
                    <Tooltip text="What you sent before. Leave blank if you're following up for the first time." />
                  </label>
                  <textarea
                    className="ff-textarea"
                    rows={5}
                    placeholder="What you sent before. Leave blank if this is your first follow-up."
                    value={myMessage}
                    onChange={e => setMyMessage(e.target.value)}
                  />
                </div>

                <div>
                  <label className="ff-field-label">
                    Or upload a screenshot <span className="ff-field-hint" style={{ fontWeight: 400 }}>· optional</span>
                  </label>
                  {!imageData && (
                    <>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { handleFileSelect(e.target.files?.[0]); e.target.value = ''; }} style={{ display: 'none' }} />
                      <button type="button" className="ff-attach-btn" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip size={13} /> Attach Screenshot
                      </button>
                    </>
                  )}
                  {imageData && <ImagePreview data={imageData} onRemove={() => setImageData(null)} />}
                </div>

                <div>
                  <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Goal of this follow-up
                    <Tooltip text="The single outcome you want from this message. The reply will be shaped to push toward this exact goal." />
                  </label>
                  <textarea className="ff-textarea" rows={3} placeholder='e.g. "Get them on a 15-min call this week"' value={goal} onChange={e => setGoal(e.target.value)} />
                </div>
              </>
            ) : mode === 'coverletter' ? (
              <>
                <div>
                  <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Job description / posting <span className="ff-text-accent" style={{ marginLeft: 4 }}>*</span>
                    <Tooltip text="Paste the actual job posting. The letter will reference the role's biggest needs and use the same language hiring managers used." />
                  </label>
                  <textarea
                    className="ff-textarea"
                    rows={8}
                    placeholder="Paste the full job posting, role requirements, or whatever the company has shared about the role..."
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Your CV / Resume
                    <span className="ff-field-hint" style={{ fontWeight: 400, marginLeft: 6 }}>· optional but strongly recommended</span>
                    <Tooltip text="Upload your CV so the letter pulls real outcomes, time frames, and named tools from your actual experience. PDF works best." />
                  </label>
                  {!cvFile && (
                    <>
                      <input
                        ref={cvFileInputRef}
                        type="file"
                        accept=".pdf,application/pdf,image/*"
                        onChange={e => { handleCvFileSelect(e.target.files?.[0]); e.target.value = ''; }}
                        style={{ display: 'none' }}
                      />
                      <button type="button" className="ff-attach-btn" onClick={() => cvFileInputRef.current?.click()}>
                        <Paperclip size={13} /> Upload CV (PDF, PNG, JPG)
                      </button>
                    </>
                  )}
                  {cvFile && (
                    <div className="ff-image-card mt-2 ff-fadeup">
                      {cvFile.isPdf ? (
                        <div style={{
                          width: 48, height: 48,
                          background: 'var(--accent-bg-soft)',
                          borderRadius: 'var(--r-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <FileText size={20} style={{ color: 'var(--accent)' }} />
                        </div>
                      ) : (
                        <img src={cvFile.preview} alt="" className="ff-image-thumb" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate" style={{ fontSize: 13, color: 'var(--text-1)' }}>{cvFile.name}</div>
                        <div className="flex items-center gap-2 mt-1" style={{ fontSize: 12, color: 'var(--text-3)' }}>
                          {cvFile.isPdf ? <FileText size={11} /> : <ImageIcon size={11} />}
                          <span>{cvFile.sizeKb} KB</span>
                          <span>·</span>
                          <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Attached</span>
                        </div>
                      </div>
                      <button className="ff-x-btn" onClick={() => setCvFile(null)}><X size={14} /></button>
                    </div>
                  )}
                </div>

              </>
            ) : (
              <>
                <div>
                  <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Intel <span className="ff-text-accent" style={{ marginLeft: 4 }}>*</span>
                    <Tooltip text="Whatever you know about the lead. Job post, company info, recent funding, their LinkedIn About, anything specific. The more raw context, the sharper the output." />
                  </label>
                  <textarea className="ff-textarea" rows={8} placeholder="Job post, company info, or what you know." value={intel} onChange={e => setIntel(e.target.value)} />
                  {!imageData && (
                    <div className="mt-2">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { handleFileSelect(e.target.files?.[0]); e.target.value = ''; }} style={{ display: 'none' }} />
                      <button type="button" className="ff-attach-btn" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip size={13} /> Attach Screenshot
                      </button>
                    </div>
                  )}
                  {imageData && <ImagePreview data={imageData} onRemove={() => setImageData(null)} />}
                </div>

                {mode === 'proposal' && (
                  <div>
                    <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      Portfolio Library
                      <span className="ff-field-hint" style={{ fontWeight: 400, marginLeft: 6 }}>· {portfolioCount} {portfolioCount === 1 ? 'link' : 'links'}</span>
                      <Tooltip text="Add links to past work with optional labels and tags. Relevant pieces will be matched and recommended as attachments in the proposal." />
                    </label>
                    {portfolio.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {portfolio.map(item => <PortfolioCard key={item.id} item={item} onRemove={() => removePortfolioItem(item.id)} />)}
                      </div>
                    )}
                    <div className="ff-portfolio-form space-y-2">
                      <input type="url" className="ff-input" placeholder="https://your-link.com" value={newUrl} onChange={e => setNewUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioItem())} />
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" className="ff-input" placeholder="Label" value={newLabel} onChange={e => setNewLabel(e.target.value)} />
                        <input type="text" className="ff-input" placeholder="Tag" value={newTag} onChange={e => setNewTag(e.target.value)} />
                      </div>
                      <button type="button" onClick={addPortfolioItem} disabled={!newUrl.trim()} className="ff-btn ff-btn-secondary">
                        <Plus size={13} /> Add to Library
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="ff-fadeup" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button className="ff-btn" onClick={handleGenerate} disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <><Loader2 size={15} className="animate-spin" />Drafting</> : <><Sparkles size={15} />{CLOSER_MODES[mode].cta}<ArrowRight size={15} /></>}
            </button>
          </div>
        </div>

        <div>
          <h2 className="ff-section-label mb-5">The Output</h2>
          {!result && !loading && <CloserEmpty mode={mode} />}
          {loading && <OptimizeLoading message={`Drafting your ${CLOSER_MODES[mode].label.toLowerCase()}...`} />}
          {result && resultMode === 'proposal' && <ProposalOutput result={result} pillClass={pillClass} portfolio={portfolio} copied={copied} copyText={copyText} selectAllText={selectAllText} />}
          {result && resultMode === 'dm' && <DMOutput result={result} copied={copied} copyText={copyText} selectAllText={selectAllText} />}
          {result && resultMode === 'email' && <EmailOutput result={result} copied={copied} copyText={copyText} selectAllText={selectAllText} />}
          {result && resultMode === 'followup' && <FollowupOutput result={result} copied={copied} copyText={copyText} selectAllText={selectAllText} />}
          {result && resultMode === 'coverletter' && <CoverLetterOutput result={result} copied={copied} copyText={copyText} selectAllText={selectAllText} />}
        </div>
      </div>
    </>
  );
}

/* ====================================================================== */
/* PIPELINE TAB                                                           */
/* ====================================================================== */

const PIPELINE_STATUSES = [
  { id: 'sent', label: 'Sent', color: 'var(--text-3)', bg: 'var(--bg-elev-2)' },
  { id: 'replied', label: 'Replied', color: 'var(--accent)', bg: 'var(--accent-bg-soft)' },
  { id: 'in_talks', label: 'In Talks', color: 'var(--warning)', bg: 'var(--warning-bg)' },
  { id: 'closed_won', label: 'Closed Won', color: 'var(--success)', bg: 'var(--success-bg)' },
  { id: 'closed_lost', label: 'Closed Lost', color: 'var(--danger)', bg: 'var(--danger-bg)' },
];

const PIPELINE_TYPES = [
  { id: 'proposal', label: 'Proposal' },
  { id: 'dm', label: 'Cold DM' },
  { id: 'email', label: 'Cold Email' },
  { id: 'followup', label: 'Follow-up' },
];

const PIPELINE_STORAGE_KEY = 'ff_pipeline_v1';
const PIPELINE_RETENTION_DAYS = 15;

function loadPipelineFromStorage() {
  try {
    const raw = localStorage.getItem(PIPELINE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - PIPELINE_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    return parsed
      .filter(e => e && typeof e === 'object' && e.id && e.client)
      .filter(e => {
        const ts = typeof e.createdAt === 'number' ? e.createdAt : Date.parse(e.date || '');
        return !isNaN(ts) && ts >= cutoff;
      });
  } catch {
    return [];
  }
}

function savePipelineToStorage(entries) {
  try {
    localStorage.setItem(PIPELINE_STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function daysAgoLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff < 0) return 'scheduled';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}y ago`;
}

function isWithinDays(dateStr, days) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d)) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return d >= cutoff;
}

function PipelineTab() {
  const todayStr = () => new Date().toISOString().slice(0, 10);

  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [client, setClient] = useState('');
  const [type, setType] = useState('proposal');
  const [status, setStatus] = useState('sent');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [entryDate, setEntryDate] = useState(todayStr());
  const [loaded, setLoaded] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [activityPeriod, setActivityPeriod] = useState('week');

  useEffect(() => {
    const stored = loadPipelineFromStorage();
    setEntries(stored);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) savePipelineToStorage(entries);
  }, [entries, loaded]);

  const addEntry = () => {
    if (!client.trim()) return;
    const now = Date.now();
    const dateToUse = entryDate || todayStr();
    setEntries(e => [
      {
        id: now.toString(36) + Math.random().toString(36).slice(2, 5),
        date: dateToUse,
        createdAt: now,
        client: client.trim(),
        type,
        status,
        value: value.trim(),
        notes: notes.trim(),
      },
      ...e,
    ]);
    setClient(''); setValue(''); setNotes(''); setStatus('sent'); setType('proposal');
    setEntryDate(todayStr());
    setShowForm(false);
  };

  const updateStatus = (id, newStatus) => {
    setEntries(e => e.map(x => x.id === id ? { ...x, status: newStatus } : x));
  };

  const removeEntry = (id) => setEntries(e => e.filter(x => x.id !== id));

  const stats = {
    total: entries.length,
    sent: entries.filter(e => e.status === 'sent').length,
    replied: entries.filter(e => e.status === 'replied').length,
    inTalks: entries.filter(e => e.status === 'in_talks').length,
    won: entries.filter(e => e.status === 'closed_won').length,
    lost: entries.filter(e => e.status === 'closed_lost').length,
  };
  const replyRate = stats.total > 0 ? Math.round((stats.replied + stats.inTalks + stats.won + stats.lost) / stats.total * 100) : 0;
  const winRate = (stats.won + stats.lost) > 0 ? Math.round(stats.won / (stats.won + stats.lost) * 100) : 0;
  const totalValue = entries.filter(e => e.status === 'closed_won' && e.value).reduce((sum, e) => {
    const num = parseFloat(e.value.replace(/[^0-9.]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  const computeWindow = (days) => {
    const inWindow = entries.filter(e => isWithinDays(e.date, days));
    const won = inWindow.filter(e => e.status === 'closed_won');
    const replied = inWindow.filter(e => e.status !== 'sent');
    const wonRevenue = won.reduce((sum, e) => {
      const num = parseFloat((e.value || '').replace(/[^0-9.]/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
    return {
      sent: inWindow.length,
      replied: replied.length,
      won: won.length,
      revenue: wonRevenue,
    };
  };
  const week = computeWindow(7);
  const month = computeWindow(30);
  const year = computeWindow(365);

  return (
    <div className="ff-fadeup">
      <div className="ff-pipeline-topbar">
        <div>
          <h2 className="ff-display ff-text-1" style={{ fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>
            Your pipeline
          </h2>
          <p className="ff-text-2 mt-1" style={{ fontSize: 14, lineHeight: 1.5 }}>
            Track every proposal, DM, and email. See what's working.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <button
              className="ff-btn ff-btn-secondary"
              onClick={() => setShowActivity(true)}
              style={{ width: 'auto', padding: '10px 16px' }}
            >
              <TrendingUp size={14} />
              Activity
            </button>
          )}
          <button
            className="ff-btn"
            onClick={() => setShowForm(s => !s)}
            style={{ width: 'auto', padding: '10px 18px' }}
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Cancel' : 'Add Entry'}
          </button>
        </div>
      </div>

      <div className="ff-stat-cards">
        <StatCard label="Total Sent" value={stats.total} />
        <StatCard label="Replies" value={`${stats.replied + stats.inTalks + stats.won + stats.lost}`} sub={`${replyRate}% reply rate`} />
        <StatCard label="Closed Won" value={stats.won} sub={winRate > 0 ? `${winRate}% win rate` : null} accent />
        <StatCard label="Revenue" value={totalValue > 0 ? `$${totalValue.toLocaleString()}` : '—'} sub="from closed deals" />
      </div>

      {showForm && (
        <div className="ff-card ff-fadeup mb-8" style={{ padding: 20 }}>
          <h3 className="ff-subheading mb-4" style={{ fontSize: 16 }}>New entry</h3>
          <div className="ff-2col">
            <div>
              <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                Date sent
                <Tooltip text="When you actually sent the proposal, DM, or email." />
              </label>
              <input
                type="date"
                className="ff-input"
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                max={todayStr()}
                style={{ cursor: 'pointer' }}
              />
            </div>
            <div>
              <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                Client / Company <span className="ff-text-accent" style={{ marginLeft: 4 }}>*</span>
                <Tooltip text="Who you sent this to." align="right" />
              </label>
              <input type="text" className="ff-input" placeholder="e.g. Acme Corp" value={client} onChange={e => setClient(e.target.value)} />
            </div>
            <div>
              <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                Type
                <Tooltip text="What kind of outreach this was." align="right" />
              </label>
              <select className="ff-input" value={type} onChange={e => setType(e.target.value)} style={{ cursor: 'pointer' }}>
                {PIPELINE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                Status
                <Tooltip text="Where this lead is right now." />
              </label>
              <select className="ff-input" value={status} onChange={e => setStatus(e.target.value)} style={{ cursor: 'pointer' }}>
                {PIPELINE_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                Value <span className="ff-field-hint" style={{ fontWeight: 400, marginLeft: 6 }}>· optional</span>
                <Tooltip text="Deal size." align="right" />
              </label>
              <input type="text" className="ff-input" placeholder="e.g. $5,000 or $2k/mo" value={value} onChange={e => setValue(e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <label className="ff-field-label">
              Notes <span className="ff-field-hint" style={{ fontWeight: 400 }}>· optional</span>
            </label>
            <textarea className="ff-textarea" rows={2} placeholder="Brief context, where you found them, etc." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-2 mt-4">
            <button className="ff-btn" onClick={addEntry} disabled={!client.trim()} style={{ width: 'auto', padding: '10px 18px' }}>
              <Check size={14} /> Save Entry
            </button>
            <button className="ff-btn ff-btn-secondary" onClick={() => setShowForm(false)} style={{ width: 'auto', padding: '10px 18px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 && !showForm && (
        <div className="ff-empty-state">
          <TrendingUp size={28} style={{ color: 'var(--text-3)', display: 'inline-block', marginBottom: 12, opacity: 0.5 }} />
          <p className="ff-display ff-text-1 mb-3" style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 400, letterSpacing: '-0.02em' }}>
            Nothing logged yet.
          </p>
          <p className="ff-text-3" style={{ fontSize: 13, lineHeight: 1.55 }}>
            Add an entry every time you send a proposal, DM, or email.<br/>
            Track replies and close rates over time.
          </p>
          <p className="ff-text-3 mt-4" style={{ fontSize: 11, lineHeight: 1.5, fontStyle: 'italic' }}>
            Saved in your browser for 15 days. No account needed.
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="ff-card" style={{ padding: 0 }}>
          <div className="ff-pipeline-table-header">
            <span className="ff-section-label" style={{ fontSize: 10 }}>Date</span>
            <span className="ff-section-label" style={{ fontSize: 10 }}>Client</span>
            <span className="ff-section-label ff-pipeline-col-type" style={{ fontSize: 10 }}>Type</span>
            <span className="ff-section-label" style={{ fontSize: 10 }}>Status</span>
            <span className="ff-section-label ff-pipeline-col-value" style={{ fontSize: 10 }}>Value</span>
            <span></span>
          </div>
          {entries.map((entry, i) => (
            <PipelineRow
              key={entry.id}
              entry={entry}
              onStatusChange={(s) => updateStatus(entry.id, s)}
              onRemove={() => removeEntry(entry.id)}
              delay={i * 40}
            />
          ))}
        </div>
      )}

      <ActivityModal
        open={showActivity}
        onClose={() => setShowActivity(false)}
        period={activityPeriod}
        setPeriod={setActivityPeriod}
        week={week}
        month={month}
        year={year}
      />
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="ff-card ff-fadeup" style={{ padding: 18 }}>
      <p className="ff-section-label mb-2" style={{ fontSize: 10.5 }}>{label}</p>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        lineHeight: 1.1,
        fontWeight: 500,
        letterSpacing: '-0.022em',
        color: accent ? 'var(--accent)' : 'var(--text-1)',
        fontFeatureSettings: "'tnum'",
      }}>
        {value}
      </p>
      {sub && <p className="ff-text-3 mt-1" style={{ fontSize: 11.5 }}>{sub}</p>}
    </div>
  );
}

function ActivityModal({ open, onClose, period, setPeriod, week, month, year }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const periodMap = { week, month, year };
  const periodLabels = { week: 'This week', month: 'This month', year: 'This year' };
  const data = periodMap[period] || week;

  const replyRate = data.sent > 0 ? Math.round((data.replied / data.sent) * 100) : 0;
  const winRate = data.sent > 0 ? Math.round((data.won / data.sent) * 100) : 0;

  const chartBars = [
    { label: 'Sent', value: data.sent, color: 'var(--text-2)' },
    { label: 'Replied', value: data.replied, color: 'var(--accent)' },
    { label: 'Won', value: data.won, color: 'var(--success)' },
  ];

  const maxBarValue = Math.max(1, ...chartBars.map(b => b.value));

  const periods = [
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ];

  return (
    <div
      className="ff-modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div className="ff-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ff-modal-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400, letterSpacing: '-0.018em', color: 'var(--text-1)', margin: 0 }}>
              Activity
            </h2>
          </div>
          <button className="ff-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="ff-modal-body">
          <div style={{ display: 'inline-flex', padding: 3, background: 'var(--bg-elev-2)', borderRadius: 10, marginBottom: 24 }}>
            {periods.map(p => {
              const active = p.id === period;
              return (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  style={{
                    appearance: 'none', border: 'none',
                    background: active ? 'var(--bg-elev-1)' : 'transparent',
                    color: active ? 'var(--text-1)' : 'var(--text-3)',
                    padding: '7px 16px', borderRadius: 7,
                    fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--font-text)',
                    cursor: 'pointer',
                    transition: 'background 220ms, color 220ms',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, paddingBottom: 24, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
            <SummaryStat label="Reply rate" value={`${replyRate}%`} />
            <SummaryStat label="Win rate" value={`${winRate}%`} accent />
            <SummaryStat label="Revenue" value={data.revenue > 0 ? `$${data.revenue.toLocaleString()}` : '—'} />
            <SummaryStat label="Period" value={periodLabels[period]} muted />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
              <span className="ff-section-label" style={{ fontSize: 10.5 }}>Breakdown</span>
              <span style={{ fontSize: 11.5, color: 'var(--text-3)', fontFeatureSettings: "'tnum'" }}>{data.sent} {data.sent === 1 ? 'entry' : 'entries'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {chartBars.map((bar, i) => {
                const widthPct = data.sent > 0 ? (bar.value / maxBarValue) * 100 : 0;
                return (
                  <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 72, fontSize: 12.5, color: 'var(--text-2)', fontWeight: 500, flexShrink: 0 }}>{bar.label}</div>
                    <div style={{ flex: 1, height: 26, background: 'var(--bg-elev-2)', borderRadius: 7, overflow: 'hidden' }}>
                      <div
                        key={`${period}-${bar.label}`}
                        style={{
                          height: '100%', width: `${widthPct}%`,
                          background: bar.color, borderRadius: 7,
                          transformOrigin: 'left center',
                          animation: `ff-bar-grow 620ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 60}ms backwards`,
                        }}
                      />
                    </div>
                    <div style={{ width: 36, textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, color: 'var(--text-1)', flexShrink: 0 }}>{bar.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, accent, muted }) {
  return (
    <div>
      <p className="ff-section-label" style={{ fontSize: 10, marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em', color: accent ? 'var(--accent)' : (muted ? 'var(--text-2)' : 'var(--text-1)'), margin: 0, lineHeight: 1.1 }}>
        {value}
      </p>
    </div>
  );
}

function PipelineRow({ entry, onStatusChange, onRemove, delay }) {
  const status = PIPELINE_STATUSES.find(s => s.id === entry.status);
  const type = PIPELINE_TYPES.find(t => t.id === entry.type);
  const [statusOpen, setStatusOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setStatusOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="ff-fadein ff-pipeline-row-grid"
      style={{
        borderBottom: '1px solid var(--border)',
        alignItems: 'center',
        animationDelay: `${delay}ms`,
        position: 'relative',
        zIndex: statusOpen ? 20 : 'auto',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span className="ff-mono" style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{formatShortDate(entry.date)}</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{daysAgoLabel(entry.date)}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.005em' }} className="truncate">{entry.client}</p>
        {entry.notes && <p className="truncate" style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{entry.notes}</p>}
      </div>
      <span className="ff-pipeline-col-type" style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{type?.label}</span>
      <div className="ff-dropdown" ref={ref} style={{ width: '100%' }}>
        <button
          type="button"
          onClick={() => setStatusOpen(o => !o)}
          style={{
            background: status?.bg || 'var(--bg-elev-2)',
            color: status?.color || 'var(--text-2)',
            border: 'none', padding: '4px 10px',
            borderRadius: 'var(--r-pill)',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          {status?.label}<ChevronDown size={11} />
        </button>
        {statusOpen && (
          <div className="ff-dropdown-menu" style={{ minWidth: 160 }}>
            {PIPELINE_STATUSES.map(s => (
              <button
                key={s.id} type="button"
                className={`ff-dropdown-option ${s.id === entry.status ? 'ff-dropdown-option-active' : ''}`}
                onClick={() => { onStatusChange(s.id); setStatusOpen(false); }}
              >
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.color, marginTop: 6 }}></span>
                <div className="ff-dropdown-option-text">
                  <span className="ff-dropdown-option-label" style={{ fontSize: 13 }}>{s.label}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <span className="ff-pipeline-col-value" style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500, fontFeatureSettings: "'tnum'" }}>{entry.value || '—'}</span>
      <button
        onClick={onRemove}
        style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4, borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--t-fast)' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-bg)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/* DROPDOWNS */

function PageTypeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const ActiveIcon = PAGE_TYPES[value].icon;
  return (
    <div className="ff-dropdown" ref={ref}>
      <button type="button" className="ff-dropdown-trigger" onClick={() => setOpen(o => !o)}>
        <ActiveIcon size={14} />
        {PAGE_TYPES[value].label}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease', marginLeft: 4 }} />
      </button>
      {open && (
        <div className="ff-dropdown-menu">
          {Object.entries(PAGE_TYPES).map(([key, m]) => {
            const Icon = m.icon;
            return (
              <button key={key} type="button" className={`ff-dropdown-option ${key === value ? 'ff-dropdown-option-active' : ''}`} onClick={() => { onChange(key); setOpen(false); }}>
                <Icon size={15} className="ff-dropdown-option-icon" />
                <div className="ff-dropdown-option-text">
                  <span className="ff-dropdown-option-label">{m.label}</span>
                  <span className="ff-dropdown-option-desc">{m.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CloserModeDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const ActiveIcon = CLOSER_MODES[value].icon;
  return (
    <div className="ff-dropdown" ref={ref}>
      <button type="button" className="ff-dropdown-trigger" onClick={() => setOpen(o => !o)}>
        <ActiveIcon size={14} />
        {CLOSER_MODES[value].label}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease', marginLeft: 4 }} />
      </button>
      {open && (
        <div className="ff-dropdown-menu">
          {Object.entries(CLOSER_MODES).map(([key, m]) => {
            const Icon = m.icon;
            return (
              <button key={key} type="button" className={`ff-dropdown-option ${key === value ? 'ff-dropdown-option-active' : ''}`} onClick={() => { onChange(key); setOpen(false); }}>
                <Icon size={15} className="ff-dropdown-option-icon" />
                <div className="ff-dropdown-option-text">
                  <span className="ff-dropdown-option-label">{m.label}</span>
                  <span className="ff-dropdown-option-desc">{m.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToneDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const active = TONE_OPTIONS.find(t => t.id === value);
  return (
    <div className="ff-dropdown" ref={ref}>
      <button type="button" className="ff-dropdown-trigger" onClick={() => setOpen(o => !o)} style={{ minWidth: 160 }}>
        <span style={{ fontWeight: 600 }}>{active?.id}</span>
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease', marginLeft: 'auto' }} />
      </button>
      {open && (
        <div className="ff-dropdown-menu" style={{ minWidth: 240, maxHeight: 380, overflowY: 'auto' }}>
          {TONE_OPTIONS.map(opt => (
            <button key={opt.id} type="button" className={`ff-dropdown-option ${opt.id === value ? 'ff-dropdown-option-active' : ''}`} onClick={() => { onChange(opt.id); setOpen(false); }}>
              <div className="ff-dropdown-option-text">
                <span className="ff-dropdown-option-label">{opt.id}</span>
                <span className="ff-dropdown-option-desc">{opt.desc}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MethodDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const methods = {
    paste: { label: 'Paste Copy', desc: 'Most accurate audit', icon: Type },
    image: { label: 'Screenshot', desc: 'Visual and copy audit', icon: ImgIcon },
  };
  const active = methods[value];
  const ActiveIcon = active.icon;
  return (
    <div className="ff-dropdown" ref={ref}>
      <button type="button" className="ff-dropdown-trigger" onClick={() => setOpen(o => !o)}>
        <ActiveIcon size={14} />
        {active.label}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease', marginLeft: 4 }} />
      </button>
      {open && (
        <div className="ff-dropdown-menu">
          {Object.entries(methods).map(([key, m]) => {
            const Icon = m.icon;
            return (
              <button key={key} type="button" className={`ff-dropdown-option ${key === value ? 'ff-dropdown-option-active' : ''}`} onClick={() => { onChange(key); setOpen(false); }}>
                <Icon size={15} className="ff-dropdown-option-icon" />
                <div className="ff-dropdown-option-text">
                  <span className="ff-dropdown-option-label">{m.label}</span>
                  <span className="ff-dropdown-option-desc">{m.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* SHARED */

function Tooltip({ text, align = 'center' }) {
  return (
    <span className="ff-tooltip-wrap">
      <button type="button" className="ff-tooltip-trigger" aria-label="More info" tabIndex={0} onClick={(e) => e.preventDefault()}>
        <HelpCircle size={13} strokeWidth={2.2} />
      </button>
      <span className={`ff-tooltip-bubble${align === 'right' ? ' ff-tooltip-bubble--right' : ''}`} role="tooltip">{text}</span>
    </span>
  );
}

function ImagePreview({ data, onRemove }) {
  return (
    <div className="ff-image-card mt-2 ff-fadeup">
      <img src={data.preview} alt="" className="ff-image-thumb" />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate" style={{ fontSize: 13, color: 'var(--text-1)' }}>{data.name}</div>
        <div className="flex items-center gap-2 mt-1" style={{ fontSize: 12, color: 'var(--text-3)' }}>
          <ImageIcon size={11} />
          <span>{data.sizeKb} KB</span>
          <span>·</span>
          <span style={{ color: 'var(--accent)', fontWeight: 500 }}>Attached</span>
        </div>
      </div>
      <button className="ff-x-btn" onClick={onRemove}><X size={14} /></button>
    </div>
  );
}

function PortfolioCard({ item, onRemove }) {
  return (
    <div className="ff-portfolio-card ff-fadeup">
      <div className="flex-1 min-w-0">
        {item.label && <div className="font-medium leading-tight mb-1 truncate" style={{ fontSize: 13.5, color: 'var(--text-1)' }}>{item.label}</div>}
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline truncate max-w-full" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, wordBreak: 'break-all' }}>
          <LinkIcon size={11} className="flex-shrink-0" />
          <span className="truncate">{item.url}</span>
        </a>
        {item.tag && <div className="mt-2"><span className="ff-tag">{item.tag}</span></div>}
      </div>
      <button className="ff-x-btn flex-shrink-0" onClick={onRemove}><X size={14} /></button>
    </div>
  );
}

function ProposalOutput({ result, pillClass, portfolio, copied, copyText, selectAllText }) {
  // Build plain-text version for copying
  const proposalText = (() => {
    const p = result.proposal;
    if (!p) return '';
    if (typeof p === 'string') return p;
    const lines = [];
    if (p.hook) lines.push(p.hook);
    if (p.fit?.length) { lines.push(''); p.fit.forEach(b => lines.push(`• ${b}`)); }
    if (p.process?.length) { lines.push(''); p.process.forEach((s, i) => lines.push(`${i + 1}. ${s}`)); }
    if (p.cta) { lines.push(''); lines.push(p.cta); }
    return lines.join('\n');
  })();

  const proposal = result.proposal;
  const isStructured = proposal && typeof proposal === 'object';

  return (
    <div className="space-y-5">
      {/* Breakdown */}
      <div className="ff-fadeup ff-card">
        <h3 className="ff-subheading mb-4">Read</h3>
        <div className="ff-detail-grid">
          <Cell label="Client Type" value={result.extraction?.clientType} />
          <Cell label="Project" value={result.extraction?.projectType} accent />
          <Cell label="Urgency"><span className={pillClass(result.extraction?.urgency)}>{result.extraction?.urgency}</span></Cell>
          <Cell label="Budget"><span className={pillClass(result.extraction?.budgetSignal)}>{result.extraction?.budgetSignal}</span></Cell>
          <Cell label="Core Problem" value={result.extraction?.coreProblem} wide />
          <Cell label="Hidden Intent" value={result.extraction?.hiddenIntent} wide />
        </div>
      </div>

      {/* Structured Proposal */}
      {proposal && (
        <div className="ff-fadeup" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="ff-subheading">Proposal</h3>
            <button className="ff-icon-btn" onClick={() => copyText('proposal', proposalText)}>
              {copied.proposal ? <Check size={12} /> : <Copy size={12} />}
              {copied.proposal ? 'Copied' : 'Copy'}
            </button>
          </div>

          {isStructured ? (
            <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Hook */}
              {proposal.hook && (
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
                  <span className="ff-section-label" style={{ display: 'block', marginBottom: 8 }}>Hook</span>
                  <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--text-1)', fontWeight: 500, letterSpacing: '-0.005em', margin: 0 }}>{proposal.hook}</p>
                </div>
              )}

              {/* Why me */}
              {proposal.fit?.length > 0 && (
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
                  <span className="ff-section-label" style={{ display: 'block', marginBottom: 10 }}>Why me</span>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {proposal.fit.map((b, i) => (
                      <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 7 }} />
                        <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-1)', letterSpacing: '-0.005em' }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Process */}
              {proposal.process?.length > 0 && (
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
                  <span className="ff-section-label" style={{ display: 'block', marginBottom: 10 }}>How it works</span>
                  <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {proposal.process.map((s, i) => (
                      <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', flexShrink: 0, width: 18, paddingTop: 2 }}>{String(i + 1).padStart(2, '0')}</span>
                        <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-1)', letterSpacing: '-0.005em' }}>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* CTA */}
              {proposal.cta && (
                <div style={{ padding: '16px 20px', background: 'var(--accent-bg-soft)' }}>
                  <span className="ff-section-label" style={{ display: 'block', marginBottom: 6, color: 'var(--accent)' }}>Next step</span>
                  <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--text-1)', fontWeight: 500, letterSpacing: '-0.005em', margin: 0 }}>{proposal.cta}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="ff-card">
              <p className="ff-output-text" onClick={selectAllText} style={{ cursor: 'text' }}>{proposalText}</p>
            </div>
          )}
        </div>
      )}

      {/* Suggested Attachments */}
      {result.attachments?.length > 0 && (
        <div className="ff-fadeup ff-card" style={{ animationDelay: '120ms' }}>
          <h3 className="ff-subheading mb-4">Attachments to send</h3>
          <ul className="ff-attach-list">
            {result.attachments.map((item, i) => (
              <li key={i} className="ff-attach-item">
                <span className="ff-attach-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex-1 min-w-0">
                  <p className="ff-attach-text">{item.description}</p>
                  {item.links?.length > 0 && (
                    <ul className="ff-attach-links">
                      {item.links.map((url, j) => {
                        const matched = portfolio.find(p => p.url === url);
                        return (
                          <li key={j}>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="ff-attach-link">
                              <ExternalLink size={11} />
                              {matched?.label || url}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {(!item.links || item.links.length === 0) && portfolio.length > 0 && (
                    <p className="ff-attach-no-link">No matching link in your library yet.</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cold DM */}
      <OutputBlock title="Cold DM" text={result.coldDM} copyKey="dm" copied={copied} copyText={copyText} selectAllText={selectAllText} delay={180} />
    </div>
  );
}

function DMOutput({ result, copied, copyText, selectAllText }) {
  return (
    <div className="space-y-5">
      <div className="ff-fadeup">
        <div className="ff-context-strip">
          <div className="ff-context-strip-item">
            <span className="ff-context-strip-label">Client</span>
            <span className="ff-context-strip-value">{result.clientType || '...'}</span>
          </div>
          {result.hook && (
            <div className="ff-context-strip-item">
              <span className="ff-context-strip-label">Hook</span>
              <span className="ff-context-strip-value">{result.hook}</span>
            </div>
          )}
        </div>
      </div>
      <OutputBlock title="Cold DM" text={result.coldDM} copyKey="dm" copied={copied} copyText={copyText} selectAllText={selectAllText} delay={60} />
    </div>
  );
}

function EmailOutput({ result, copied, copyText, selectAllText }) {
  const fullEmail = `Subject: ${result.subject || ''}\n\n${result.body || ''}`;
  return (
    <div className="space-y-5">
      <div className="ff-fadeup">
        <div className="ff-context-strip">
          <div className="ff-context-strip-item">
            <span className="ff-context-strip-label">Client</span>
            <span className="ff-context-strip-value">{result.clientType || '...'}</span>
          </div>
        </div>
      </div>
      <div className="ff-fadeup" style={{ animationDelay: '60ms' }}>
        <div className="flex items-end justify-between mb-3">
          <h3 className="ff-subheading">Subject</h3>
          <button className="ff-icon-btn" onClick={() => copyText('subject', result.subject)}>
            {copied.subject ? <Check size={12} /> : <Copy size={12} />}
            {copied.subject ? 'Copied' : 'Copy'}
          </button>
        </div>
        <div className="ff-subject-card">
          <div className="ff-subject-text">{result.subject || ''}</div>
        </div>
      </div>
      <div className="ff-fadeup" style={{ animationDelay: '120ms' }}>
        <div className="flex items-end justify-between mb-3">
          <h3 className="ff-subheading">Body</h3>
          <div className="flex gap-2">
            <button className="ff-icon-btn" onClick={() => copyText('body', result.body)}>
              {copied.body ? <Check size={12} /> : <Copy size={12} />}
              {copied.body ? 'Copied' : 'Body'}
            </button>
            <button className="ff-icon-btn" onClick={() => copyText('full', fullEmail)}>
              {copied.full ? <Check size={12} /> : <Copy size={12} />}
              {copied.full ? 'Copied' : 'All'}
            </button>
          </div>
        </div>
        <div className="ff-card">
          <p className="ff-output-text" onClick={selectAllText} style={{ cursor: 'text' }}>{result.body}</p>
        </div>
      </div>
    </div>
  );
}

function FollowupOutput({ result, copied, copyText, selectAllText }) {
  return (
    <div className="space-y-5">
      {(result.clientRead || result.situation) && (
        <div className="ff-fadeup ff-card">
          {result.clientRead && (
            <div className="mb-4">
              <p className="ff-section-label mb-2">Who you're dealing with</p>
              <p style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.55, letterSpacing: '-0.005em' }}>{result.clientRead}</p>
            </div>
          )}
          {result.situation && (
            <div>
              <p className="ff-section-label mb-2">Read of the room</p>
              <p style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.55, letterSpacing: '-0.005em' }}>{result.situation}</p>
            </div>
          )}
        </div>
      )}
      <OutputBlock title="Follow-up" text={result.followup} copyKey="followup" copied={copied} copyText={copyText} selectAllText={selectAllText} delay={60} />
    </div>
  );
}

function CoverLetterOutput({ result, copied, copyText, selectAllText }) {
  const fullText = result.subject
    ? `Subject: ${result.subject}\n\n${result.coverLetter || ''}`
    : (result.coverLetter || '');
  return (
    <div className="space-y-5">
      {result.extraction && (
        <div className="ff-fadeup ff-card">
          <h3 className="ff-subheading mb-4">Read of the role</h3>
          <div className="ff-detail-grid">
            <Cell label="Target role" value={result.extraction.targetRole} accent />
            <Cell label="Company" value={result.extraction.company} />
            <Cell label="Their top need" value={result.extraction.topNeed} wide />
            <Cell label="Your fit angle" value={result.extraction.fitAngle} wide />
          </div>
        </div>
      )}

      {result.subject && (
        <div className="ff-fadeup" style={{ animationDelay: '60ms' }}>
          <div className="flex items-end justify-between mb-3">
            <h3 className="ff-subheading">Subject line</h3>
            <button className="ff-icon-btn" onClick={() => copyText('coversubject', result.subject)}>
              {copied.coversubject ? <Check size={12} /> : <Copy size={12} />}
              {copied.coversubject ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="ff-subject-card">
            <div className="ff-subject-text">{result.subject}</div>
          </div>
        </div>
      )}

      <div className="ff-fadeup" style={{ animationDelay: '120ms' }}>
        <div className="flex items-end justify-between mb-3">
          <h3 className="ff-subheading">Cover Letter</h3>
          <div className="flex gap-2">
            <button className="ff-icon-btn" onClick={() => copyText('coverletter', result.coverLetter)}>
              {copied.coverletter ? <Check size={12} /> : <Copy size={12} />}
              {copied.coverletter ? 'Copied' : 'Letter'}
            </button>
            {result.subject && (
              <button className="ff-icon-btn" onClick={() => copyText('coverfull', fullText)}>
                {copied.coverfull ? <Check size={12} /> : <Copy size={12} />}
                {copied.coverfull ? 'Copied' : 'All'}
              </button>
            )}
          </div>
        </div>
        <div className="ff-card">
          <p className="ff-output-text" onClick={selectAllText} title="Click to select all" style={{ cursor: 'text' }}>
            {result.coverLetter}
          </p>
        </div>
      </div>
    </div>
  );
}

function OutputBlock({ title, text, copyKey, copied, copyText, selectAllText, delay = 0 }) {
  return (
    <div className="ff-fadeup" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-end justify-between mb-3">
        <h3 className="ff-subheading">{title}</h3>
        <button className="ff-icon-btn" onClick={() => copyText(copyKey, text)}>
          {copied[copyKey] ? <Check size={12} /> : <Copy size={12} />}
          {copied[copyKey] ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="ff-card">
        <p className="ff-output-text" onClick={selectAllText} title="Click to select all" style={{ cursor: 'text' }}>{text}</p>
      </div>
    </div>
  );
}

function Cell({ label, value, children, wide, accent }) {
  return (
    <div className={wide ? 'col-span-2' : ''}>
      <div className="ff-section-label mb-1.5" style={{ fontSize: 10.5 }}>{label}</div>
      {children || (
        <p style={{ fontSize: 13.5, lineHeight: 1.5, color: accent ? 'var(--accent)' : 'var(--text-1)', fontWeight: accent ? 600 : 400, letterSpacing: '-0.005em' }}>
          {value || '...'}
        </p>
      )}
    </div>
  );
}

function OptimizeEmpty() {
  return (
    <div className="ff-empty-state">
      <div className="ff-mono ff-pulse mb-4" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Awaiting Page
      </div>
      <p className="ff-display ff-text-1 mb-4" style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 400, letterSpacing: '-0.02em' }}>
        Your audit, scores, and<br/>rewrites will appear here.
      </p>
      <p className="ff-text-3" style={{ fontSize: 13, lineHeight: 1.55 }}>
        Drop a URL, paste your copy,<br/>or upload a screenshot.
      </p>
    </div>
  );
}

function OptimizeLoading({ message }) {
  return (
    <div className="ff-card">
      <div className="flex items-center gap-2 mb-5">
        <span className="ff-status-dot ff-pulse"></span>
        <span className="ff-mono" style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Working
        </span>
      </div>
      <div className="space-y-2.5 mb-5">
        <div className="ff-loading-bar ff-pulse" style={{ width: '92%' }}></div>
        <div className="ff-loading-bar ff-pulse" style={{ width: '74%', animationDelay: '0.2s' }}></div>
        <div className="ff-loading-bar ff-pulse" style={{ width: '86%', animationDelay: '0.4s' }}></div>
        <div className="ff-loading-bar ff-pulse" style={{ width: '60%', animationDelay: '0.6s' }}></div>
      </div>
      <p className="ff-text-2" style={{ fontSize: 14, fontStyle: 'italic' }}>{message}</p>
    </div>
  );
}

function CloserEmpty({ mode }) {
  const messages = {
    proposal: 'Your proposal, DM,\nand matched links\nwill appear here.',
    dm: 'Your cold DM\nwill appear here.',
    email: 'Your subject line\nand email body\nwill appear here.',
    followup: 'Your follow-up\nwill appear here.',
    coverletter: 'Your tailored cover letter\nwill appear here.',
  };
  const kickers = {
    followup: 'Awaiting Conversation',
    coverletter: 'Awaiting Job Posting',
  };
  const kicker = kickers[mode] || 'Awaiting Intel';
  return (
    <div className="ff-empty-state">
      <div className="ff-mono ff-pulse mb-4" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {kicker}
      </div>
      <p className="ff-display ff-text-1" style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 400, letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}>
        {messages[mode]}
      </p>
    </div>
  );
}
