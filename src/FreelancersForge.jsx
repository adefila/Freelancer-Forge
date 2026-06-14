import React, { useState, useRef, useEffect } from 'react';
import { buildPrompt, STRICT_RULES, CV_STRICT_RULES } from './prompts.js';
import {
  ArrowRight, Copy, Check, Loader2, Sparkles, Paperclip, X, ImageIcon,
  Sun, Moon, Plus, ExternalLink, Link as LinkIcon, ChevronDown, Receipt,
  Mail, MessageSquare, FileText, Reply, Type, Image as ImgIcon,
  Target, Award, Briefcase, User, Layers, Wand2, Monitor,
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
  reply: { label: 'Client Reply', icon: Send, desc: 'Polish your reply to a live client conversation', cta: 'Polish My Reply' },
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

.ff-root {
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-text: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', ui-monospace, monospace;

  --r-sm: 6px;
  --r-md: 8px;
  --r-lg: 12px;
  --r-xl: 16px;
  --r-pill: 999px;

  --sh-1: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  --sh-2: 0 3px 10px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05);
  --sh-3: 0 14px 36px rgba(0,0,0,0.10), 0 3px 8px rgba(0,0,0,0.06);
  --sh-blue: 0 4px 14px rgba(37, 99, 235, 0.32), 0 2px 6px rgba(37, 99, 235, 0.18);
  --sh-focus: 0 0 0 3px rgba(37, 99, 235, 0.18);

  --t-fast: 140ms cubic-bezier(0.4, 0, 0.2, 1);
  --t-med: 220ms cubic-bezier(0.4, 0, 0.2, 1);
  --t-slow: 380ms cubic-bezier(0.4, 0, 0.2, 1);

  /* LIGHT MODE */
  --bg: #ffffff;
  --bg-elev-1: #f7f7f8;
  --bg-elev-2: #f0f0f2;
  --bg-input: #ffffff;
  --text-1: #0a0a0a;
  --text-2: #4a4a4f;
  --text-3: #6b6b70;
  --border: rgba(0, 0, 0, 0.08);
  --border-strong: rgba(0, 0, 0, 0.13);
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
  overflow-x: clip;
  transition: background-color var(--t-slow), color var(--t-slow);
  letter-spacing: -0.01em;
}

.ff-root.dark {
  --bg: #0e0e10;
  --bg-elev-1: #1c1c20;
  --bg-elev-2: #26262b;
  --bg-input: #18181c;
  --text-1: #f0f0f2;
  --text-2: #c0c0c8;
  --text-3: #8e8e96;
  --border: rgba(255, 255, 255, 0.10);
  --border-strong: rgba(255, 255, 255, 0.18);
  --accent: #4f8ef7;
  --accent-hover: #60a5fa;
  --accent-active: #2563eb;
  --accent-vivid: #2563eb;
  --accent-vivid-hover: #3b82f6;
  --accent-bg-soft: rgba(79, 142, 247, 0.14);
  --accent-border-soft: rgba(79, 142, 247, 0.36);
  --accent-text-on: #ffffff;
  --warning: #fbbf24;
  --warning-bg: rgba(251, 191, 36, 0.14);
  --success: #4ade80;
  --success-bg: rgba(74, 222, 128, 0.14);
  --danger: #f87171;
  --danger-bg: rgba(248, 113, 113, 0.14);
  --sh-1: 0 1px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.4);
  --sh-2: 0 3px 12px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.45);
  --sh-3: 0 16px 40px rgba(0,0,0,0.65), 0 4px 10px rgba(0,0,0,0.4);
  --sh-blue: 0 4px 16px rgba(59, 130, 246, 0.4), 0 2px 6px rgba(59, 130, 246, 0.2);
  --sh-focus: 0 0 0 3px rgba(59, 130, 246, 0.25);
}

.ff-display {
  font-family: var(--font-display);
  letter-spacing: -0.038em;
  font-weight: 500;
  font-feature-settings: 'cv11', 'ss01', 'kern';
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
  border-radius: 999px;
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
  position: relative;
}
.ff-theme-toggle:hover {
  border-color: var(--border-strong);
  color: var(--text-1);
  background-color: var(--bg-elev-2);
}

/* Theme dropdown */
.ff-theme-dropdown {
  position: relative;
  display: inline-block;
}
.ff-theme-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg);
  border: 1px solid var(--border-strong);
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
  padding: 6px;
  min-width: 210px;
  z-index: 200;
  animation: ff-scalein 140ms cubic-bezier(0.16,1,0.3,1);
  transform-origin: top right;
}
.ff-root.dark .ff-theme-menu {
  box-shadow: 0 4px 16px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.18);
}

/* Each row: [check] [icon] [label + desc] */
.ff-theme-option {
  display: grid;
  grid-template-columns: 18px 20px 1fr;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  border: none;
  padding: 9px 10px;
  border-radius: 9px;
  cursor: pointer;
  font-family: var(--font-text);
  letter-spacing: -0.005em;
  text-align: left;
  transition: background var(--t-fast);
}
.ff-theme-option:hover { background: var(--bg-elev-1); }

/* Left check slot */
.ff-theme-option-check {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-1);
  opacity: 0;
  transition: opacity var(--t-fast);
  flex-shrink: 0;
}
.ff-theme-option-active .ff-theme-option-check { opacity: 1; }

/* Middle icon slot — bare, no box */
.ff-theme-option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-2);
  flex-shrink: 0;
  transition: color var(--t-fast);
}
.ff-theme-option:hover .ff-theme-option-icon { color: var(--text-1); }
.ff-theme-option-active .ff-theme-option-icon { color: var(--text-1); }

/* Right text stack */
.ff-theme-option-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.ff-theme-option-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-1);
  line-height: 1.3;
}
.ff-theme-option-desc {
  font-size: 11.5px;
  color: var(--text-3);
  line-height: 1.3;
  font-weight: 400;
}

.ff-theme-menu-divider {
  height: 1px;
  background: var(--border);
  margin: 4px 4px;
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
  border-radius: 999px;
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
  font-size: 13px;
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
  overflow-y: clip;
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
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  padding: 14px 0;
  margin-right: 28px;
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
  font-size: 12px;
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
  border-radius: 999px;
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
  backdrop-filter: none;
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
  padding: 28px;
  box-shadow: none;
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
  font-size: 12px;
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
  font-size: 12px;
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
  font-size: 13px;
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
  font-size: 12px;
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
  font-size: 12px;
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
  font-size: 12px;
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
  line-height: 1.15;
  font-weight: 500;
  letter-spacing: -0.038em;
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
  font-size: 12px;
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
  line-height: 1.7;
  color: var(--text-1);
  letter-spacing: -0.008em;
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
  font-size: 13px;
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
  font-size: 12px;
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
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  letter-spacing: -0.005em;
  text-transform: none;
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
  letter-spacing: -0.038em;
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
  opacity: 0.6;
  background:
    radial-gradient(ellipse 60% 50% at 75% 0%, rgba(79, 142, 247, 0.18) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 25% 10%, rgba(79, 142, 247, 0.14) 0%, transparent 55%);
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
  padding: 48px 32px 48px;
}

.ff-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 44px;
  gap: 12px;
}

.ff-hero {
  margin-bottom: 48px;
}

.ff-hero-heading {
  font-size: clamp(32px, 5vw, 62px);
  line-height: 1.04;
  font-weight: 600;
  letter-spacing: -0.04em;
  max-width: 100%;
  margin-bottom: 20px;
}

.ff-hero-sub {
  font-size: clamp(14px, 1.3vw, 17px);
  line-height: 1.6;
  letter-spacing: -0.005em;
  max-width: 640px;
  width: 100%;
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
  gap: 24px;
  margin-bottom: 40px;
}

.ff-2col-stack {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px 64px;
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
  /* ff-textarea stays 16px on mobile to prevent iOS zoom */
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
    padding: 28px 20px 56px;
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

/* ====================================================================== */
/* ASK ANYTHING — SIDEBAR + CHAT LAYOUT                                  */
/* ====================================================================== */

/* ── Ask Anything layout ─────────────────────────────────────────────── */
.ff-ask-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 0;
  height: calc(100vh - 300px);
  min-height: 520px;
  max-height: 800px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

/* ── Sidebar ─────────────────────────────────────────────────────────── */
.ff-chat-sidebar {
  width: 220px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  background: var(--bg-elev-1);
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
}
.ff-chat-sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--border);
}
.ff-chat-sidebar-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-3);
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.ff-chat-new-btn {
  width: 24px; height: 24px;
  border-radius: 7px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  color: var(--text-2);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--t-fast), color var(--t-fast);
}
.ff-chat-new-btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }
.ff-chat-sidebar-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ff-chat-sidebar-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 9px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background var(--t-fast);
  width: 100%;
  min-width: 0;
  position: relative;
}
.ff-chat-sidebar-item:hover { background: var(--bg-elev-2); }
.ff-chat-sidebar-item-active {
  background: var(--accent-bg-soft) !important;
  border: 1px solid var(--accent-border-soft);
}
.ff-chat-sidebar-item-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--border);
  flex-shrink: 0;
  margin-top: 5px;
  opacity: 0.5;
  transition: opacity var(--t-fast), background var(--t-fast);
}
.ff-chat-sidebar-item-active .ff-chat-sidebar-item-dot { background: var(--accent); opacity: 1; }
.ff-chat-sidebar-item-title {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-1);
  line-height: 1.35;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
  min-width: 0;
  letter-spacing: -0.005em;
}
.ff-chat-sidebar-item-meta {
  font-size: 10.5px;
  color: var(--text-3);
  margin-top: 2px;
  display: block;
}
.ff-chat-sidebar-item-del {
  background: none;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  padding: 3px;
  border-radius: 5px;
  opacity: 0;
  transition: opacity var(--t-fast), color var(--t-fast), background var(--t-fast);
  flex-shrink: 0;
}
.ff-chat-sidebar-item:hover .ff-chat-sidebar-item-del { opacity: 1; }
.ff-chat-sidebar-item-del:hover { color: var(--danger); background: var(--danger-bg); }
.ff-chat-sidebar-empty {
  padding: 24px 12px;
  text-align: center;
  color: var(--text-3);
  font-size: 12.5px;
  line-height: 1.6;
}

/* ── Chat pane ───────────────────────────────────────────────────────── */
.ff-chat-pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
}
.ff-chat-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px 24px 12px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}
.ff-chat-messages::-webkit-scrollbar { width: 4px; }
.ff-chat-messages::-webkit-scrollbar-track { background: transparent; }
.ff-chat-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

/* Empty state */
.ff-chat-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px 24px;
}

/* Messages */
.ff-chat-msg {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.ff-chat-msg.ff-chat-msg-user {
  flex-direction: row-reverse;
}
.ff-chat-avatar {
  width: 26px; height: 26px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-size: 10px; font-weight: 800;
  letter-spacing: -0.02em;
}
.ff-chat-avatar-ai {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 2px 8px rgba(37,99,235,.25);
}
.ff-chat-avatar-user {
  background: var(--text-1);
  color: var(--bg);
}
.ff-chat-bubble-ai {
  background: var(--bg-elev-1);
  border: 1px solid var(--border);
  color: var(--text-1);
  border-radius: 14px;
  border-top-left-radius: 4px;
  padding: 12px 16px;
  font-size: 14.5px;
  line-height: 1.65;
  letter-spacing: -0.008em;
  max-width: min(540px, 80%);
}
.ff-chat-bubble-ai p { margin: 0 0 10px; }
.ff-chat-bubble-ai p:last-child { margin-bottom: 0; }
.ff-chat-bubble-ai ul, .ff-chat-bubble-ai ol { margin: 0 0 10px; padding-left: 20px; }
.ff-chat-bubble-ai li { margin-bottom: 4px; line-height: 1.6; }
.ff-chat-bubble-ai pre {
  background: var(--bg-elev-2);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12.5px;
  overflow-x: auto;
  margin: 6px 0;
  line-height: 1.55;
  font-family: var(--font-mono);
}
.ff-chat-bubble-user {
  background: var(--text-1);
  color: var(--bg);
  border-radius: 14px;
  border-top-right-radius: 4px;
  padding: 10px 14px;
  font-size: 14px;
  line-height: 1.55;
  letter-spacing: -0.005em;
  max-width: min(420px, 80%);
  white-space: pre-wrap;
  word-break: break-word;
}
.ff-chat-bubble-text { }
.ff-chat-copy-btn {
  background: none;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-family: var(--font-text);
  font-weight: 500;
  transition: color var(--t-fast), background var(--t-fast);
  letter-spacing: -0.005em;
}
.ff-chat-copy-btn:hover { color: var(--text-1); background: var(--bg-elev-1); }
.ff-chat-typing {
  display: flex; gap: 4px; align-items: center; padding: 4px 0;
}
.ff-chat-typing span {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--text-3);
  animation: ff-typing-bounce 1.2s infinite ease-in-out;
}
.ff-chat-typing span:nth-child(2) { animation-delay: .2s; }
.ff-chat-typing span:nth-child(3) { animation-delay: .4s; }
@keyframes ff-typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: .4; }
  30% { transform: translateY(-5px); opacity: 1; }
}

/* Attachment previews */
.ff-chat-user-attachment {
  max-width: 200px;
  margin-bottom: 6px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.ff-chat-user-attachment img { width: 100%; display: block; }
.ff-chat-user-attachment-file {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 5px 9px;
  font-size: 12px;
  color: var(--text-2);
  font-weight: 500;
  margin-bottom: 6px;
}
.ff-chat-attachment-preview-icon {
  width: 28px; height: 28px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-2);
  flex-shrink: 0;
}
.ff-chat-attachment-name {
  font-size: 12px;
  color: var(--text-2);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

/* Footer / input */
.ff-chat-footer {
  padding: 10px 16px 14px;
  border-top: 1px solid var(--border);
  background: var(--bg);
  flex-shrink: 0;
}
.ff-chat-input-box {
  background: var(--bg-elev-1);
  border: 1px solid var(--border);
  border-radius: 14px;
  transition: border-color var(--t-fast), box-shadow var(--t-fast);
  overflow: hidden;
}
.ff-chat-input-box:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(37,99,235,.1);
}
.ff-chat-textarea {
  width: 100%;
  background: none;
  border: none;
  outline: none;
  resize: none;
  color: var(--text-1);
  font-family: var(--font-text);
  font-size: 14.5px;
  line-height: 1.5;
  padding: 11px 14px 6px;
  min-height: 40px;
  max-height: 120px;
  letter-spacing: -0.005em;
}
.ff-chat-textarea::placeholder { color: var(--text-3); }
.ff-chat-input-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 8px 10px;
}
.ff-chat-attach-btn {
  background: none;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  padding: 5px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  transition: color var(--t-fast), background var(--t-fast);
}
.ff-chat-attach-btn:hover { color: var(--text-1); background: var(--bg-elev-2); }
.ff-chat-send {
  width: 30px; height: 30px;
  background: var(--accent);
  border: none;
  border-radius: 9px;
  color: #fff;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background var(--t-fast), opacity var(--t-fast), transform var(--t-fast);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(37,99,235,.3);
}
.ff-chat-send:hover:not(:disabled) { background: var(--accent-hover); transform: scale(1.05); }
.ff-chat-send:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

/* Suggested prompts */
.ff-suggested-prompt {
  background: var(--bg-elev-1);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-2);
  font-family: var(--font-text);
  font-size: 12.5px;
  font-weight: 500;
  padding: 6px 13px;
  cursor: pointer;
  transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
  white-space: nowrap;
  letter-spacing: -0.005em;
  animation: ff-fadeup .25s ease forwards;
  opacity: 0;
}
.ff-suggested-prompt:hover {
  background: var(--accent-bg-soft);
  border-color: var(--accent-border-soft);
  color: var(--accent);
}

/* Mobile toggle */
.ff-chat-sidebar-toggle {
  display: none;
  align-items: center;
  gap: 6px;
  background: var(--bg-elev-1);
  border: 1px solid var(--border);
  border-radius: 999px;
  color: var(--text-2);
  font-family: var(--font-text);
  font-size: 13px;
  font-weight: 500;
  padding: 7px 14px;
  cursor: pointer;
  transition: background var(--t-fast);
  letter-spacing: -0.005em;
}
.ff-chat-sidebar-toggle:hover { background: var(--bg-elev-2); }

/* Mobile sheet */
.ff-sheet-backdrop {
  display: none;
  position: fixed; inset: 0;
  background: rgba(0,0,0,.35);
  z-index: 90;
  opacity: 0;
  transition: opacity var(--t-med);
}
.ff-sheet-backdrop.open { opacity: 1; }
.ff-chat-sheet {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: var(--bg);
  border-top: 1px solid var(--border);
  border-radius: 20px 20px 0 0;
  z-index: 100;
  padding: 0 0 env(safe-area-inset-bottom, 16px);
  max-height: 80vh;
  overflow-y: auto;
  transform: translateY(100%);
  transition: transform var(--t-med);
}
.ff-chat-sheet.open { transform: translateY(0); }
.ff-chat-sheet-handle {
  width: 36px; height: 4px;
  background: var(--border);
  border-radius: 2px;
  margin: 10px auto 14px;
}
.ff-chat-sheet-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 18px 12px;
  border-bottom: 1px solid var(--border);
}
.ff-chat-sheet-title {
  font-size: 15px; font-weight: 700; color: var(--text-1); letter-spacing: -0.01em;
}
.ff-chat-sheet-close {
  background: none; border: none; color: var(--text-3); cursor: pointer;
  padding: 4px; border-radius: 6px; display: flex; align-items: center;
}
.ff-chat-sheet-new {
  display: flex; align-items: center; gap: 8px;
  width: calc(100% - 32px);
  margin: 12px 16px 8px;
  padding: 10px 14px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: var(--font-text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: -0.01em;
}
.ff-chat-sheet-list { padding: 4px 10px 16px; }
.ff-chat-sheet-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%;
  padding: 10px 10px;
  border-radius: 10px;
  background: none; border: none;
  text-align: left; cursor: pointer;
  transition: background var(--t-fast);
}
.ff-chat-sheet-item:hover { background: var(--bg-elev-1); }
.ff-chat-sheet-item-active { background: var(--accent-bg-soft) !important; }
.ff-chat-sheet-item-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: var(--bg-elev-2);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-2);
  flex-shrink: 0;
}
.ff-chat-sheet-item-body { flex: 1; min-width: 0; }
.ff-chat-sheet-item-title {
  font-size: 13.5px; font-weight: 500; color: var(--text-1);
  letter-spacing: -0.008em;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.ff-chat-sheet-item-meta { font-size: 11px; color: var(--text-3); margin-top: 1px; }
.ff-chat-sheet-item-del {
  background: none; border: none; color: var(--text-3); cursor: pointer;
  padding: 4px; border-radius: 6px;
  display: flex; align-items: center;
  transition: color var(--t-fast), background var(--t-fast);
  flex-shrink: 0;
}
.ff-chat-sheet-item-del:hover { color: var(--danger); background: var(--danger-bg); }
.ff-chat-sheet-empty {
  text-align: center; padding: 32px 16px;
  color: var(--text-3); font-size: 13px; line-height: 1.65;
}

/* Responsive */
@media (max-width: 760px) {
  .ff-ask-layout { grid-template-columns: 1fr; }
  .ff-chat-sidebar { display: none; }
  .ff-chat-sidebar-toggle { display: flex; }
  .ff-sheet-backdrop { display: block; }
  .ff-chat-sheet { display: block; }
  .ff-chat-messages { padding: 16px 14px 8px; }
  .ff-chat-bubble-ai { max-width: 92%; font-size: 14px; }
  .ff-chat-bubble-user { max-width: 88%; }
}


/* ====================================================================== */
/* PRELOADER — THEME ADAPTIVE                                             */
/* ====================================================================== */

.ff-preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  overflow: hidden;
  transition: background 0ms;
}

/* Light mode preloader */
.ff-preloader.light {
  background: #ffffff;
}

/* Dark mode preloader */
.ff-preloader.dark {
  background: #080810;
}

.ff-preloader-exit {
  animation: ff-preloader-out 600ms cubic-bezier(0.4,0,0.6,1) forwards;
  pointer-events: none;
}
@keyframes ff-preloader-out {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}

/* Glow blobs — adapt to theme */
.ff-preloader-glow {
  position: absolute; border-radius: 50%;
  pointer-events: none;
}

.ff-preloader.light .ff-preloader-glow-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%);
  filter: blur(60px);
  top: -200px; left: -100px;
  animation: ff-glow-drift1 12s ease-in-out infinite alternate;
}
.ff-preloader.light .ff-preloader-glow-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%);
  filter: blur(60px);
  bottom: -160px; right: -80px;
  animation: ff-glow-drift2 14s ease-in-out infinite alternate;
}
.ff-preloader.dark .ff-preloader-glow-1 {
  width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 65%);
  filter: blur(90px);
  top: -280px; left: -160px;
  animation: ff-glow-drift1 10s ease-in-out infinite alternate;
}
.ff-preloader.dark .ff-preloader-glow-2 {
  width: 520px; height: 520px;
  background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%);
  filter: blur(90px);
  bottom: -180px; right: -80px;
  animation: ff-glow-drift2 12s ease-in-out infinite alternate;
}

@keyframes ff-glow-drift1 { from { transform:translate(0,0); } to { transform:translate(36px,22px); } }
@keyframes ff-glow-drift2 { from { transform:translate(0,0); } to { transform:translate(-28px,-18px); } }

/* Wordmark top-centre */
.ff-preloader-wordmark {
  position: absolute; top: 28px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 9px;
  animation: ff-fadein 500ms ease backwards;
  white-space: nowrap;
}
.ff-preloader-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #3b82f6;
  animation: ff-dot-pulse 2.4s ease-in-out infinite;
}
.ff-preloader.light .ff-preloader-dot {
  box-shadow: 0 0 10px rgba(37,99,235,0.5);
}
.ff-preloader.dark .ff-preloader-dot {
  box-shadow: 0 0 16px rgba(59,130,246,0.9);
}
@keyframes ff-dot-pulse {
  0%,100% { transform:scale(1); opacity:0.55; }
  50%     { transform:scale(1.4); opacity:1; }
}
.ff-preloader-brand {
  font-size: 12px; font-weight: 600; letter-spacing: 0.05em;
  font-family: system-ui, sans-serif;
}
.ff-preloader.light .ff-preloader-brand { color: rgba(0,0,0,0.35); }
.ff-preloader.dark  .ff-preloader-brand { color: rgba(255,255,255,0.32); }

/* Skip button — top right */
.ff-preloader-skip {
  position: absolute; top: 22px; right: 24px;
  font-size: 13px; font-weight: 500; padding: 5px 13px;
  border-radius: 20px; cursor: pointer;
  letter-spacing: 0.01em; transition: all 180ms ease;
  font-family: system-ui, sans-serif;
  animation: ff-fadein 600ms ease 700ms backwards;
}
.ff-preloader.light .ff-preloader-skip {
  background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.1);
  color: rgba(0,0,0,0.35);
}
.ff-preloader.light .ff-preloader-skip:hover {
  background: rgba(0,0,0,0.08); color: rgba(0,0,0,0.6); border-color: rgba(0,0,0,0.18);
}
.ff-preloader.dark .ff-preloader-skip {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.28);
}
.ff-preloader.dark .ff-preloader-skip:hover {
  background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.18);
}

/* Slide content */
.ff-preloader-content {
  position: relative; z-index: 2;
  text-align: center; max-width: 540px; width: 100%;
}

/* Icon pill — small, elegant */
.ff-preloader-icon-pill {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 7px 16px; border-radius: 24px;
  margin-bottom: 28px; font-size: 13px; font-weight: 600;
  letter-spacing: 0.03em; font-family: system-ui, sans-serif;
  text-transform: uppercase;
}
.ff-preloader.light .ff-preloader-icon-pill {
  background: rgba(37,99,235,0.07); border: 1px solid rgba(37,99,235,0.18);
  color: rgba(37,99,235,0.8);
}
.ff-preloader.dark .ff-preloader-icon-pill {
  background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.26);
  color: rgba(96,165,250,0.9);
}

/* Headline */
.ff-preloader-headline {
  font-size: clamp(22px, 3.2vw, 42px);
  font-weight: 500; line-height: 1.08;
  letter-spacing: -0.034em; margin-bottom: 16px;
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  white-space: normal;
  max-width: 18ch;
  margin-left: auto;
  margin-right: auto;
}
@media (max-width: 640px) {
  .ff-preloader-headline { font-size: clamp(20px, 6vw, 30px); }
}
.ff-preloader.light .ff-preloader-headline { color: #0a0a0a; }
.ff-preloader.dark  .ff-preloader-headline { color: #f5f5f7; }
.ff-preloader-headline em {
  font-style: normal; font-weight: 500; color: #3b82f6;
}
.ff-preloader.light .ff-preloader-headline em { color: #2563eb; }

/* Sub */
.ff-preloader-sub {
  font-size: clamp(13px, 1.4vw, 15.5px);
  line-height: 1.65; letter-spacing: -0.005em; max-width: 38ch; margin: 0 auto;
  font-family: system-ui, sans-serif; text-align: center;
}
.ff-preloader.light .ff-preloader-sub { color: rgba(0,0,0,0.42); }
.ff-preloader.dark  .ff-preloader-sub { color: rgba(255,255,255,0.38); }

/* Slide animations */
.ff-preloader-slide-in .ff-preloader-icon-pill { animation: ff-pl-in-icon 480ms cubic-bezier(0.16,1,0.3,1) both; }
.ff-preloader-slide-in .ff-preloader-headline  { animation: ff-pl-in-text 540ms cubic-bezier(0.16,1,0.3,1) 50ms both; }
.ff-preloader-slide-in .ff-preloader-sub       { animation: ff-pl-in-text 540ms cubic-bezier(0.16,1,0.3,1) 110ms both; }
@keyframes ff-pl-in-icon { from { opacity:0; transform:scale(0.8) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
@keyframes ff-pl-in-text { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }

.ff-preloader-slide-out .ff-preloader-icon-pill,
.ff-preloader-slide-out .ff-preloader-headline,
.ff-preloader-slide-out .ff-preloader-sub {
  animation: ff-pl-out 360ms cubic-bezier(0.4,0,1,1) forwards !important;
}
@keyframes ff-pl-out { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(-10px); } }

/* Footer */
.ff-preloader-footer {
  position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
  z-index: 2; width: min(360px, 78vw);
  animation: ff-fadein 500ms ease 200ms backwards;
}

.ff-preloader-bar-track {
  width: 100%; height: 1px; border-radius: 1px;
  overflow: hidden; margin-bottom: 18px;
}
.ff-preloader.light .ff-preloader-bar-track { background: rgba(0,0,0,0.08); }
.ff-preloader.dark  .ff-preloader-bar-track { background: rgba(255,255,255,0.07); }

.ff-preloader-bar-fill {
  height: 100%; border-radius: 1px;
  background: linear-gradient(90deg, #2563eb 0%, #818cf8 100%);
  transition: width 100ms linear;
}
.ff-preloader.dark .ff-preloader-bar-fill {
  box-shadow: 0 0 6px rgba(59,130,246,0.6);
}

.ff-preloader-steps {
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.ff-preloader-step {
  width: 5px; height: 5px; border-radius: 50%;
  transition: all 380ms cubic-bezier(0.16,1,0.3,1); flex-shrink: 0;
}
.ff-preloader.light .ff-preloader-step { background: rgba(0,0,0,0.12); }
.ff-preloader.dark  .ff-preloader-step { background: rgba(255,255,255,0.14); }
.ff-preloader-step-active {
  background: #3b82f6 !important; width: 20px; border-radius: 3px;
}
.ff-preloader.dark .ff-preloader-step-active {
  box-shadow: 0 0 8px rgba(59,130,246,0.65);
}

`;

const PRELOADER_SLIDES = [
  {
    label: 'Optimize',
    icon: <Sparkles size={13} />,
    headline: <>Audit any page.<br /><em>Rewrite it like the top 1%.</em></>,
    sub: 'Score your portfolio, Upwork profile, LinkedIn, or CV against expert criteria — then get a complete rewrite in one click.',
  },
  {
    label: 'Close Client',
    icon: <Target size={13} />,
    headline: <>Close clients with<br /><em>proposals that convert.</em></>,
    sub: 'Generate tight, scannable proposals, cold DMs, follow-ups, and cover letters tailored to the exact lead in front of you.',
  },
  {
    label: 'Pipeline',
    icon: <TrendingUp size={13} />,
    headline: <>Track every pitch.<br /><em>See what works.</em></>,
    sub: 'Log proposals, DMs, and emails. Watch reply rate and win rate build over time. Saved in your browser — no account needed.',
  },
  {
    label: 'Ask Anything',
    icon: <Bot size={13} />,
    headline: <>Ask anything.<br /><em>Get tactical answers fast.</em></>,
    sub: 'Pricing strategy, scope creep scripts, rate increases, niche advice — your freelance mentor is one message away.',
  },
];

const SLIDE_DURATION = 2200;
const TICK = 50;

function Preloader({ onDone, theme }) {
  const [slide, setSlide] = useState(0);
  const [phase, setPhase] = useState('in');
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const totalDuration = SLIDE_DURATION * PRELOADER_SLIDES.length;
  const startTime = useRef(Date.now());

  const finish = () => {
    setExiting(true);
    setTimeout(onDone, 620);
  };

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      setProgress(Math.min((elapsed / totalDuration) * 100, 100));
      if (elapsed >= totalDuration) { clearInterval(id); finish(); }
    }, TICK);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (slide >= PRELOADER_SLIDES.length - 1) return;
    const holdId = setTimeout(() => {
      setPhase('out');
      setTimeout(() => { setSlide(s => s + 1); setPhase('in'); }, 380);
    }, SLIDE_DURATION - 400);
    return () => clearTimeout(holdId);
  }, [slide]);

  const s = PRELOADER_SLIDES[slide];
  const slideClass = phase === 'out' ? 'ff-preloader-slide-out' : 'ff-preloader-slide-in';
  const isDark = theme === 'dark';
  const iconColor = isDark ? '#60a5fa' : '#2563eb';

  return (
    <div className={`ff-preloader ${theme}${exiting ? ' ff-preloader-exit' : ''}`}>
      <div className="ff-preloader-glow ff-preloader-glow-1" />
      <div className="ff-preloader-glow ff-preloader-glow-2" />

      {/* Wordmark */}
      <div className="ff-preloader-wordmark">
        <span className="ff-preloader-dot" />
        <span className="ff-preloader-brand">Freelancer's Forge</span>
      </div>

      {/* Skip */}
      <button type="button" className="ff-preloader-skip" onClick={finish}>Skip</button>

      {/* Slide */}
      <div className={`ff-preloader-content ${slideClass}`} key={slide}>
        <div className="ff-preloader-icon-pill">
          <span style={{ color: iconColor, display: 'flex', alignItems: 'center' }}>
            {React.cloneElement(s.icon, { color: iconColor })}
          </span>
          {s.label}
        </div>
        <p className="ff-preloader-headline">{s.headline}</p>
        <p className="ff-preloader-sub">{s.sub}</p>
      </div>

      {/* Footer */}
      <div className="ff-preloader-footer">
        <div className="ff-preloader-bar-track">
          <div className="ff-preloader-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="ff-preloader-steps">
          {PRELOADER_SLIDES.map((_, i) => (
            <div key={i} className={`ff-preloader-step${i === slide ? ' ff-preloader-step-active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Detect system preference
function getSystemTheme() {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
}

/* ====================================================================== */
/* INVOICE STORAGE                                                        */
/* ====================================================================== */

const INVOICE_STORAGE_KEY = 'ff_invoices_v1';
const INVOICE_RETENTION_DAYS = 15;

function loadInvoices() {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const cutoff = Date.now() - INVOICE_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    return parsed.filter(inv => inv && inv.createdAt && inv.createdAt > cutoff);
  } catch { return []; }
}

function saveInvoices(invoices) {
  try { localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoices)); } catch {}
}

function generateInvoiceNumber(invoices) {
  const max = invoices.reduce((m, inv) => {
    const n = parseInt((inv.number || '').replace(/\D/g, '')) || 0;
    return Math.max(m, n);
  }, 0);
  return 'INV-' + String(max + 1).padStart(4, '0');
}

/* ====================================================================== */
/* INVOICE TAB                                                            */
/* ====================================================================== */

function InvoiceTab() {
  const [invoices, setInvoices] = useState(() => loadInvoices());
  const [view, setView] = useState('list');
  const [current, setCurrent] = useState(null);

  /* ── Status config ──────────────────────────────────────────── */
  const ST = {
    paid:    { label:'Paid',    color:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0', dot:'#22c55e' },
    unpaid:  { label:'Unpaid',  color:'#d97706', bg:'#fffbeb', border:'#fde68a', dot:'#f59e0b' },
    overdue: { label:'Overdue', color:'#dc2626', bg:'#fef2f2', border:'#fecaca', dot:'#ef4444' },
  };

  /* Auto-set overdue if past due date and not paid */
  const resolveStatus = (inv) => {
    if (!inv) return 'unpaid';
    if (inv.status === 'paid') return 'paid';
    if (inv.dueDate && new Date(inv.dueDate) < new Date(new Date().toDateString())) return 'overdue';
    return inv.status || 'unpaid';
  };

  const blankInvoice = () => ({
    id: Date.now(), createdAt: Date.now(),
    number: generateInvoiceNumber(invoices),
    date: new Date().toISOString().slice(0,10),
    dueDate: new Date(Date.now()+14*86400000).toISOString().slice(0,10),
    status: 'unpaid',
    logo: null,
    from: { name:'', email:'', phone:'', address:'' },
    to:   { name:'', email:'', phone:'', address:'' },
    items: [{ id:1, description:'', qty:1, rate:'' }],
    notes:'', currency:'USD', tax:'', discount:'',
  });

  const openNew = () => { setCurrent(blankInvoice()); setView('create'); };
  const openEdit = (inv) => { setCurrent({...inv}); setView('create'); };
  const openPreview = (inv) => { setCurrent({...inv}); setView('preview'); };

  const deleteInvoice = (id) => {
    const u = invoices.filter(i => i.id !== id);
    setInvoices(u); saveInvoices(u);
  };

  const setStatus = (id, status) => {
    const u = invoices.map(i => i.id === id ? {...i, status} : i);
    setInvoices(u); saveInvoices(u);
    if (current?.id === id) setCurrent(c => ({...c, status}));
  };

  const saveInvoice = () => {
    const exists = invoices.find(i => i.id === current.id);
    const u = exists ? invoices.map(i => i.id===current.id ? current : i) : [current, ...invoices];
    setInvoices(u); saveInvoices(u); setView('preview');
  };

  const updateItem = (id,f,v) =>
    setCurrent(c => ({...c, items: c.items.map(it => it.id===id ? {...it,[f]:v} : it)}));
  const addItem = () =>
    setCurrent(c => ({...c, items:[...c.items, {id:Date.now(), description:'', qty:1, rate:''}]}));
  const removeItem = (id) =>
    setCurrent(c => ({...c, items: c.items.filter(it => it.id !== id)}));

  const subtotal = inv => (inv?.items||[]).reduce((s,it) => s+(parseFloat(it.qty)||0)*(parseFloat(it.rate)||0), 0);
  const taxAmt   = inv => subtotal(inv) * ((parseFloat(inv?.tax)||0)/100);
  const discAmt  = inv => subtotal(inv) * ((parseFloat(inv?.discount)||0)/100);
  const total    = inv => subtotal(inv) + taxAmt(inv) - discAmt(inv);
  const fmt = (n, cur='USD') => {
    try { return new Intl.NumberFormat('en-US',{style:'currency',currency:cur}).format(n||0); }
    catch { return (cur||'')+' '+parseFloat(n||0).toFixed(2); }
  };

  const handleLogo = (file, cb) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2*1024*1024) return;
    const r = new FileReader();
    r.onload = e => cb(e.target.result);
    r.readAsDataURL(file);
  };

  /* ── Status dropdown component ──────────────────────────────── */
  function StatusDropdown({ status, onChange, size='sm' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const s = ST[status] || ST.unpaid;

    useEffect(() => {
      const close = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener('mousedown', close);
      return () => document.removeEventListener('mousedown', close);
    }, []);

    const sz = size === 'lg'
      ? {height:30, px:'10px 14px', fs:11.5, dot:7}
      : {height:24, px:'5px 10px', fs:10.5, dot:6};

    return (
      <div ref={ref} style={{position:'relative',flexShrink:0}}>
        <button onClick={e => {e.stopPropagation(); setOpen(o => !o);}} style={{
          display:'inline-flex', alignItems:'center', gap:6,
          height:sz.height, padding:sz.px,
          background:s.bg, color:s.color, border:`1.5px solid ${s.border}`,
          borderRadius:999, fontSize:sz.fs, fontWeight:700,
          letterSpacing:'0.03em', cursor:'pointer', whiteSpace:'nowrap',
          transition:'opacity .15s',
        }}>
          <span style={{width:sz.dot, height:sz.dot, borderRadius:'50%', background:s.dot, flexShrink:0}}/>
          {s.label}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:.5}}><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {open && (
          <div style={{
            position:'absolute', top:'calc(100% + 6px)', right:0, zIndex:50,
            background:'var(--bg)', border:'1px solid var(--border)',
            borderRadius:12, padding:5, minWidth:130,
            boxShadow:'0 8px 24px rgba(0,0,0,.12)',
          }}>
            {Object.entries(ST).map(([key, st]) => (
              <button key={key} onClick={e => {e.stopPropagation(); onChange(key); setOpen(false);}} style={{
                display:'flex', alignItems:'center', gap:8, width:'100%',
                padding:'8px 12px', borderRadius:8, border:'none',
                background: status===key ? st.bg : 'transparent',
                color: status===key ? st.color : 'var(--text-1)',
                fontSize:13, fontWeight: status===key ? 700 : 500,
                cursor:'pointer', transition:'background .12s', textAlign:'left',
              }}>
                <span style={{width:7, height:7, borderRadius:'50%', background:st.dot, flexShrink:0}}/>
                {st.label}
                {status===key && <Check size={12} style={{marginLeft:'auto', color:st.color}}/>}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── PDF builder ────────────────────────────────────────────── */
  function buildPDFHtml(inv) {
    const sub=subtotal(inv), tax=taxAmt(inv), disc=discAmt(inv), tot=total(inv);
    const hasTax=parseFloat(inv.tax)>0, hasDisc=parseFloat(inv.discount)>0;
    const status = resolveStatus(inv);
    const st = ST[status];
    const DARK='#0f172a', BLUE='#2563EB';

    const stampSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="180" height="180">
      <circle cx="100" cy="100" r="90" fill="none" stroke="${st.color}" stroke-width="7"/>
      <circle cx="100" cy="100" r="78" fill="none" stroke="${st.color}" stroke-width="2"/>
      <text x="100" y="110" text-anchor="middle" font-family="system-ui,sans-serif" font-size="32" font-weight="900" fill="${st.color}" letter-spacing="6">${st.label.toUpperCase()}</text>
    </svg>`;

    return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${inv.number}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;background:#f1f5f9}
body{font-family:system-ui,-apple-system,'Helvetica Neue',sans-serif;color:#0f172a;font-size:13px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.wrap{padding:28px 20px}
.page{max-width:680px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.09)}
/* header */
.hd{background:${DARK};padding:28px 36px 24px;position:relative;overflow:hidden}
.hd::before{content:'';position:absolute;top:-60px;right:-60px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,.03);pointer-events:none}
.hd::after{content:'';position:absolute;bottom:-80px;left:30%;width:240px;height:240px;border-radius:50%;background:rgba(37,99,235,.05);pointer-events:none}
.hd-inner{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;position:relative;z-index:1;flex-wrap:wrap}
.inv-label{font-size:9px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:7px}
.inv-number{font-size:30px;font-weight:900;color:#fff;letter-spacing:-0.05em;line-height:1}
.inv-dates{display:flex;gap:18px;margin-top:12px;flex-wrap:wrap}
.inv-d-label{font-size:8.5px;font-weight:600;color:rgba(255,255,255,.3);letter-spacing:.08em;text-transform:uppercase;margin-bottom:2px}
.inv-d-val{font-size:12px;font-weight:600;color:rgba(255,255,255,.75)}
.hd-right{text-align:right}
.brand-logo{max-width:88px;max-height:36px;object-fit:contain;display:block;margin-left:auto;margin-bottom:6px;filter:brightness(0) invert(1) opacity(.8)}
.brand-name{font-size:15px;font-weight:800;color:#fff;letter-spacing:-0.02em;margin-bottom:3px}
.brand-sub{font-size:11px;color:rgba(255,255,255,.45);line-height:1.65}
/* status bar */
.bar{background:${BLUE};padding:8px 28px;display:flex;justify-content:space-between;align-items:center;gap:12px;position:relative;overflow:hidden}
.stamp-wm{position:absolute;right:-16px;top:50%;transform:translateY(-50%) rotate(-18deg);opacity:0.14;pointer-events:none}
.bar-to{font-size:13px;font-weight:700;color:#fff}
.bar-to-label{font-size:8px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.1em;text-transform:uppercase;margin-bottom:1px}
.bar-amt{text-align:right;position:relative;z-index:1}
.bar-amt-label{font-size:8px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.1em;text-transform:uppercase;margin-bottom:1px}
.bar-amt-val{font-size:16px;font-weight:900;color:#fff;letter-spacing:-0.03em}
/* parties */
.parties{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #f1f5f9}
.party{padding:16px 22px}
.party+.party{border-left:1px solid #f1f5f9}
.party-chip{display:inline-block;background:#eff6ff;border:1px solid #dbeafe;border-radius:4px;padding:2px 7px;font-size:7.5px;font-weight:800;color:${BLUE};letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
.party-name{font-size:14px;font-weight:800;color:#0f172a;margin-bottom:2px;letter-spacing:-0.01em}
.party-detail{font-size:11.5px;color:#64748b;line-height:1.6}
/* table */
.tbl-wrap{padding:16px 22px 0}
.tbl-label{font-size:8.5px;font-weight:700;color:#94a3b8;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px}
table{width:100%;border-collapse:collapse}
thead tr{border-bottom:2px solid #0f172a}
th{padding:7px 0;font-size:8.5px;font-weight:700;color:#64748b;letter-spacing:.07em;text-transform:uppercase;text-align:left;padding-right:12px}
th:first-child{width:28px;text-align:center;padding-right:8px}
th:last-child{text-align:right;padding-right:0}
th:nth-child(3),th:nth-child(4){text-align:right}
tbody tr{border-bottom:1px solid #f8fafc}
td{padding:9px 0;font-size:12.5px;color:#334155;vertical-align:top;padding-right:12px}
td:first-child{text-align:center;font-size:9.5px;font-weight:700;color:#94a3b8;padding-right:8px;padding-top:11px}
td:nth-child(2){font-weight:600;color:#0f172a}
td:nth-child(3),td:nth-child(4){text-align:right;color:#64748b}
td:last-child{text-align:right;font-weight:800;color:#0f172a;padding-right:0}
/* totals */
.totals{padding:12px 22px 16px;display:flex;justify-content:flex-end}
.totals-inner{min-width:240px}
.tot-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#64748b;border-bottom:1px solid #f8fafc}
.tot-row span:last-child{font-weight:600;color:#334155}
.tot-final{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;background:${DARK};border-radius:8px;margin-top:8px}
.tot-final-label{font-size:8.5px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.08em;text-transform:uppercase}
.tot-final-amt{font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.04em}
/* footer */
.footer{display:grid;grid-template-columns:1fr 1fr;gap:20px;padding:14px 22px;border-top:1px solid #f1f5f9;background:#f8fafc}
.ft-label{font-size:8px;font-weight:700;color:#94a3b8;letter-spacing:.12em;text-transform:uppercase;margin-bottom:5px}
.ft-body{font-size:11.5px;color:#475569;line-height:1.7}
/* thankyou */
.ty{background:${DARK};padding:14px 22px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.ty-word{font-size:17px;font-weight:900;color:#fff;letter-spacing:-0.04em}
.ty-contacts{display:flex;gap:16px;flex-wrap:wrap}
.ty-item{font-size:10.5px;color:rgba(255,255,255,.55)}
.ty-item strong{color:rgba(255,255,255,.85);margin-right:3px}
@media print{
  html,body{background:#fff}
  .wrap{padding:0;background:#fff}
  .page{box-shadow:none;border-radius:0;max-width:100%;margin:0}
}
</style></head><body>
<div class="wrap"><div class="page">

  <div class="hd">
    <div class="hd-inner">
      <div>
        <div class="inv-label">Invoice</div>
        <div class="inv-number">${inv.number}</div>
        <div class="inv-dates">
          <div><div class="inv-d-label">Issue Date</div><div class="inv-d-val">${inv.date}</div></div>
          ${inv.dueDate?`<div><div class="inv-d-label">Due Date</div><div class="inv-d-val">${inv.dueDate}</div></div>`:''}
        </div>
      </div>
      <div class="hd-right">
        ${inv.logo?`<img src="${inv.logo}" class="brand-logo" alt=""/>`:''}
        ${!inv.logo?`<div class="brand-name">${inv.from.name||''}</div>`:''}
        ${inv.from.email?`<div class="brand-sub">${inv.from.email}</div>`:''}
        ${inv.from.phone?`<div class="brand-sub">${inv.from.phone}</div>`:''}
      </div>
    </div>
  </div>

  <div class="bar">
    <div class="stamp-wm">${stampSVG}</div>
    <div>
      <div class="bar-to-label">Billed to</div>
      <div class="bar-to">${inv.to.name||'—'}</div>
    </div>
    <div class="bar-amt">
      <div class="bar-amt-label">Total Due</div>
      <div class="bar-amt-val">${fmt(tot,inv.currency)}</div>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-chip">Bill To</div>
      <div class="party-name">${inv.to.name||'—'}</div>
      ${inv.to.email?`<div class="party-detail">${inv.to.email}</div>`:''}
      ${inv.to.phone?`<div class="party-detail">${inv.to.phone}</div>`:''}
      ${inv.to.address?`<div class="party-detail" style="white-space:pre-line;margin-top:2px">${inv.to.address}</div>`:''}
    </div>
    <div class="party">
      <div class="party-chip">From</div>
      <div class="party-name">${inv.from.name||'—'}</div>
      ${inv.from.address?`<div class="party-detail" style="white-space:pre-line">${inv.from.address}</div>`:''}
    </div>
  </div>

  <div class="tbl-wrap">
    <div class="tbl-label">Services &amp; Deliverables</div>
    <table>
      <thead><tr><th>#</th><th>Description</th><th>Rate</th><th>Qty</th><th>Total</th></tr></thead>
      <tbody>${inv.items.map((it,i)=>{
        const a=(parseFloat(it.qty)||0)*(parseFloat(it.rate)||0);
        return `<tr><td>${String(i+1).padStart(2,'0')}</td><td>${it.description||'—'}</td><td>${fmt(parseFloat(it.rate||0),inv.currency)}</td><td>${it.qty}</td><td>${fmt(a,inv.currency)}</td></tr>`;
      }).join('')}</tbody>
    </table>
  </div>

  <div class="totals">
    <div class="totals-inner">
      <div class="tot-row"><span>Subtotal</span><span>${fmt(sub,inv.currency)}</span></div>
      ${hasTax?`<div class="tot-row"><span>Tax (${inv.tax}%)</span><span>${fmt(tax,inv.currency)}</span></div>`:''}
      ${hasDisc?`<div class="tot-row"><span>Discount (${inv.discount}%)</span><span style="color:#dc2626">− ${fmt(disc,inv.currency)}</span></div>`:''}
      <div class="tot-final">
        <span class="tot-final-label">Total Due</span>
        <span class="tot-final-amt">${fmt(tot,inv.currency)}</span>
      </div>
    </div>
  </div>

  ${inv.notes?`
  <div class="footer">
    <div><div class="ft-label">Notes &amp; Terms</div><div class="ft-body">${inv.notes}</div></div>
    <div style="text-align:right">
      <div class="ft-label">Issued by</div>
      <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:2px">${inv.from.name||''}</div>
      ${inv.from.email?`<div class="ft-body">${inv.from.email}</div>`:''}
    </div>
  </div>`:''}

  <div class="ty">
    <div class="ty-word">Thank you.</div>
    <div class="ty-contacts">
      ${inv.from.phone?`<div class="ty-item"><strong>Tel</strong>${inv.from.phone}</div>`:''}
      ${inv.from.email?`<div class="ty-item"><strong>Email</strong>${inv.from.email}</div>`:''}
    </div>
  </div>

</div></div></body></html>`;
  }

  function downloadPDF(inv) {
    const w = window.open('', '_blank');
    if (w) { w.document.write(buildPDFHtml(inv)); w.document.close(); setTimeout(()=>w.print(), 800); }
  }

  /* ── Atoms ──────────────────────────────────────────────────── */
  const card = (extra={}) => ({background:'var(--bg)', border:'1px solid var(--border)', borderRadius:14, padding:'20px 22px', ...extra});
  const lbl = {fontSize:11, fontWeight:700, color:'var(--text-3)', letterSpacing:'0.07em', textTransform:'uppercase', marginBottom:6, display:'block'};

  const Btn = ({primary,sm,onClick,children,style={}}) => (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap:6,
      height:sm?34:40, padding:sm?'0 14px':'0 20px',
      background:primary?'var(--accent)':'transparent',
      color:primary?'#fff':'var(--text-2)',
      border:primary?'none':'1.5px solid var(--border)',
      borderRadius:999, fontSize:sm?12.5:13.5, fontWeight:600,
      cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
      letterSpacing:'-0.01em', ...style
    }}>{children}</button>
  );

  const BackBtn = ({onClick}) => (
    <button onClick={onClick} style={{
      width:38, height:38, borderRadius:11,
      background:'var(--bg-elev-1)', border:'1px solid var(--border)',
      cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
      color:'var(--text-2)', flexShrink:0,
    }}>
      <ArrowRight size={15} style={{transform:'rotate(180deg)'}}/>
    </button>
  );

  /* ═══════════════════════════════════════════════════════════
     LIST
  ═══════════════════════════════════════════════════════════ */
  if (view === 'list') return (
    <div style={{padding:'36px 0 64px'}}>
      <style>{`
        .il-row{display:flex;align-items:center;gap:14px;padding:16px 20px;background:var(--bg);border:1px solid var(--border);border-radius:14px;cursor:pointer;transition:border-color .18s,box-shadow .18s;position:relative;overflow:hidden}
        .il-row:hover{border-color:var(--accent);box-shadow:0 0 0 3px rgba(37,99,235,.06)}
        .il-icon{width:40px;height:40px;border-radius:11px;background:var(--accent-bg-soft);border:1px solid var(--accent-border-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .il-body{flex:1;min-width:0}
        .il-num{font-size:14px;font-weight:700;color:var(--text-1);letter-spacing:-0.01em;margin-bottom:1px}
        .il-client{font-size:13px;color:var(--text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:2px}
        .il-meta{font-size:11.5px;color:var(--text-3)}
        .il-right{display:flex;align-items:center;gap:10px;flex-shrink:0}
        .il-amt{font-size:15px;font-weight:800;color:var(--text-1);letter-spacing:-0.03em}
        .il-btn{width:30px;height:30px;border-radius:8px;background:var(--bg-elev-1);border:1px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-3);transition:all .15s;flex-shrink:0}
        .il-btn:hover{color:var(--text-1);background:var(--bg-elev-2)}
        .il-btn.del:hover{color:#dc2626;background:#fef2f2;border-color:#fecaca}
        @media(max-width:600px){
          .il-row{padding:14px 16px;gap:12px}
          .il-icon{width:36px;height:36px;border-radius:10px}
          .il-right{gap:8px}
          .il-amt{font-size:14px}
          .il-btn{width:28px;height:28px}
        }
        @media(max-width:440px){
          .il-right{flex-wrap:wrap;justify-content:flex-end;max-width:120px}
        }
      `}</style>

      {/* Page header */}
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:32,gap:14,flexWrap:'wrap'}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:800,letterSpacing:'-0.03em',color:'var(--text-1)',lineHeight:1.15}}>Invoices</h2>
          <p style={{fontSize:13,color:'var(--text-3)',marginTop:5}}>
            {invoices.length===0?'No invoices yet':`${invoices.length} invoice${invoices.length>1?'s':''}`} · saved for 15 days
          </p>
        </div>
        <Btn primary onClick={openNew}><Plus size={15}/>New invoice</Btn>
      </div>

      {/* Empty state */}
      {invoices.length === 0 ? (
        <div style={{border:'1.5px dashed var(--border)',borderRadius:18,padding:'72px 24px',textAlign:'center'}}>
          <div style={{width:52,height:52,borderRadius:15,background:'var(--accent-bg-soft)',border:'1px solid var(--accent-border-soft)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px'}}>
            <Receipt size={22} style={{color:'var(--accent)'}}/>
          </div>
          <p style={{fontSize:16,fontWeight:800,color:'var(--text-1)',marginBottom:7,letterSpacing:'-0.02em'}}>No invoices yet</p>
          <p style={{fontSize:13.5,color:'var(--text-3)',maxWidth:270,margin:'0 auto 24px',lineHeight:1.6}}>Create a professional invoice your clients will remember</p>
          <Btn primary onClick={openNew}><Plus size={15}/>New invoice</Btn>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {invoices.map(inv => {
            const st = resolveStatus(inv);
            const expires = INVOICE_RETENTION_DAYS - Math.floor((Date.now()-inv.createdAt)/86400000);
            return (
              <div key={inv.id} className="il-row" onClick={()=>openPreview(inv)}>
                <div className="il-icon">
                  {inv.logo
                    ? <img src={inv.logo} alt="" style={{width:24,height:24,objectFit:'contain',borderRadius:4}}/>
                    : <Receipt size={17} style={{color:'var(--accent)'}}/>}
                </div>
                <div className="il-body">
                  <div className="il-num">{inv.number}</div>
                  {inv.to.name && <div className="il-client">{inv.to.name}</div>}
                  <div className="il-meta">Due {inv.dueDate} · {expires}d left</div>
                </div>
                <div className="il-right">
                  <div className="il-amt">{fmt(total(inv),inv.currency)}</div>
                  <div onClick={e=>e.stopPropagation()}>
                    <StatusDropdown status={st} onChange={s=>setStatus(inv.id,s)}/>
                  </div>
                  <button className="il-btn" title="Edit" onClick={e=>{e.stopPropagation();openEdit(inv);}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                  </button>
                  <button className="il-btn del" title="Delete" onClick={e=>{e.stopPropagation();deleteInvoice(inv.id);}}>
                    <X size={12}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     CREATE / EDIT
  ═══════════════════════════════════════════════════════════ */
  if (view === 'create') return (
    <div style={{padding:'36px 0 64px'}}>
      <style>{`
        .if-g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .if-ig{display:grid;grid-template-columns:1fr 64px 104px 96px 28px;gap:7px;align-items:center;margin-bottom:9px}
        .if-ih{display:grid;grid-template-columns:1fr 64px 104px 96px 28px;gap:7px;padding-bottom:10px;border-bottom:1px solid var(--border);margin-bottom:10px}
        @media(max-width:680px){
          .if-g2{grid-template-columns:1fr}
          .if-ig{grid-template-columns:1fr 54px 88px 80px 26px;gap:5px}
          .if-ih{grid-template-columns:1fr 54px 88px 80px 26px;gap:5px}
        }
        @media(max-width:440px){
          .if-ig{grid-template-columns:1fr 46px 74px 68px 24px;gap:4px}
          .if-ih{grid-template-columns:1fr 46px 74px 68px 24px;gap:4px}
        }
      `}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:32}}>
        <BackBtn onClick={()=>setView('list')}/>
        <div style={{flex:1,minWidth:0}}>
          <h2 style={{fontSize:19,fontWeight:800,letterSpacing:'-0.025em',color:'var(--text-1)'}}>
            {invoices.find(i=>i.id===current.id)?'Edit Invoice':'New Invoice'}
          </h2>
          <p style={{fontSize:12.5,color:'var(--text-3)',marginTop:2}}>{current.number}</p>
        </div>
        <StatusDropdown
          status={resolveStatus(current)}
          size="lg"
          onChange={s=>setCurrent(c=>({...c,status:s}))}
        />
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:14}}>

        {/* Invoice meta */}
        <div style={card()}>
          <p style={{...lbl,marginBottom:18}}>Invoice Details</p>
          <div className="if-g2">
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <label style={lbl}>Invoice #</label>
              <input className="ff-input" value={current.number} onChange={e=>setCurrent(c=>({...c,number:e.target.value}))}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <label style={lbl}>Currency</label>
              <select className="ff-input" value={current.currency} onChange={e=>setCurrent(c=>({...c,currency:e.target.value}))} style={{cursor:'pointer'}}>
                {['USD','EUR','GBP','CAD','AUD','NGN'].map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <label style={lbl}>Issue Date</label>
              <input className="ff-input" type="date" value={current.date} onChange={e=>setCurrent(c=>({...c,date:e.target.value}))}/>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <label style={lbl}>Due Date</label>
              <input className="ff-input" type="date" value={current.dueDate} onChange={e=>setCurrent(c=>({...c,dueDate:e.target.value}))}/>
            </div>
          </div>
        </div>

        {/* From / To */}
        <div className="if-g2">
          {[['from','From — You'],['to','Bill To']].map(([key,title])=>(
            <div key={key} style={card()}>
              <p style={{...lbl,marginBottom:16}}>{title}</p>

              {/* Logo upload — only for "from" */}
              {key==='from' && (
                <div style={{marginBottom:14}}>
                  <label style={lbl}>Logo <span style={{fontWeight:400,textTransform:'none',letterSpacing:0}}>— optional</span></label>
                  {current.logo ? (
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{position:'relative',flexShrink:0}}>
                        <img src={current.logo} alt="Logo" style={{width:56,height:34,objectFit:'contain',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-elev-1)',padding:4}}/>
                        <button onClick={()=>setCurrent(c=>({...c,logo:null}))} style={{position:'absolute',top:-6,right:-6,width:18,height:18,borderRadius:'50%',background:'var(--text-1)',color:'var(--bg)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          <X size={9}/>
                        </button>
                      </div>
                      <span style={{fontSize:11.5,color:'var(--text-3)'}}>Logo uploaded</span>
                    </div>
                  ) : (
                    <label style={{display:'inline-flex',alignItems:'center',gap:7,padding:'8px 14px',border:'1.5px dashed var(--border)',borderRadius:10,cursor:'pointer',fontSize:13,color:'var(--text-3)',fontWeight:500,transition:'border-color .15s'}}>
                      <Plus size={13}/>Upload logo
                      <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>handleLogo(e.target.files?.[0], logo=>setCurrent(c=>({...c,logo})))}/>
                    </label>
                  )}
                </div>
              )}

              <div style={{display:'flex',flexDirection:'column',gap:9}}>
                <input className="ff-input" placeholder="Full name or company" value={current[key].name} onChange={e=>setCurrent(c=>({...c,[key]:{...c[key],name:e.target.value}}))}/>
                <input className="ff-input" placeholder="Email" value={current[key].email} onChange={e=>setCurrent(c=>({...c,[key]:{...c[key],email:e.target.value}}))}/>
                <input className="ff-input" placeholder="Phone" value={current[key].phone||''} onChange={e=>setCurrent(c=>({...c,[key]:{...c[key],phone:e.target.value}}))}/>
                <textarea className="ff-textarea" placeholder="Address" rows={2} value={current[key].address} onChange={e=>setCurrent(c=>({...c,[key]:{...c[key],address:e.target.value}}))} style={{minHeight:48,resize:'none',fontSize:13.5}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Line items */}
        <div style={card()}>
          <p style={{...lbl,marginBottom:16}}>Line Items</p>
          <div className="if-ih">
            {['Description','Qty','Rate','Amount',''].map((h,i)=>(
              <span key={i} style={{fontSize:10.5,fontWeight:700,color:'var(--text-3)',letterSpacing:'.07em',textTransform:'uppercase',textAlign:i>=2&&i<4?'right':'left'}}>{h}</span>
            ))}
          </div>
          {current.items.map(it=>{
            const amt=(parseFloat(it.qty)||0)*(parseFloat(it.rate)||0);
            return (
              <div key={it.id} className="if-ig">
                <input className="ff-input" placeholder="Service or deliverable" value={it.description} onChange={e=>updateItem(it.id,'description',e.target.value)} style={{fontSize:13.5}}/>
                <input className="ff-input" type="number" min="1" value={it.qty} onChange={e=>updateItem(it.id,'qty',e.target.value)} style={{fontSize:13.5,textAlign:'center',padding:'9px 4px'}}/>
                <input className="ff-input" type="number" min="0" step="0.01" placeholder="0.00" value={it.rate} onChange={e=>updateItem(it.id,'rate',e.target.value)} style={{fontSize:13.5,textAlign:'right',padding:'9px 8px'}}/>
                <span style={{fontSize:13.5,fontWeight:700,color:'var(--text-1)',textAlign:'right',letterSpacing:'-0.01em'}}>{fmt(amt,current.currency)}</span>
                <button onClick={()=>removeItem(it.id)} disabled={current.items.length===1} style={{width:26,height:26,borderRadius:8,background:'var(--bg-elev-1)',border:'1px solid var(--border)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)',opacity:current.items.length===1?0.2:1}}>
                  <X size={10}/>
                </button>
              </div>
            );
          })}
          <button onClick={addItem} style={{display:'inline-flex',alignItems:'center',gap:5,fontSize:13,fontWeight:600,color:'var(--accent)',background:'none',border:'none',cursor:'pointer',padding:'8px 0 16px'}}>
            <Plus size={13}/>Add line item
          </button>

          {/* Tax / Discount / Total */}
          <div style={{borderTop:'1px solid var(--border)',paddingTop:16}}>
            <div className="if-g2" style={{gap:12,marginBottom:16}}>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label style={lbl}>Tax %</label>
                <input className="ff-input" type="number" min="0" max="100" placeholder="0" value={current.tax||''} onChange={e=>setCurrent(c=>({...c,tax:e.target.value}))}/>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                <label style={lbl}>Discount %</label>
                <input className="ff-input" type="number" min="0" max="100" placeholder="0" value={current.discount||''} onChange={e=>setCurrent(c=>({...c,discount:e.target.value}))}/>
              </div>
            </div>
            <div style={{background:'var(--bg-elev-1)',borderRadius:12,padding:'14px 18px'}}>
              {[
                ['Subtotal', fmt(subtotal(current),current.currency), false],
                parseFloat(current.tax)>0 && [`Tax (${current.tax}%)`, fmt(taxAmt(current),current.currency), false],
                parseFloat(current.discount)>0 && [`Discount (${current.discount}%)`, `− ${fmt(discAmt(current),current.currency)}`, true],
              ].filter(Boolean).map(([l,v,red])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--text-3)',marginBottom:8}}>
                  <span>{l}</span><span style={{fontWeight:600,color:red?'#dc2626':'var(--text-2)'}}>{v}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:10,borderTop:'1px solid var(--border)',marginTop:4}}>
                <span style={{fontSize:14,fontWeight:700,color:'var(--text-1)',letterSpacing:'-0.01em'}}>Total</span>
                <span style={{fontSize:21,fontWeight:900,color:'var(--text-1)',letterSpacing:'-0.04em'}}>{fmt(total(current),current.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={card()}>
          <label style={{...lbl,marginBottom:10}}>Notes &amp; Terms<span style={{fontWeight:400,textTransform:'none',letterSpacing:0,marginLeft:6}}>— optional</span></label>
          <textarea className="ff-textarea" placeholder="Payment terms, bank details, a thank you…" rows={3} value={current.notes} onChange={e=>setCurrent(c=>({...c,notes:e.target.value}))} style={{minHeight:72,resize:'vertical'}}/>
        </div>

        <div style={{display:'flex',gap:8,justifyContent:'flex-end',flexWrap:'wrap',paddingTop:4}}>
          <Btn onClick={()=>setView('list')}>Cancel</Btn>
          <Btn primary onClick={saveInvoice}><Check size={15}/>Save Invoice</Btn>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     PREVIEW
  ═══════════════════════════════════════════════════════════ */
  if (view === 'preview') {
    const sub=subtotal(current), tax=taxAmt(current), disc=discAmt(current), tot=total(current);
    const hasTax=parseFloat(current.tax)>0, hasDisc=parseFloat(current.discount)>0;
    const DARK='#0f172a', BLUE='#2563EB';
    const status = resolveStatus(current);
    const st = ST[status];

    return (
      <div style={{padding:'36px 0 64px'}}>
        <style>{`
          .ip-parties{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--border)}
          .ip-th{display:grid;grid-template-columns:34px 1fr 96px 52px 104px;gap:8px}
          .ip-tr{display:grid;grid-template-columns:34px 1fr 96px 52px 104px;gap:8px;align-items:center}
          @media(max-width:620px){
            .ip-parties{grid-template-columns:1fr}
            .ip-th{grid-template-columns:28px 1fr 78px 40px 86px;gap:5px}
            .ip-tr{grid-template-columns:28px 1fr 78px 40px 86px;gap:5px}
          }
          @media(max-width:420px){
            .ip-th{display:none}
            .ip-tr{grid-template-columns:1fr auto;gap:8px}
            .ip-hide{display:none}
          }
        `}</style>

        {/* Toolbar */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:28,gap:12,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <BackBtn onClick={()=>setView('list')}/>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                <h2 style={{fontSize:17,fontWeight:800,letterSpacing:'-0.025em',color:'var(--text-1)'}}>{current.number}</h2>
                <StatusDropdown status={status} size="lg" onChange={s=>setStatus(current.id,s)}/>
              </div>
              <p style={{fontSize:12,color:'var(--text-3)',marginTop:3}}>{current.to.name&&`${current.to.name} · `}Due {current.dueDate}</p>
            </div>
          </div>
          <div style={{display:'flex',gap:7}}>
            <Btn sm onClick={()=>openEdit(current)}>Edit</Btn>
            <Btn sm primary onClick={()=>downloadPDF(current)}><ArrowRight size={13}/>Download PDF</Btn>
          </div>
        </div>

        {/* Document card */}
        <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:18,overflow:'hidden',boxShadow:'0 2px 20px rgba(0,0,0,.06)'}}>

          {/* Dark header */}
          <div style={{background:DARK,padding:'28px 30px 24px',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-44,right:-44,width:150,height:150,borderRadius:'50%',background:'rgba(255,255,255,.025)'}}/>
            <div style={{position:'absolute',bottom:-60,left:'38%',width:190,height:190,borderRadius:'50%',background:'rgba(37,99,235,.05)'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:16,position:'relative',zIndex:1}}>
              <div>
                <div style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.3)',letterSpacing:'.2em',textTransform:'uppercase',marginBottom:7}}>Invoice</div>
                <div style={{fontSize:28,fontWeight:900,color:'#fff',letterSpacing:'-0.05em',lineHeight:1}}>{current.number}</div>
                <div style={{display:'flex',gap:18,marginTop:12,flexWrap:'wrap'}}>
                  {[['Issue Date',current.date],['Due Date',current.dueDate]].filter(([,v])=>v).map(([l,v])=>(
                    <div key={l}>
                      <div style={{fontSize:8.5,fontWeight:600,color:'rgba(255,255,255,.28)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:2}}>{l}</div>
                      <div style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,.72)'}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                {current.logo
                  ? <img src={current.logo} alt="Logo" style={{maxWidth:84,maxHeight:34,objectFit:'contain',marginBottom:6,display:'block',marginLeft:'auto',filter:'brightness(0) invert(1) opacity(.8)'}}/>
                  : <div style={{fontSize:16,fontWeight:800,color:'#fff',letterSpacing:'-0.02em',marginBottom:4}}>{current.from.name||'Your Name'}</div>
                }
                {current.from.email&&<div style={{fontSize:11.5,color:'rgba(255,255,255,.45)'}}>{current.from.email}</div>}
                {current.from.phone&&<div style={{fontSize:11.5,color:'rgba(255,255,255,.45)'}}>{current.from.phone}</div>}
              </div>
            </div>
          </div>

          {/* Blue status bar — stamp watermark */}
          <div style={{background:BLUE,padding:'9px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,position:'relative',overflow:'hidden'}}>
            {/* Watermark stamp — large, centered, very subtle */}
            <div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%) rotate(-18deg)',opacity:0.12,pointerEvents:'none',zIndex:0}}>
              <svg viewBox="0 0 180 180" width="120" height="120">
                <circle cx="90" cy="90" r="82" fill="none" stroke={st.color} strokeWidth="7"/>
                <circle cx="90" cy="90" r="71" fill="none" stroke={st.color} strokeWidth="2"/>
                <text x="90" y="98" textAnchor="middle" fontFamily="system-ui,sans-serif" fontSize="24" fontWeight="900" fill={st.color} letterSpacing="5">{st.label.toUpperCase()}</text>
              </svg>
            </div>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:8,fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:1}}>Billed to</div>
              <div style={{fontSize:13.5,fontWeight:700,color:'#fff'}}>{current.to.name||'—'}</div>
            </div>
            <div style={{textAlign:'right',position:'relative',zIndex:1}}>
              <div style={{fontSize:8,fontWeight:700,color:'rgba(255,255,255,.5)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:1}}>Total Due</div>
              <div style={{fontSize:17,fontWeight:900,color:'#fff',letterSpacing:'-0.03em'}}>{fmt(tot,current.currency)}</div>
            </div>
          </div>

          {/* Parties — Bill To full, From address only */}
          <div className="ip-parties">
            {[['Bill To',current.to,true],['From',current.from,false]].map(([label,party,showContact],i)=>(
              <div key={label} style={{padding:'18px 22px',borderRight:i===0?'1px solid var(--border)':'none'}}>
                <div style={{display:'inline-block',background:'var(--accent-bg-soft)',border:'1px solid var(--accent-border-soft)',borderRadius:5,padding:'2px 8px',fontSize:8.5,fontWeight:800,color:BLUE,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:9}}>{label}</div>
                <div style={{fontSize:14.5,fontWeight:800,color:'var(--text-1)',marginBottom:2,letterSpacing:'-0.01em'}}>{party.name||'—'}</div>
                {showContact&&party.email&&<div style={{fontSize:12.5,color:'var(--text-3)'}}>{party.email}</div>}
                {showContact&&party.phone&&<div style={{fontSize:12.5,color:'var(--text-3)'}}>{party.phone}</div>}
                {party.address&&<div style={{fontSize:12,color:'var(--text-3)',whiteSpace:'pre-line',marginTop:3,lineHeight:1.6}}>{party.address}</div>}
              </div>
            ))}
          </div>

          {/* Line items */}
          <div style={{padding:'20px 22px'}}>
            <div style={{fontSize:9.5,fontWeight:700,color:'var(--text-3)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:12}}>Services &amp; Deliverables</div>

            <div className="ip-th" style={{paddingBottom:9,borderBottom:'2px solid var(--text-1)',marginBottom:2}}>
              {['#','Description','Rate','Qty','Total'].map((h,i)=>(
                <span key={h} style={{fontSize:10,fontWeight:700,color:'var(--text-3)',letterSpacing:'.07em',textTransform:'uppercase',textAlign:i===0?'center':i>1?'right':'left'}}>{h}</span>
              ))}
            </div>

            {current.items.map((it,idx)=>{
              const amt=(parseFloat(it.qty)||0)*(parseFloat(it.rate)||0);
              return (
                <div key={it.id} className="ip-tr" style={{padding:'11px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textAlign:'center'}}>{String(idx+1).padStart(2,'0')}</span>
                  <span style={{fontSize:14,fontWeight:600,color:'var(--text-1)',letterSpacing:'-0.005em'}}>{it.description||'—'}</span>
                  <span className="ip-hide" style={{fontSize:13,color:'var(--text-2)',textAlign:'right'}}>{fmt(it.rate||0,current.currency)}</span>
                  <span className="ip-hide" style={{fontSize:13,color:'var(--text-2)',textAlign:'right'}}>{it.qty}</span>
                  <span style={{fontSize:14,fontWeight:800,color:'var(--text-1)',textAlign:'right',letterSpacing:'-0.02em'}}>{fmt(amt,current.currency)}</span>
                </div>
              );
            })}

            {/* Totals */}
            <div style={{display:'flex',justifyContent:'flex-end',paddingTop:20}}>
              <div style={{minWidth:260,background:'var(--bg-elev-1)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden'}}>
                {[
                  ['Subtotal', fmt(sub,current.currency), false],
                  hasTax&&[`Tax (${current.tax}%)`, fmt(tax,current.currency), false],
                  hasDisc&&[`Discount (${current.discount}%)`, `− ${fmt(disc,current.currency)}`, true],
                ].filter(Boolean).map(([l,v,red])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 14px',fontSize:13,color:'var(--text-3)',borderBottom:'1px solid var(--border)'}}>
                    <span>{l}</span><span style={{fontWeight:600,color:red?'#dc2626':'var(--text-2)'}}>{v}</span>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 14px',background:DARK}}>
                  <span style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,.45)',letterSpacing:'.08em',textTransform:'uppercase'}}>Total Due</span>
                  <span style={{fontSize:21,fontWeight:900,color:'#fff',letterSpacing:'-0.04em'}}>{fmt(tot,current.currency)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {current.notes&&(
              <div style={{marginTop:20,padding:'14px 18px',background:'var(--bg-elev-1)',borderRadius:11,border:'1px solid var(--border)'}}>
                <p style={{fontSize:9.5,fontWeight:700,color:'var(--text-3)',letterSpacing:'.08em',textTransform:'uppercase',marginBottom:7}}>Notes &amp; Terms</p>
                <p style={{fontSize:13.5,color:'var(--text-2)',lineHeight:1.75,whiteSpace:'pre-line'}}>{current.notes}</p>
              </div>
            )}
          </div>

          {/* Thank you footer */}
          <div style={{background:DARK,padding:'18px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
            <p style={{fontSize:18,fontWeight:900,color:'#fff',letterSpacing:'-0.04em'}}>Thank you.</p>
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              {current.from.phone&&<span style={{fontSize:11.5,color:'rgba(255,255,255,.5)'}}><strong style={{color:'rgba(255,255,255,.82)',marginRight:3}}>Tel</strong>{current.from.phone}</span>}
              {current.from.email&&<span style={{fontSize:11.5,color:'rgba(255,255,255,.5)'}}><strong style={{color:'rgba(255,255,255,.82)',marginRight:3}}>Email</strong>{current.from.email}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}



export default function FreelancersForge() {
  const [themeMode, setThemeMode] = useState('system'); // 'light' | 'dark' | 'system'
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [tab, setTab] = useState('optimize');
  const [preloading, setPreloading] = useState(() => {
    try { return !localStorage.getItem('ff_visited'); } catch { return true; }
  });
  const themeMenuRef = useRef(null);

  // Resolved theme: 'light' or 'dark'
  const theme = themeMode === 'system' ? systemTheme : themeMode;

  // Sync system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!themeMenuOpen) return;
    const handler = (e) => { if (themeMenuRef.current && !themeMenuRef.current.contains(e.target)) setThemeMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [themeMenuOpen]);

  const themeOptions = [
    { id: 'system', label: 'Auto',  desc: 'Follows your device',        icon: <Monitor size={14} /> },
    { id: 'light',  label: 'Light', desc: 'Light background, dark text', icon: <Sun size={14} /> },
    { id: 'dark',   label: 'Dark',  desc: 'Dark background, light text', icon: <Moon size={14} /> },
  ];

  const activeOption = themeOptions.find(o => o.id === themeMode);

  return (
    <div className={`ff-root ${theme}`}>
      <style>{CSS}</style>

      {preloading && <Preloader onDone={() => {
        setPreloading(false);
        try { localStorage.setItem('ff_visited', '1'); } catch {}
      }} theme={theme} />}

      <div className="ff-gradient-bg" aria-hidden="true"></div>
      <div className="ff-root-inner" style={{ position: 'relative', zIndex: 1 }}>

        {/* HEADER */}
        <div className="ff-topbar">
          <div className="flex items-center gap-3">
            <span className="ff-status-dot"></span>
            <span className="ff-meta-text">Freelancer's Forge</span>
          </div>

          {/* Theme dropdown */}
          <div className="ff-theme-dropdown" ref={themeMenuRef}>
            <button
              type="button"
              className="ff-theme-toggle"
              onClick={() => setThemeMenuOpen(o => !o)}
              aria-label="Change theme"
            >
              {activeOption && React.cloneElement(activeOption.icon, { size: 13 })}
              <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>Theme:</span>
              {activeOption?.label}
              <ChevronDown size={10} style={{
                opacity: 0.4,
                transition: 'transform 160ms ease',
                transform: themeMenuOpen ? 'rotate(180deg)' : 'none',
                marginLeft: -2,
              }} />
            </button>

            {themeMenuOpen && (
              <div className="ff-theme-menu">
                <div style={{
                  padding: '6px 10px 4px',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: 'var(--text-3)',
                  fontFamily: 'var(--font-text)',
                }}>
                  Theme
                </div>
                {themeOptions.map((opt, i) => (
                  <React.Fragment key={opt.id}>
                    {i === 1 && <div className="ff-theme-menu-divider" />}
                    <button
                      type="button"
                      className={`ff-theme-option${themeMode === opt.id ? ' ff-theme-option-active' : ''}`}
                      onClick={() => { setThemeMode(opt.id); setThemeMenuOpen(false); }}
                    >
                      <span className="ff-theme-option-check">
                        <Check size={13} strokeWidth={2.5} />
                      </span>
                      <span className="ff-theme-option-icon">{opt.icon}</span>
                      <span className="ff-theme-option-text">
                        <span className="ff-theme-option-label">{opt.label}</span>
                        <span className="ff-theme-option-desc">{opt.desc}</span>
                      </span>
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TITLE */}
        <div className="ff-hero">
          <h1 className="ff-display ff-text-1 ff-hero-heading">
            Your freelance edge.<br />
            <span style={{ color: 'var(--accent)' }}>Built to win clients.</span>
          </h1>
          <p className="ff-text-2 ff-hero-sub" style={{ maxWidth: 500 }}>
            Audit any page. Write proposals that get clicked. Track your pipeline. Get tactical freelance advice — no account needed.
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
          <button
            type="button"
            className={`ff-tab ${tab === 'invoice' ? 'ff-tab-active' : ''}`}
            onClick={() => setTab('invoice')}
          >
            <Receipt size={15} />
            Invoice
          </button>

        </div>

        {tab === 'optimize' && <OptimizeTab />}
        {tab === 'close' && <CloseTab />}
        {tab === 'pipeline' && <PipelineTab />}
        {tab === 'ask' && <AskAnythingTab />}
        {tab === 'invoice' && <InvoiceTab />}

      </div>
    </div>
  );
}

/* ====================================================================== */
/* ASK ANYTHING TAB                                                       */
/* ====================================================================== */

function formatMessageText(text) {
  if (!text) return null;
  // Split into blocks by double newline (paragraphs)
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, bi) => {
    const lines = block.split('\n');
    // Detect bullet list
    const isList = lines.every(l => l.trim().match(/^[-*•]\s/) || l.trim() === '');
    if (isList && lines.some(l => l.trim().match(/^[-*•]\s/))) {
      return (
        <ul key={bi} style={{ margin: '0 0 10px', paddingLeft: 20, listStyle: 'disc' }}>
          {lines.filter(l => l.trim()).map((l, li) => (
            <li key={li} style={{ marginBottom: 4, lineHeight: 1.65 }}>
              {inlineFormat(l.trim().replace(/^[-*•]\s+/, ''))}
            </li>
          ))}
        </ul>
      );
    }
    // Detect numbered list
    const isNumbered = lines.every(l => l.trim().match(/^\d+\.\s/) || l.trim() === '');
    if (isNumbered && lines.some(l => l.trim().match(/^\d+\.\s/))) {
      return (
        <ol key={bi} style={{ margin: '0 0 10px', paddingLeft: 20 }}>
          {lines.filter(l => l.trim()).map((l, li) => (
            <li key={li} style={{ marginBottom: 4, lineHeight: 1.65 }}>
              {inlineFormat(l.trim().replace(/^\d+\.\s+/, ''))}
            </li>
          ))}
        </ol>
      );
    }
    // Heading detection (## or ###)
    if (lines.length === 1 && lines[0].match(/^#{1,3}\s/)) {
      const lvl = lines[0].match(/^(#{1,3})\s/)[1].length;
      const txt = lines[0].replace(/^#{1,3}\s+/, '');
      const sizes = { 1: 17, 2: 15, 3: 14 };
      return <p key={bi} style={{ fontWeight: 700, fontSize: sizes[lvl], color: 'var(--text-1)', margin: '12px 0 4px', letterSpacing: '-0.01em' }}>{inlineFormat(txt)}</p>;
    }
    // Code block
    if (block.startsWith('```')) {
      const code = block.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
      return <pre key={bi} style={{ background: 'var(--bg-elev-2)', borderRadius: 8, padding: '10px 14px', fontSize: 12.5, overflowX: 'auto', margin: '6px 0 10px', lineHeight: 1.6, fontFamily: 'var(--font-mono)' }}><code>{code}</code></pre>;
    }
    // Paragraph
    return (
      <p key={bi} style={{ margin: bi < blocks.length - 1 ? '0 0 10px' : 0, lineHeight: 1.68 }}>
        {lines.map((line, li) => (
          <span key={li}>{inlineFormat(line)}{li < lines.length - 1 && <br />}</span>
        ))}
      </p>
    );
  });
}

function inlineFormat(text) {
  // Bold, italic, inline code
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} style={{ fontWeight: 700, color: 'var(--text-1)' }}>{p.slice(2,-2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1,-1)}</em>;
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} style={{ background: 'var(--bg-elev-2)', borderRadius: 4, padding: '1px 5px', fontSize: '0.9em', fontFamily: 'var(--font-mono)' }}>{p.slice(1,-1)}</code>;
    return p;
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
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const messages = convos.find(c => c.id === activeId)?.messages || [];

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    const el = messagesContainerRef.current;
    // Use rAF so DOM has painted before we measure scrollHeight
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
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
          model: 'claude-sonnet-4-5', max_tokens: 2000,
          system: `You are Forge — a senior freelance advisor who has been in the trenches for years. You have won high-value deals, lost bad-fit clients on purpose, navigated scope creep, raised rates mid-project, and built pipelines from zero. You give advice the way a sharp, trusted friend who happens to know everything about freelancing would: direct, specific, honest, and immediately useful.

WHEN SOMEONE SHARES ANYTHING (job post, message, contract, screenshot, text):
Read every single word before responding. Not a skim. Every word.
- What did they write first? That is the highest priority.
- What did they repeat or emphasise? That is what they are worried about.
- What did they NOT say that you would expect? That is what they have given up hoping for.
- What is the emotional subtext? Anxious, burned, hopeful, testing you?
Answer based on what is actually there. Never on what you assumed.

HOW YOU ANSWER:
Lead with the answer, not the preamble. If someone asks what to charge, say the number first.
If they share a job post, name what you actually see in it before giving advice.
If they share a message or contract, say what it signals before recommending what to do.
When you recommend what to say or write, give the exact words. Not a framework. The actual sentence.
Say when something is a bad idea. Say why. Freelancers need honest reads, not validation.
If a situation is genuinely nuanced, say so — but then still give your best call.

FORMAT:
- Short paragraphs. One idea per paragraph.
- Use a numbered list when steps matter. Use bullets when items are parallel. Use prose when thinking flows.
- Bold the most important word or phrase in a section when it matters.
- Never use headers unless the response is genuinely long and needs navigation.
- No em dashes. No "I hope this helps." No "Great question." No filler openers.

WHAT YOU KNOW COLD:
Freelance pricing across every major niche and platform. What actually moves the needle on Upwork, LinkedIn, Contra, Toptal, direct outreach. How to write proposals, DMs, and follow-ups that get hired. Client psychology at every stage: evaluation, negotiation, during the project, after delivery. Scope creep, rate increase conversations, awkward client emails, how to say no without losing the relationship. The exact difference between a freelancer earning $40/hr and $200/hr (it is almost never skill).

WHAT YOU NEVER DO:
Give advice so generic it could apply to anyone.
Hedge every answer to avoid being wrong.
Use buzzwords: leverage, synergy, streamline, value proposition, scalable, robust.
Tell someone their plan is great when it is not.
Write more than needed. Saying less, more precisely, is almost always better.`,
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
      {/* Compact header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10, flexWrap: 'wrap' }}>
        <div>
          <h2 className="ff-display ff-text-1" style={{ fontSize: 24, letterSpacing: '-0.038em', marginBottom: 2 }}>Ask anything</h2>
          <p className="ff-text-3" style={{ fontSize: 13, lineHeight: 1.4 }}>Strategy, pricing, copy, clients — direct answers.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="button" className="ff-chat-sidebar-toggle" onClick={() => setSidebarOpen(true)}>
            <MessageSquare size={14} />
            Chats{convos.length > 0 ? ` (${convos.length})` : ''}
          </button>
          <button type="button" className="ff-btn ff-btn-secondary" onClick={startNewChat} style={{ width: 'auto', padding: '7px 13px', fontSize: 13, gap: 6 }}>
            <Plus size={13} /> New chat
          </button>
        </div>
      </div>

      {/* Mobile bottom sheet backdrop */}
      <div className={`ff-sheet-backdrop${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Mobile bottom sheet */}
      <div className={`ff-chat-sheet${sidebarOpen ? ' open' : ''}`}>
        <div className="ff-chat-sheet-handle" />
        <div className="ff-chat-sheet-head">
          <span className="ff-chat-sheet-title">Your Chats</span>
          <button type="button" className="ff-chat-sheet-close" onClick={() => setSidebarOpen(false)}>
            <X size={14} />
          </button>
        </div>
        <button type="button" className="ff-chat-sheet-new" onClick={() => { startNewChat(); setSidebarOpen(false); }}>
          <Plus size={15} />
          Start a new chat
        </button>
        <div className="ff-chat-sheet-list">
          {sortedConvos.length === 0 ? (
            <div className="ff-chat-sheet-empty">
              <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
              No conversations yet.<br />Start chatting to save history.
            </div>
          ) : sortedConvos.map(c => (
            <button
              key={c.id}
              type="button"
              className={`ff-chat-sheet-item${c.id === activeId ? ' ff-chat-sheet-item-active' : ''}`}
              onClick={() => { setActiveId(c.id); setSidebarOpen(false); setError(''); }}
            >
              <div className="ff-chat-sheet-item-icon">
                <MessageSquare size={15} />
              </div>
              <div className="ff-chat-sheet-item-body">
                <div className="ff-chat-sheet-item-title">{getConvoTitle(c.messages)}</div>
                <div className="ff-chat-sheet-item-meta">{timeAgo(c.updatedAt)} · {Math.floor(c.messages.length / 2)} message{c.messages.length / 2 !== 1 ? 's' : ''}</div>
              </div>
              <button
                type="button"
                className="ff-chat-sheet-item-del"
                onClick={(e) => deleteConvo(c.id, e)}
                title="Delete"
              >
                <Trash2 size={13} />
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="ff-ask-layout">

        {/* Sidebar (desktop only) */}
        <div className="ff-chat-sidebar">
          <div className="ff-chat-sidebar-head">
            <span className="ff-chat-sidebar-title">Chats</span>
            <button className="ff-chat-new-btn" onClick={startNewChat} title="New chat" type="button">
              <Plus size={12} />
            </button>
          </div>
          <div className="ff-chat-sidebar-list">
            {sortedConvos.length === 0 ? (
              <div className="ff-chat-sidebar-empty">
                <div style={{ fontSize: 22, marginBottom: 6 }}>💬</div>
                No chats yet.<br />Start a conversation.
              </div>
            ) : sortedConvos.map(c => (
              <button
                key={c.id}
                type="button"
                className={`ff-chat-sidebar-item${c.id === activeId ? ' ff-chat-sidebar-item-active' : ''}`}
                onClick={() => { setActiveId(c.id); setSidebarOpen(false); setError(''); }}
              >
                <span className="ff-chat-sidebar-item-dot" />
                <span className="ff-chat-sidebar-item-title">{getConvoTitle(c.messages)}</span>
                <span className="ff-chat-sidebar-item-meta">{timeAgo(c.updatedAt)}</span>
                <button
                  type="button"
                  className="ff-chat-sidebar-item-del"
                  onClick={(e) => deleteConvo(c.id, e)}
                  title="Delete"
                >
                  <X size={10} />
                </button>
              </button>
            ))}
          </div>
        </div>

        {/* Chat pane */}
        <div className="ff-chat-pane">
          <div className="ff-chat-messages" ref={messagesContainerRef}>
            {isEmpty && !loading && (
              <div className="ff-chat-empty">
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-bg-soft) 0%, #e8f0fe 100%)',
                  border: '1px solid var(--accent-border-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
                }}>
                  <Bot size={19} style={{ color: 'var(--accent)' }} />
                </div>
                <p className="ff-display ff-text-1" style={{ fontSize: 18, letterSpacing: '-0.038em', marginBottom: 6, lineHeight: 1.2 }}>
                  What do you want to know?
                </p>
                <p className="ff-text-3" style={{ fontSize: 13, lineHeight: 1.55, maxWidth: '30ch', marginBottom: 20 }}>
                  Ask about rates, niches, client scripts, or upload a file.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 420 }}>
                  {SUGGESTED_PROMPTS.map((p, i) => (
                    <button key={i} type="button" className="ff-suggested-prompt" onClick={() => sendMessage(p.text)} style={{ animationDelay: `${i * 50}ms` }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`ff-chat-msg ${msg.role === 'user' ? 'ff-chat-msg-user' : ''}`}>
                <div className={`ff-chat-avatar ${msg.role === 'user' ? 'ff-chat-avatar-user' : 'ff-chat-avatar-ai'}`}>
                  {msg.role === 'user' ? 'You' : <Bot size={12} />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', minWidth: 0 }}>
                  {msg.attachment && msg.attachment.preview && (
                    <div className="ff-chat-user-attachment"><img src={msg.attachment.preview} alt={msg.attachment.name} /></div>
                  )}
                  {msg.attachment && !msg.attachment.preview && (
                    <div className="ff-chat-user-attachment-file"><FileText size={11} /> {msg.attachment.name}</div>
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
                <div className="ff-chat-avatar ff-chat-avatar-ai"><Bot size={12} /></div>
                <div className="ff-chat-bubble ff-chat-bubble-ai">
                  <div className="ff-chat-typing"><span /><span /><span /></div>
                </div>
              </div>
            )}

            {error && (
              <div className="ff-fadeup" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '8px 12px', borderRadius: 10, fontSize: 13, fontWeight: 500, textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="ff-chat-footer">
  

            <div className="ff-chat-input-box">
              {attachment && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px 0' }}>
                  {attachment.preview
                    ? <img src={attachment.preview} alt={attachment.name} style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 7, flexShrink: 0 }} />
                    : <div className="ff-chat-attachment-preview-icon"><FileText size={13} /></div>
                  }
                  <span className="ff-chat-attachment-name">{attachment.name}</span>
                  <button onClick={() => setAttachment(null)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 3, display: 'flex', alignItems: 'center', borderRadius: 4, flexShrink: 0 }}>
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
                  {loading ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={13} />}
                </button>
              </div>
            </div>
            <p className="ff-text-3" style={{ fontSize: 12, textAlign: 'center', marginTop: 5, letterSpacing: '-0.003em' }}>
              Enter to send · Chats saved 15 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* HEADSHOT AI TAB                                                         */
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
        max_tokens: 3000,
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

    // Strip all variations of markdown code fences anywhere in the text
    let text = rawText
      .replace(/\s*```(?:json)?\s*/gi, '')
      .replace(/\s*```\s*/g, '')
      .trim();

    // Attempt 1: direct parse
    try { return JSON.parse(text); } catch {}

    // Attempt 2: extract from first { to last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      try { return JSON.parse(candidate); } catch {}
      // Attempt 3: strip trailing commas and retry
      const cleaned = candidate.replace(/,(\s*[}\]])/g, '$1');
      try { return JSON.parse(cleaned); } catch {}
    }

    // Attempt 4: find JSON object with regex
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch {}
      const cleaned = jsonMatch[0].replace(/,(\s*[}\]])/g, '$1');
      try { return JSON.parse(cleaned); } catch {}
    }

    const preview = rawText.slice(0, 150).replace(/\s+/g, ' ');
    throw new Error(`Could not parse response. Preview: "${preview}..."`);
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

    const prompt = `You are a conversion strategist who has audited thousands of freelancer pages and worked with clients who hire them. You see both sides. You know exactly what makes a client click away and what makes them reach out. You tell the truth bluntly, because sugar-coating costs the freelancer money.

You audit ONLY what is in front of you. Never invent content. If something is absent, name it as absent — that absence is often the biggest problem.

${pageType === 'cv' && imageData
  ? (imageData.isPdf
    ? 'ATTACHED: The CV as a PDF. Read every line. Pull exact phrases, company names, dates, metrics, and tools before writing a single word.\n'
    : 'ATTACHED: The CV as an image. Read every visible detail carefully.\n')
  : (imageData && method === 'image' ? 'ATTACHED: A screenshot of the page. Read every visible element — headline, body, CTAs, social proof, everything — before writing.\n' : '')}

PAGE TYPE: ${pt.label}
WHAT BUYERS OF THIS TYPE ACTUALLY CARE ABOUT: ${pt.desc}

SCORING (1-10 each):
${criteriaList}

HOW A REAL CLIENT READS THIS PAGE:
A buyer lands here with a specific problem and a limited attention span. They're asking:
1. Do they understand my specific situation? (or are they speaking generically?)
2. Have they done this before for someone like me? (proof, not claims)
3. Can I trust them not to waste my time and money? (credibility signals)
4. What happens if I reach out? (clear next step)
Score and evaluate every criterion through this lens — not through the lens of what looks professional.

${buildPageInputBlock()}

VERDICT: Lead with the most damaging problem — the one costing them clients right now. Quote the actual copy. Say exactly what a real buyer would feel when they read it. End with the single highest-leverage fix.

RECOMMENDATIONS: Each one names the exact line, section, or element. Each fix is the actual thing to do — not "consider adding" but "replace X with Y."

REWRITES: Before = verbatim from the page. After = finished, ready-to-use copy that a real client would respond to.

Generate ONLY valid JSON:
{
  "overall": {
    "score": 0-100,
    "headline": "5-8 words. A definitive verdict that names the core problem. Not a description. e.g. 'Credentials everywhere. Client problem nowhere.' or 'Sounds like every other freelancer in this niche.'",
    "verdict": "4-6 sentences. Start with what a real buyer would feel reading this. Quote the most damaging phrase. Explain why it costs them clients. Name what works. Name what doesn't. End with the one change that would most immediately improve conversion. No em dashes. No hedging."
  },
  "scores": [
    { "criterion": "exact label from above", "score": 1-10, "note": "One sentence. Name a specific phrase or element — not a general area." }
  ],
  "recommendations": [
    { "priority": "High|Medium|Low", "issue": "The exact problem, named precisely. Where it is. What it costs. 2 sentences.", "fix": "The specific action. Not 'consider' — the actual copy or change. 1-2 sentences." }
  ],
  "rewrites": [
    { "section": "Element name", "before": "Exact copy from the page", "after": "Finished replacement. Problem-aware. Specific. Ready to paste. No em dashes." }
  ]
}

3-4 recommendations, 2-3 rewrites. Score every criterion. Be specific, be direct, be useful.
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

    const prompt = `You are a direct-response copywriter who wins clients for freelancers by making buyers feel understood, not impressed. You know that a buyer skimming a freelancer's page is asking one thing: "Does this person get what I'm dealing with?" Your rewrites answer that question in the first three sentences.

PAGE TYPE: ${pt.label}

${TOP_PERFORMER_PATTERNS[pageType]}

KEYWORD STRATEGY:
${platformKeywordGuidance[pageType]}

AUDIT FINDINGS TO FIX:
- Verdict: ${result.overall?.headline || 'Underperforming'}
- Problems: ${(result.recommendations || []).map(r => r.issue).join(' | ')}
- Score: ${result.overall?.score || 0}/100

ORIGINAL PAGE:
${buildPageInputBlock()}

REWRITE RULES:
1. Pull 6-10 keywords buyers actually search when they have this problem. Place them naturally — not stuffed.

2. Write the full page as one ready-to-paste block. ALL CAPS section headers, two line breaks, then the section. Sections:
${sectionsList}

3. Every section must answer one of these buyer questions:
   - "Do they understand my specific situation?" (opening, headline, about)
   - "Have they actually done this for someone like me?" (proof, portfolio, results)
   - "Why them and not the next person in the list?" (differentiator, approach)
   - "What happens if I message them right now?" (CTA)
   If a section doesn't answer one of these, it gets cut or rewritten.

4. Voice: if the original has a personality, keep it and sharpen it. If it's generic, write as someone who has been in the trenches of this specific work — not a professional, a practitioner. Someone who knows what goes wrong and why.

5. Replace every vague sentence with a specific one. "I help businesses grow" becomes "Helped a bootstrapped SaaS go from 400 to 2,200 monthly active users in 5 months by rewriting their trial-to-paid onboarding."

6. CTA: makes reaching out feel like the obvious next move. Not "contact me" — something like "Send me the brief. I'll tell you in a few hours if it's a fit and how I'd approach it."

Generate ONLY valid JSON:
{
  "summary": {
    "headline": "5-8 words. The core repositioning — what fundamentally changed.",
    "shift": "2 sentences. What problem-aware angle was taken and why it works for this buyer.",
    "patterns_applied": ["specific pattern 1", "specific pattern 2", "specific pattern 3"],
    "niche": "The specific niche identified",
    "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5", "kw6"]
  },
  "fullRewrite": "Complete rewritten page, under 500 words. ALL CAPS section headers, two newlines then content. Every section listed must appear. No placeholders. Written as the freelancer. Sounds like a real person who knows this work inside out. No em dashes anywhere."
}

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
            <p className="ff-mono mb-2" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
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
              {s.note && <p className="ff-text-3" style={{ fontSize: 13, marginTop: -2, marginBottom: 6 }}>{s.note}</p>}
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
              <p className="ff-mono mb-3" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
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


  const handleGenerate = async () => {
    if (mode === 'reply' && !clientMessage.trim() && !imageData) { setError("Paste the client's message so we know what to reply to."); return; }
    if (mode === 'followup' && !clientMessage.trim() && !myMessage.trim() && !imageData) { setError("Paste either the client's message or your last reply."); return; }
    if (mode === 'coverletter' && !jobDescription.trim() && !intel.trim() && !cvFile) {
      setError('Paste the job description or upload your CV.');
      return;
    }
    if (mode !== 'followup' && mode !== 'coverletter' && mode !== 'reply' && !intel.trim() && !imageData) { setError('Add intel.'); return; }
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
      content.push({ type: 'text', text: buildPrompt(mode, intel, imageData, tone, portfolio, clientMessage, myMessage, goal, jobDescription, offer, proof, cvFile) });

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 3000,
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
      const attemptText = rawText.replace(/\s*```(?:json)?\s*/gi, '').replace(/\s*```\s*/g, '').trim();

      const tryParse = (str) => {
        try { return JSON.parse(str); } catch {}
        const clean = str.replace(/,(\s*[}\]])/g, '$1');
        try { return JSON.parse(clean); } catch {}
        return null;
      };

      parsed = tryParse(attemptText);
      if (!parsed) {
        const fb = attemptText.indexOf('{'), lb = attemptText.lastIndexOf('}');
        if (fb !== -1 && lb > fb) parsed = tryParse(attemptText.substring(fb, lb + 1));
      }
      if (!parsed) {
        const m = attemptText.match(/\{[\s\S]*\}/);
        if (m) parsed = tryParse(m[0]);
      }
      if (!parsed) throw new Error(`Could not parse response. Preview: "${rawText.slice(0, 150)}..."`);

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
            {mode === 'reply' ? (
              <>
                <div>
                  <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Client's message <span className="ff-text-accent" style={{ marginLeft: 4 }}>*</span>
                    <Tooltip text="Paste what the client sent. The more context you give, the more precisely the reply can address what they actually need." />
                  </label>
                  <textarea
                    className="ff-textarea"
                    rows={5}
                    placeholder="Paste what the client said..."
                    value={clientMessage}
                    onChange={e => setClientMessage(e.target.value)}
                  />
                  <p className="ff-field-hint mt-2">Used to understand their tone, intent, and what they're really asking.</p>
                </div>

                <div>
                  <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Your draft reply
                    <span className="ff-field-hint" style={{ fontWeight: 400, marginLeft: 6 }}>· optional but recommended</span>
                    <Tooltip text="Paste what you were going to send. Leave blank and we'll write a reply from scratch based on the client's message." />
                  </label>
                  <textarea
                    className="ff-textarea"
                    rows={5}
                    placeholder="Paste your draft — we'll sharpen it. Or leave blank and we'll write one from scratch."
                    value={myMessage}
                    onChange={e => setMyMessage(e.target.value)}
                  />
                </div>

                <div>
                  <label className="ff-field-label" style={{ display: 'inline-flex', alignItems: 'center' }}>
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
                    Goal for this reply
                    <span className="ff-field-hint" style={{ fontWeight: 400, marginLeft: 6 }}>· optional</span>
                    <Tooltip text="What do you want to happen after they read this? Move to a call, confirm a detail, set a boundary, close the project. Shapes the ending of the reply." />
                  </label>
                  <textarea className="ff-textarea" rows={2} placeholder='e.g. "Get sign-off on the brief" or "Address scope concerns without losing the deal"' value={goal} onChange={e => setGoal(e.target.value)} />
                </div>
              </>
            ) : mode === 'followup' ? (
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
          {result && resultMode === 'proposal' && <ProposalOutput result={result} pillClass={pillClass} copied={copied} copyText={copyText} selectAllText={selectAllText} />}
          {result && resultMode === 'dm' && <DMOutput result={result} copied={copied} copyText={copyText} selectAllText={selectAllText} />}
          {result && resultMode === 'email' && <EmailOutput result={result} copied={copied} copyText={copyText} selectAllText={selectAllText} />}
          {result && resultMode === 'reply' && <ReplyOutput result={result} copied={copied} copyText={copyText} selectAllText={selectAllText} />}
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
          <h2 className="ff-display ff-text-1" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.038em' }}>
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
          <p className="ff-display ff-text-1 mb-3" style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 500, letterSpacing: '-0.038em' }}>
            Nothing logged yet.
          </p>
          <p className="ff-text-3" style={{ fontSize: 13, lineHeight: 1.55 }}>
            Add an entry every time you send a proposal, DM, or email.<br/>
            Track replies and close rates over time.
          </p>
          <p className="ff-text-3 mt-4" style={{ fontSize: 12, lineHeight: 1.5, fontStyle: 'italic' }}>
            Saved in your browser for 15 days. No account needed.
          </p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="ff-card" style={{ padding: 0 }}>
          <div className="ff-pipeline-table-header">
            <span className="ff-section-label" style={{ fontSize: 12 }}>Date</span>
            <span className="ff-section-label" style={{ fontSize: 12 }}>Client</span>
            <span className="ff-section-label ff-pipeline-col-type" style={{ fontSize: 12 }}>Type</span>
            <span className="ff-section-label" style={{ fontSize: 12 }}>Status</span>
            <span className="ff-section-label ff-pipeline-col-value" style={{ fontSize: 12 }}>Value</span>
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
      <p className="ff-section-label mb-2" style={{ fontSize: 12 }}>{label}</p>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28,
        lineHeight: 1.1,
        fontWeight: 500,
        letterSpacing: '-0.038em',
        color: accent ? 'var(--accent)' : 'var(--text-1)',
        fontFeatureSettings: "'tnum'",
      }}>
        {value}
      </p>
      {sub && <p className="ff-text-3 mt-1" style={{ fontSize: 13 }}>{sub}</p>}
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, letterSpacing: '-0.038em', color: 'var(--text-1)', margin: 0 }}>
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
                    fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-text)',
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
              <span className="ff-section-label" style={{ fontSize: 12 }}>Breakdown</span>
              <span style={{ fontSize: 13, color: 'var(--text-3)', fontFeatureSettings: "'tnum'" }}>{data.sent} {data.sent === 1 ? 'entry' : 'entries'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {chartBars.map((bar, i) => {
                const widthPct = data.sent > 0 ? (bar.value / maxBarValue) * 100 : 0;
                return (
                  <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 72, fontSize: 13, color: 'var(--text-2)', fontWeight: 500, flexShrink: 0 }}>{bar.label}</div>
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
      <p className="ff-section-label" style={{ fontSize: 12, marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, letterSpacing: '-0.038em', color: accent ? 'var(--accent)' : (muted ? 'var(--text-2)' : 'var(--text-1)'), margin: 0, lineHeight: 1.1 }}>
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
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{daysAgoLabel(entry.date)}</span>
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
            fontSize: 12, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase',
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

/* ── Psychology card ──────────────────────────────────────────────────── */
function PsychCard({ psych, delay = 0 }) {
  if (!psych) return null;
  const score = Math.min(100, Math.max(0, Number(psych.confidenceScore) || 0));
  const scoreColor  = score >= 75 ? 'var(--success)'  : score >= 50 ? 'var(--warning)'  : 'var(--danger)';
  const scoreBg     = score >= 75 ? 'var(--success-bg)': score >= 50 ? 'var(--warning-bg)': 'var(--danger-bg)';
  const scoreBorder = score >= 75 ? 'rgba(74,222,128,0.25)' : score >= 50 ? 'rgba(251,191,36,0.25)' : 'rgba(248,113,113,0.25)';
  const scoreLabel  = score >= 75 ? 'Strong'  : score >= 50 ? 'Moderate' : 'Low';
  const scoreBarColor = score >= 75 ? '#4ade80' : score >= 50 ? '#fbbf24' : '#f87171';

  return (
    <div className="ff-fadeup ff-card" style={{
      animationDelay: `${delay}ms`,
      padding: 0,
      overflow: 'hidden',
      border: '1px solid var(--border)',
      background: 'var(--bg)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>

      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 9,
            background: 'var(--accent-bg-soft)', border: '1px solid var(--accent-border-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={14} style={{ color: 'var(--accent)' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.01em', fontFamily: 'var(--font-text)' }}>
            Client psychology
          </span>
        </div>

        {/* Score badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-text)', letterSpacing: '-0.003em' }}>
            Proposal confidence
          </span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: scoreBg,
            border: `1px solid ${scoreBorder}`,
            borderRadius: 20, padding: '5px 12px',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: scoreBarColor, flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 800, color: scoreColor, fontFamily: 'var(--font-text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: scoreColor, fontFamily: 'var(--font-text)', opacity: 0.85 }}>
              {scoreLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'var(--bg-elev-2)', position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${score}%`,
          background: `linear-gradient(90deg, ${scoreBarColor}99 0%, ${scoreBarColor} 100%)`,
          transition: 'width 800ms cubic-bezier(0.16,1,0.3,1)',
          borderRadius: '0 2px 2px 0',
        }} />
      </div>

      {/* Two cells */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Buyer type */}
        <div style={{
          padding: '16px 20px',
          borderRight: '1px solid var(--border)',
          borderBottom: psych.confidenceRationale ? '1px solid var(--border)' : 'none',
        }}>
          <p style={{
            fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: 'var(--font-text)', marginBottom: 7,
          }}>
            Detected buyer type
          </p>
          <p style={{
            fontSize: 13.5, fontWeight: 600, color: 'var(--text-1)',
            lineHeight: 1.45, letterSpacing: '-0.008em', fontFamily: 'var(--font-text)',
            margin: 0,
          }}>
            {psych.buyerType || '—'}
          </p>
        </div>

        {/* Budget range */}
        <div style={{
          padding: '16px 20px',
          borderBottom: psych.confidenceRationale ? '1px solid var(--border)' : 'none',
        }}>
          <p style={{
            fontSize: 10.5, fontWeight: 700, color: 'var(--text-3)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontFamily: 'var(--font-text)', marginBottom: 7,
          }}>
            Likely budget range
          </p>
          <p style={{
            fontSize: 13.5, fontWeight: 600, color: 'var(--accent)',
            lineHeight: 1.45, letterSpacing: '-0.008em', fontFamily: 'var(--font-text)',
            margin: 0,
          }}>
            {psych.budgetRange || '—'}
          </p>
        </div>
      </div>

      {/* Rationale */}
      {psych.confidenceRationale && (
        <div style={{
          padding: '14px 20px',
          background: 'var(--bg-elev-1)',
        }}>
          <p style={{
            fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6,
            fontFamily: 'var(--font-text)', margin: 0,
            letterSpacing: '-0.005em',
          }}>
            <strong style={{ color: 'var(--text-1)', fontWeight: 600 }}>Why: </strong>
            {psych.confidenceRationale}
          </p>
        </div>
      )}
    </div>
  );
}

function ProposalOutput({ result, pillClass, copied, copyText, selectAllText }) {
  const proposal = result.proposal;
  const isStructured = proposal && typeof proposal === 'object';

  const proposalText = (() => {
    if (!proposal) return '';
    if (typeof proposal === 'string') return proposal;
    const parts = [];
    if (proposal.hook) parts.push(proposal.hook);
    if (proposal.proof) parts.push(proposal.proof);
    if (proposal.whyMe) parts.push(proposal.whyMe);
    if (proposal.process) parts.push(Array.isArray(proposal.process) ? proposal.process.join(' ') : proposal.process);
    if (proposal.cta) parts.push(proposal.cta);
    return parts.join('\n\n');
  })();

  const sectionStyle = { padding: '20px 22px', borderBottom: '1px solid var(--border)' };
  const labelStyle = { display: 'block', marginBottom: 10 };
  const paraStyle = { fontSize: 15, lineHeight: 1.72, color: 'var(--text-1)', letterSpacing: '-0.007em', margin: 0, whiteSpace: 'pre-line' };

  return (
    <div className="space-y-5">

      <div className="ff-fadeup ff-card">
        <h3 className="ff-subheading mb-4">Client diagnosis</h3>
        <div className="ff-detail-grid">
          <Cell label="Who they are" value={result.extraction?.clientType} />
          <Cell label="What they need" value={result.extraction?.projectType} accent />
          <Cell label="Urgency"><span className={pillClass(result.extraction?.urgency)}>{result.extraction?.urgency}</span></Cell>
          <Cell label="Budget signal"><span className={pillClass(result.extraction?.budgetSignal)}>{result.extraction?.budgetSignal}</span></Cell>
          <Cell label="The real problem" value={result.extraction?.coreProblem} wide />
          <Cell label="What they are really evaluating" value={result.extraction?.whatTheyAreActuallyEvaluating || result.extraction?.hiddenIntent} wide />
        </div>
      </div>

      <PsychCard psych={result.clientPsychology} delay={30} />

      {proposal && (
        <div className="ff-fadeup" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="ff-subheading">Your proposal</h3>
            <button className="ff-icon-btn" onClick={() => copyText('proposal', proposalText)}>
              {copied.proposal ? <Check size={12} /> : <Copy size={12} />}
              {copied.proposal ? 'Copied' : 'Copy all'}
            </button>
          </div>

          {isStructured ? (
            <div className="ff-card" style={{ padding: 0, overflow: 'hidden' }}>
              {proposal.hook && (
                <div style={{ ...sectionStyle, background: 'var(--bg)' }}>
                  <span className="ff-section-label" style={{ ...labelStyle, color: 'var(--accent)' }}>Opening</span>
                  <p style={{ ...paraStyle, fontWeight: 500, fontSize: 15.5 }}>{proposal.hook}</p>
                </div>
              )}
              {proposal.proof && (
                <div style={sectionStyle}>
                  <span className="ff-section-label" style={labelStyle}>Why I can solve this</span>
                  <p style={paraStyle}>{proposal.proof}</p>
                </div>
              )}
              {proposal.whyMe && (
                <div style={sectionStyle}>
                  <span className="ff-section-label" style={labelStyle}>Why me specifically</span>
                  <p style={paraStyle}>{proposal.whyMe}</p>
                </div>
              )}
              {proposal.process && (
                <div style={sectionStyle}>
                  <span className="ff-section-label" style={labelStyle}>How we work together</span>
                  <p style={paraStyle}>{Array.isArray(proposal.process) ? proposal.process.join(' ') : proposal.process}</p>
                </div>
              )}
              {proposal.cta && (
                <div style={{ padding: '18px 22px', background: 'var(--accent-bg-soft)', borderTop: '1px solid var(--accent-border-soft)' }}>
                  <span className="ff-section-label" style={{ ...labelStyle, color: 'var(--accent)' }}>The ask</span>
                  <p style={{ ...paraStyle, fontWeight: 600 }}>{proposal.cta}</p>
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
      <PsychCard psych={result.clientPsychology} delay={90} />
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
      <PsychCard psych={result.clientPsychology} delay={150} />
    </div>
  );
}

function ReplyOutput({ result, copied, copyText, selectAllText }) {
  return (
    <div className="space-y-5">
      {/* Client read */}
      {result.clientRead && (
        <div className="ff-fadeup ff-card">
          <p className="ff-section-label mb-2">What they're really saying</p>
          <p style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.6, letterSpacing: '-0.005em' }}>{result.clientRead}</p>
        </div>
      )}

      {/* Issues found */}
      {result.issues?.length > 0 && (
        <div className="ff-fadeup ff-card" style={{ animationDelay: '30ms' }}>
          <p className="ff-section-label mb-3">What was weak in the draft</p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {result.issues.filter(Boolean).map((issue, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--danger)' }}>{i + 1}</span>
                </span>
                <span style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-2)', letterSpacing: '-0.005em' }}>{issue}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Polished reply */}
      {result.polishedReply && (
        <div className="ff-fadeup" style={{ animationDelay: '60ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h3 className="ff-subheading">Polished reply</h3>
            <button className="ff-icon-btn" onClick={() => copyText('reply', result.polishedReply)}>
              {copied.reply ? <Check size={12} /> : <Copy size={12} />}
              {copied.reply ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="ff-card" style={{ borderLeft: '3px solid var(--accent)' }}>
            <p className="ff-output-text" onClick={selectAllText} style={{ cursor: 'text', fontSize: 15, lineHeight: 1.7, letterSpacing: '-0.005em' }}>
              {result.polishedReply}
            </p>
          </div>
        </div>
      )}

      {/* What changed */}
      {result.whatChanged && (
        <div className="ff-fadeup ff-card" style={{ animationDelay: '90ms', background: 'var(--accent-bg-soft)', border: '1px solid var(--accent-border-soft)' }}>
          <p className="ff-section-label mb-2" style={{ color: 'var(--accent)' }}>What changed and why</p>
          <p style={{ fontSize: 13.5, color: 'var(--text-1)', lineHeight: 1.6, letterSpacing: '-0.005em' }}>{result.whatChanged}</p>
        </div>
      )}

      <PsychCard psych={result.clientPsychology} delay={120} />
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
      <PsychCard psych={result.clientPsychology} delay={90} />
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
      <PsychCard psych={result.clientPsychology} delay={150} />
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
      <div className="ff-section-label mb-1.5" style={{ fontSize: 12 }}>{label}</div>
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
      <div className="ff-mono ff-pulse mb-4" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Awaiting Page
      </div>
      <p className="ff-display ff-text-1 mb-4" style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 500, letterSpacing: '-0.038em' }}>
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
        <span className="ff-mono" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
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
      <div className="ff-mono ff-pulse mb-4" style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        {kicker}
      </div>
      <p className="ff-display ff-text-1" style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 500, letterSpacing: '-0.038em', whiteSpace: 'pre-line' }}>
        {messages[mode]}
      </p>
    </div>
  );
}
