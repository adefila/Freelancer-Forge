import { useState, useRef, useEffect } from 'react';
import {
  ArrowRight, Copy, Check, Loader2, Sparkles, Paperclip, X, ImageIcon,
  Sun, Moon, Plus, ExternalLink, Link as LinkIcon, ChevronDown,
  Mail, MessageSquare, FileText, Reply, Globe, Type, Image as ImgIcon,
  Target, Award, Briefcase, User, Layers, Wand2
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
};

const CLOSER_MODES = {
  proposal: { label: 'Proposal', icon: FileText, desc: 'Full proposal, DM, and matched attachments', cta: 'Generate Proposal' },
  dm: { label: 'Cold DM', icon: MessageSquare, desc: 'Short, pattern-breaking direct message', cta: 'Generate DM' },
  email: { label: 'Cold Email', icon: Mail, desc: 'Subject line and email body', cta: 'Generate Email' },
  followup: { label: 'Follow-up', icon: Reply, desc: 'Reply or re-engage based on a conversation', cta: 'Draft Follow-up' },
};

const TONE_OPTIONS = [
  { id: 'Auto', desc: 'Adapts to the audience' },
  { id: 'Direct', desc: 'No fluff. Punchy.' },
  { id: 'Warm', desc: 'Friendly, human' },
  { id: 'Sharp', desc: 'Confident, assertive' },
  { id: 'Persuasive', desc: 'Active selling, builds desire' },
  { id: 'Casual', desc: 'Founder-to-founder' },
];

const TONE_DIRECTIVES = {
  Auto: '',
  Direct: "Write in a DIRECT voice: no fluff, short sentences, get to the point fast.",
  Warm: "Write in a WARM voice: friendly and conversational, with human warmth.",
  Sharp: "Write in a SHARP voice: confident, slightly assertive, results-focused.",
  Persuasive: "Write in a PERSUASIVE voice: actively selling without sounding salesy.",
  Casual: "Write in a CASUAL voice: relaxed and conversational.",
};

const STRICT_RULES = `
=== STRICT WRITING RULES ===
1. EM DASHES ARE FORBIDDEN. Use periods, commas, parentheses, or colons.
2. GRAMMAR MUST BE IMPECCABLE. Vary sentence openers.
3. NO GENERIC AI / CORPORATE WORDS. Forbidden: leverage, utilize, synergy, streamline, cutting-edge, innovative, world-class, best-in-class, top-notch, game-changer, unlock, empower, optimize, maximize, robust, seamless, transform, revolutionize, supercharge, level up, holistic, ecosystem, paradigm, scalable, dynamic, results-driven, deep dive, foster, cultivate, harness, elevate, dive into, embark on.
4. NO GENERIC OPENERS. No "I hope this finds you well", "I came across your post", "passionate about".
5. PREFER SPECIFIC OVER ABSTRACT. Numbers, named outcomes, concrete time frames.
`;

const stripEmDashes = (s) => {
  if (typeof s !== 'string') return s;
  return s.replace(/\s*—\s*/g, ', ').replace(/\s*–\s*/g, ', ')
    .replace(/,\s*,/g, ',').replace(/,\s*\./g, '.');
};

/* ====================================================================== */
/* DESIGN SYSTEM — Apple-inspired, blue primary                            */
/* ====================================================================== */

const CSS = `
@import url('https://rsms.me/inter/inter.css');

.ff-root {
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif;
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

.ff-display { font-family: var(--font-display); letter-spacing: -0.022em; font-weight: 600; }
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
}
.ff-input { font-size: 14px; padding: 10px 12px; }
.ff-textarea { font-size: 15px; line-height: 1.5; padding: 12px 14px; resize: vertical; }
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

/* COLORED SEGMENTED CONTROL (filled saturated blue active, fully rounded) */
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

/* SLEEK FILLED PILL TABS */
.ff-tabs {
  display: inline-flex;
  gap: 6px;
  padding: 5px;
  background-color: var(--bg-elev-1);
  border: 1px solid var(--border);
  border-radius: var(--r-pill);
}
.ff-tab {
  background: transparent;
  border: none;
  color: var(--text-2);
  font-family: var(--font-text);
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: -0.005em;
  padding: 9px 18px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: color var(--t-fast), background-color var(--t-med);
  border-radius: var(--r-pill);
  position: relative;
  z-index: 1;
}
.ff-tab:hover:not(.ff-tab-active) {
  color: var(--text-1);
  background-color: var(--bg-elev-2);
}
.ff-tab-active {
  background-color: var(--accent-vivid);
  color: var(--accent-text-on);
  font-weight: 600;
  box-shadow: var(--sh-blue);
}
.ff-tab-active:hover { background-color: var(--accent-vivid-hover); color: var(--accent-text-on); }
.ff-tab-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--r-pill);
  background-color: rgba(255, 255, 255, 0.22);
  color: inherit;
  letter-spacing: 0.04em;
  margin-left: 2px;
}
.ff-tab:not(.ff-tab-active) .ff-tab-badge {
  background-color: var(--accent-bg-soft);
  color: var(--accent);
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
  background: linear-gradient(135deg, var(--accent-bg-soft) 0%, var(--bg-elev-1) 70%);
  border: 1px solid var(--accent-border-soft);
  padding: 24px;
  border-radius: var(--r-lg);
}
.ff-optimize-headline {
  font-family: var(--font-display);
  font-size: 22px;
  line-height: 1.25;
  font-weight: 600;
  letter-spacing: -0.022em;
  color: var(--text-1);
  margin-bottom: 6px;
}
.ff-optimize-sub {
  font-size: 14px;
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
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.022em;
  color: var(--text-1);
}

.ff-pulse { animation: ff-pulse 1.6s ease-in-out infinite; }
@keyframes ff-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
.ff-fadeup { animation: ff-fadeup 480ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
@keyframes ff-fadeup {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
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

`;

/* ====================================================================== */
/* APP                                                                    */
/* ====================================================================== */

export default function FreelancersForge() {
  const [theme, setTheme] = useState('light');
  const [tab, setTab] = useState('optimize');

  return (
    <div className={`ff-root ${theme}`}>
      <style>{CSS}</style>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 md:py-12">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-12 gap-4">
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
        <div className="mb-12 md:mb-16" style={{ maxWidth: '900px' }}>
          <h1
            className="ff-display ff-text-1 mb-5"
            style={{
              fontSize: 'clamp(36px, 5vw, 64px)',
              lineHeight: 1.08,
              fontWeight: 600,
              letterSpacing: '-0.028em',
            }}
          >
            Audit any page. Rewrite it like{' '}
            <span style={{ color: 'var(--accent)' }}>the top one percent.</span>
          </h1>
          <p
            className="ff-text-2"
            style={{
              fontSize: 'clamp(15px, 1.3vw, 18px)',
              lineHeight: 1.55,
              letterSpacing: '-0.01em',
              maxWidth: '52ch',
            }}
          >
            Score against expert criteria, then one-click rewrite using the patterns of top performers.
          </p>
        </div>

        {/* PILL TABS */}
        <div className="mb-10 overflow-x-auto" style={{ paddingBottom: 4 }}>
          <div className="ff-tabs">
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
          </div>
        </div>

        {tab === 'optimize' && <OptimizeTab />}
        {tab === 'close' && <CloseTab />}

        {/* FOOTER */}
        <div className="mt-24 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <p className="ff-meta-text">Sharper pages, better clients.</p>
            <p className="ff-meta-text">Powered by Claude</p>
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
  const [url, setUrl] = useState('');
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

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError("That doesn't look like an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const r = e.target.result;
      setImageData({
        data: r.split(',')[1], mediaType: file.type, name: file.name,
        sizeKb: Math.round(file.size / 1024), preview: r,
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const buildPageInputBlock = () => {
    if (method === 'url') return `URL: ${url.trim()}\n(The user gave only a URL.)`;
    if (method === 'paste') return `PAGE COPY:\n"""\n${pasteText.trim()}\n"""`;
    return '[See attached image.]';
  };

  const callClaude = async (prompt, includeImage) => {
    const content = [];
    if (includeImage && imageData) {
      content.push({ type: 'image', source: { type: 'base64', media_type: imageData.mediaType, data: imageData.data } });
    }
    content.push({ type: 'text', text: prompt });
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content }]
      })
    });
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  };

  const handleAudit = async () => {
    if (method === 'url' && !url.trim()) { setError('Paste a URL.'); return; }
    if (method === 'paste' && !pasteText.trim()) { setError('Paste the page copy.'); return; }
    if (method === 'image' && !imageData) { setError('Upload a screenshot.'); return; }
    setError(''); setAuditing(true); setResult(null); setOptimized(null);

    const pt = PAGE_TYPES[pageType];
    const criteriaList = pt.criteria.map((c, i) => `${i + 1}. ${c}`).join('\n');

    const prompt = `You are an elite conversion strategist auditing a freelancer page.
${imageData && method === 'image' ? 'NOTE: Image attached. Read every detail.\n' : ''}
PAGE TYPE: ${pt.label}
PAGE TYPE DESCRIPTION: ${pt.desc}

AUDIT CRITERIA (score each 1-10):
${criteriaList}

${audience.trim() ? `TARGET AUDIENCE: ${audience.trim()}\n` : ''}${goal.trim() ? `GOAL: ${goal.trim()}\n` : ''}
${buildPageInputBlock()}

Generate ONLY a JSON object:
{
  "overall": { "score": 0-100, "verdict": "3-5 sentences brutally honest", "headline": "5-8 word verdict" },
  "scores": [{ "criterion": "label", "score": 1-10, "note": "one short sentence" }],
  "recommendations": [{ "priority": "High|Medium|Low", "issue": "1-2 sentences", "fix": "tactical, 1-2 sentences" }],
  "rewrites": [{ "section": "name", "before": "current", "after": "rewritten" }]
}

RULES: Score every criterion. 4-7 recommendations, 3-5 rewrites. Be specific.
${STRICT_RULES}
Return ONLY JSON. No em dashes.`;

    try {
      const parsed = await callClaude(prompt, method === 'image');
      if (parsed.overall) {
        parsed.overall.verdict = stripEmDashes(parsed.overall.verdict);
        parsed.overall.headline = stripEmDashes(parsed.overall.headline);
      }
      if (Array.isArray(parsed.scores)) parsed.scores = parsed.scores.map(s => ({ ...s, note: stripEmDashes(s.note) }));
      if (Array.isArray(parsed.recommendations)) parsed.recommendations = parsed.recommendations.map(r => ({ ...r, issue: stripEmDashes(r.issue), fix: stripEmDashes(r.fix) }));
      if (Array.isArray(parsed.rewrites)) parsed.rewrites = parsed.rewrites.map(r => ({ ...r, before: stripEmDashes(r.before), after: stripEmDashes(r.after) }));
      setResult(parsed);
    } catch (err) {
      setError('Audit failed. Try again.');
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
      linkedin: "Weave keywords into the headline, the About section first 3 lines, and across experience entries."
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
4. Voice: human, specific, direct. No corporate buzzwords. No em dashes.

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
Return ONLY JSON. No em dashes.`;

    try {
      const parsed = await callClaude(prompt, method === 'image');
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
      setError('Optimization failed.');
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
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div>
          <label className="ff-section-label block mb-3">Page Type</label>
          <PageTypeDropdown value={pageType} onChange={setPageType} />
          <p className="ff-field-hint mt-2">{PAGE_TYPES[pageType].desc}</p>
        </div>
        <div>
          <label className="ff-section-label block mb-3">Submission Method</label>
          <div className="ff-segment ff-segment-color">
            <button type="button" className={`ff-segment-item ${method === 'url' ? 'ff-segment-item-active' : ''}`} onClick={() => setMethod('url')}>
              <Globe size={11} style={{ display: 'inline', marginRight: 4, marginBottom: 1 }} /> URL
            </button>
            <button type="button" className={`ff-segment-item ${method === 'paste' ? 'ff-segment-item-active' : ''}`} onClick={() => setMethod('paste')}>
              <Type size={11} style={{ display: 'inline', marginRight: 4, marginBottom: 1 }} /> Paste Copy
            </button>
            <button type="button" className={`ff-segment-item ${method === 'image' ? 'ff-segment-item-active' : ''}`} onClick={() => setMethod('image')}>
              <ImgIcon size={11} style={{ display: 'inline', marginRight: 4, marginBottom: 1 }} /> Screenshot
            </button>
          </div>
          <p className="ff-field-hint mt-2">
            {method === 'url' ? 'Quick audit from URL alone' : method === 'paste' ? 'Best results: paste the visible copy' : 'Visual + copy audit from a screenshot'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 md:gap-14">
        <div>
          <h2 className="ff-section-label mb-5">The Page</h2>

          <div className="space-y-5">
            {method === 'url' && (
              <div>
                <label className="ff-field-label">URL <span className="ff-text-accent">*</span></label>
                <input type="url" className="ff-input" placeholder="https://yoursite.com/about" value={url} onChange={e => setUrl(e.target.value)} />
                <p className="ff-field-hint mt-2">For deeper audits, paste copy or upload a screenshot.</p>
              </div>
            )}

            {method === 'paste' && (
              <div>
                <label className="ff-field-label">Page Copy <span className="ff-text-accent">*</span></label>
                <textarea className="ff-textarea" rows={12} placeholder="Paste headline, subheadline, About section, CTAs, testimonials..." value={pasteText} onChange={e => setPasteText(e.target.value)} />
              </div>
            )}

            {method === 'image' && (
              <div>
                <label className="ff-field-label">Screenshot <span className="ff-text-accent">*</span></label>
                {!imageData && (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { handleFileSelect(e.target.files?.[0]); e.target.value = ''; }} style={{ display: 'none' }} />
                    <button type="button" className="ff-attach-btn" style={{ padding: '36px 16px' }} onClick={() => fileInputRef.current?.click()}>
                      <Paperclip size={14} />
                      Click to upload a screenshot
                    </button>
                  </>
                )}
                {imageData && (
                  <div className="ff-image-card ff-fadeup">
                    <img src={imageData.preview} alt="" className="ff-image-thumb" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate" style={{ fontSize: 13, color: 'var(--text-1)' }}>{imageData.name}</div>
                      <div className="flex items-center gap-2 mt-1" style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        <ImageIcon size={11} />
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

            <div>
              <label className="ff-field-label">Audience <span className="ff-field-hint" style={{ fontWeight: 400 }}>· optional</span></label>
              <input type="text" className="ff-input" placeholder="e.g. Series A SaaS founders" value={audience} onChange={e => setAudience(e.target.value)} />
            </div>

            <div>
              <label className="ff-field-label">Goal of the page <span className="ff-field-hint" style={{ fontWeight: 400 }}>· optional</span></label>
              <input type="text" className="ff-input" placeholder="e.g. Book a discovery call" value={goal} onChange={e => setGoal(e.target.value)} />
            </div>

            {error && (
              <div className="ff-fadeup" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button className="ff-btn" onClick={handleAudit} disabled={auditing || optimizing} style={{ marginTop: 8 }}>
              {auditing ? <><Loader2 size={15} className="animate-spin" />Auditing</> : <><Sparkles size={15} />Audit Page<ArrowRight size={15} /></>}
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
  const [conversation, setConversation] = useState('');
  const [goal, setGoal] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [resultMode, setResultMode] = useState(null);
  const [copied, setCopied] = useState({});
  const fileInputRef = useRef(null);

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
      return `You are an expert freelance closer.
${imageData ? 'NOTE: Image attached.\n' : ''}
Generate ONLY: { "situation": "1-2 sentences", "followup": "the message, \\n breaks" }
RULES: match energy of last message; acknowledge without summarizing; move toward goal; offer easy off-ramp if silent.
VOICE: ${toneInstruction}
${STRICT_RULES}
CONVERSATION: ${conversation.trim() || (imageData ? '[See attached.]' : '')}
GOAL: ${goal.trim() || 'Re-engage.'}
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

    return `You are an expert freelance closer.
${imageData ? 'NOTE: Image attached.\n' : ''}
Generate ONLY:
{
  "extraction": { "clientType": "4-8 words", "projectType": "4-7 words", "tone": "3-6 words", "coreProblem": "1-2 sentences", "urgency": "Low|Medium|High", "budgetSignal": "Low|Medium|High", "hiddenIntent": "1-2 sentences" },
  "attachments": [{ "description": "1-2 sentences", "links": ["url from portfolio if matches"] }],
  "proposal": "full proposal, \\n breaks",
  "coldDM": "3-5 lines, \\n breaks"
}
RULES: 3-5 attachments. Include EVERY matching portfolio URL. Never invent URLs.
VOICE: ${toneInstruction}
${STRICT_RULES}
INPUT: ${intel.trim() || (imageData ? '[See attached.]' : '')}
${offer.trim() ? `\nOFFER: ${offer}` : ''}
${proof.trim() ? `\nPROOF: ${proof}` : ''}
${portfolioBlock}
Return ONLY JSON. No em dashes.`;
  };

  const handleGenerate = async () => {
    if (mode === 'followup' && !conversation.trim() && !imageData) { setError('Paste the conversation or upload screenshot.'); return; }
    if (mode !== 'followup' && !intel.trim() && !imageData) { setError('Add intel.'); return; }
    setError(''); setLoading(true); setResult(null);

    try {
      const content = [];
      if (imageData) content.push({ type: 'image', source: { type: 'base64', media_type: imageData.mediaType, data: imageData.data } });
      content.push({ type: 'text', text: buildPrompt() });

      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, messages: [{ role: "user", content }] })
      });
      if (!response.ok) throw new Error('Request failed');

      const data = await response.json();
      const text = data.content.filter(b => b.type === 'text').map(b => b.text).join('').trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      Object.keys(parsed).forEach(k => { if (typeof parsed[k] === 'string') parsed[k] = stripEmDashes(parsed[k]); });
      if (parsed.extraction) Object.keys(parsed.extraction).forEach(k => { if (typeof parsed.extraction[k] === 'string') parsed.extraction[k] = stripEmDashes(parsed.extraction[k]); });
      if (Array.isArray(parsed.attachments)) {
        const portfolioUrls = new Set(portfolio.map(p => p.url));
        parsed.attachments = parsed.attachments.map(a => {
          if (typeof a === 'string') return { description: stripEmDashes(a), links: [] };
          return { description: stripEmDashes(a.description || ''), links: Array.isArray(a.links) ? a.links.filter(u => portfolioUrls.has(u)) : [] };
        });
      }

      setResult(parsed);
      setResultMode(mode);
    } catch (err) { setError('Generation failed.'); } finally { setLoading(false); }
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
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div>
          <label className="ff-section-label block mb-3">Mode</label>
          <CloserModeDropdown value={mode} onChange={setMode} />
          <p className="ff-field-hint mt-2">{CLOSER_MODES[mode].desc}</p>
        </div>
        <div>
          <label className="ff-section-label block mb-3">Tone</label>
          <div className="ff-segment ff-segment-color">
            {TONE_OPTIONS.map(opt => (
              <button key={opt.id} type="button" className={`ff-segment-item ${tone === opt.id ? 'ff-segment-item-active' : ''}`} onClick={() => setTone(opt.id)}>
                {opt.id}
              </button>
            ))}
          </div>
          <p className="ff-field-hint mt-2">{TONE_OPTIONS.find(t => t.id === tone)?.desc}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 md:gap-14">
        <div>
          <h2 className="ff-section-label mb-5">The Input</h2>

          <div className="space-y-5">
            {mode === 'followup' ? (
              <>
                <div>
                  <label className="ff-field-label">Conversation <span className="ff-text-accent">*</span></label>
                  <textarea className="ff-textarea" rows={10} placeholder="Paste both your message and the client's reply." value={conversation} onChange={e => setConversation(e.target.value)} />
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

                <div>
                  <label className="ff-field-label">Goal</label>
                  <textarea className="ff-textarea" rows={3} placeholder='e.g. "Get them on a 15-min call this week"' value={goal} onChange={e => setGoal(e.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="ff-field-label">Intel <span className="ff-text-accent">*</span></label>
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

                <div>
                  <label className="ff-field-label">Positioning <span className="ff-field-hint" style={{ fontWeight: 400 }}>· optional</span></label>
                  <textarea className="ff-textarea" rows={3} placeholder="e.g. I close inbound calls for coaches." value={offer} onChange={e => setOffer(e.target.value)} />
                </div>

                <div>
                  <label className="ff-field-label">Proof <span className="ff-field-hint" style={{ fontWeight: 400 }}>· optional</span></label>
                  <textarea className="ff-textarea" rows={3} placeholder="e.g. Took a $40k/mo coach to $110k/mo." value={proof} onChange={e => setProof(e.target.value)} />
                </div>

                {mode === 'proposal' && (
                  <div>
                    <label className="ff-field-label">
                      Portfolio Library <span className="ff-field-hint" style={{ fontWeight: 400 }}>· {portfolioCount} {portfolioCount === 1 ? 'link' : 'links'}</span>
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
        </div>
      </div>
    </>
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

/* SHARED */

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
  return (
    <div className="space-y-6">
      <div className="ff-fadeup ff-card">
        <h3 className="ff-subheading mb-4">Breakdown</h3>
        <div className="grid grid-cols-2 gap-x-5 gap-y-4">
          <Cell label="Client Type" value={result.extraction?.clientType} />
          <Cell label="Project Type" value={result.extraction?.projectType} accent />
          <Cell label="Tone" value={result.extraction?.tone} wide />
          <Cell label="Urgency"><span className={pillClass(result.extraction?.urgency)}>{result.extraction?.urgency}</span></Cell>
          <Cell label="Budget Signal"><span className={pillClass(result.extraction?.budgetSignal)}>{result.extraction?.budgetSignal}</span></Cell>
          <Cell label="Core Problem" value={result.extraction?.coreProblem} wide />
          <Cell label="Hidden Intent" value={result.extraction?.hiddenIntent} wide />
        </div>
      </div>

      {result.attachments?.length > 0 && (
        <div className="ff-fadeup ff-card" style={{ animationDelay: '60ms' }}>
          <h3 className="ff-subheading mb-4">Suggested Attachments</h3>
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

      <OutputBlock title="Proposal" text={result.proposal} copyKey="proposal" copied={copied} copyText={copyText} selectAllText={selectAllText} delay={120} />
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
      {result.situation && (
        <div className="ff-fadeup ff-card">
          <p className="ff-section-label mb-2">Read of the room</p>
          <p style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.55, letterSpacing: '-0.005em' }}>{result.situation}</p>
        </div>
      )}
      <OutputBlock title="Follow-up" text={result.followup} copyKey="followup" copied={copied} copyText={copyText} selectAllText={selectAllText} delay={60} />
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
        <p style={{
          fontSize: 13.5,
          lineHeight: 1.5,
          color: accent ? 'var(--accent)' : 'var(--text-1)',
          fontWeight: accent ? 600 : 400,
          letterSpacing: '-0.005em',
        }}>
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
      <p className="ff-display ff-text-1 mb-4" style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 600, letterSpacing: '-0.022em' }}>
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
  };
  return (
    <div className="ff-empty-state">
      <div className="ff-mono ff-pulse mb-4" style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Awaiting Intel
      </div>
      <p className="ff-display ff-text-1" style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 600, letterSpacing: '-0.022em', whiteSpace: 'pre-line' }}>
        {messages[mode]}
      </p>
    </div>
  );
}
