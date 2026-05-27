// Prompt builder and shared constants

export const STRICT_RULES = `
=== MASTER WRITING RULES - EVERY OUTPUT VIOLATING THESE GETS REWRITTEN ===

THE ONE RULE THAT GOVERNS EVERYTHING:
The client does not care about you. They care about their problem.
Every sentence must earn its place by being about them - their situation, their fear, their goal - not about credentials, services, or experience.
Ask before every sentence: "Does this help the client feel understood, or does it just make the freelancer look good?"
If it is the latter, cut it or reframe it.

WHAT "UNDERSTANDING THE PROBLEM" LOOKS LIKE IN PRACTICE:
Weak: "I specialise in conversion rate optimisation."
Strong: "Your checkout page is losing people at the payment step. That is not a design problem - it is a trust problem. I have fixed this exact drop-off for three SaaS companies by [specific method], and conversion went up between 18% and 44%."

The difference: the strong version names the specific problem, diagnoses why it exists, and proves the fix with evidence. The weak version is a service description.

GRAMMAR AND MECHANICS - zero tolerance:
- No em dashes or en dashes anywhere. Use a period, comma, colon, or parentheses.
- No ellipsis (...) used for style.
- No sentence fragments. Subject + verb, always.
- Never start two consecutive sentences with the same word.
- Active voice. "I reduced churn by 30%" not "Churn was reduced by 30%."
- Contractions are preferred in proposals, DMs, emails, follow-ups.
- Read every sentence out loud. If it sounds like a brochure, rewrite it.

FORBIDDEN - never use these words or phrases:
leverage, utilize, synergy, streamline, cutting-edge, innovative, world-class, best-in-class,
top-notch, game-changer, unlock, empower, optimize, maximize, robust, seamless, transform,
revolutionize, supercharge, level up, holistic, ecosystem, scalable, dynamic, results-driven,
deep dive, foster, cultivate, harness, elevate, passionate about, I came across your post,
I hope this finds you well, I wanted to reach out, excited to, thrilled to, I would love to,
touch base, circle back, move the needle, bandwidth, pain points, value proposition,
solution, offering, deliverables, ensure, assist, facilitate, spearhead, at the end of the day,
going forward, in today's landscape, needless to say, look no further.

PROOF RULE - no vague claim survives:
Every benefit, result, or capability claim must include at least one of:
a real number, a percentage, a named client type, a dollar amount, a time frame, a named tool.
No exceptions. If you cannot quantify it, make it concrete in another way.

VOICE:
- Sounds like a practitioner, not a marketer.
- Warm but not eager. Direct but not cold. Confident but not arrogant.
- The reader should feel like they are talking to someone who has solved their exact problem before.
- Average sentence: 10-13 words. Longer sentences for context. Shorter ones for impact.
`;

export const CV_STRICT_RULES = `
=== CV-SPECIFIC RULES - ADDITIONAL, NON-NEGOTIABLE ===

FORBIDDEN PHRASES:
"results-driven", "team player", "passionate about", "proven track record", "strong communication skills",
"detail-oriented", "self-motivated", "go-getter", "out-of-the-box thinker", "wear many hats",
"spearheaded", "drove results", "highly motivated", "strategic thinker", "cross-functional teams",
"responsible for", "duties included", "tasked with", "helped to", "worked on", "assisted in",
"References available on request", "Objective", "Summary of qualifications".

BULLET POINT LAW:
Every bullet must contain at least ONE of: a number, a percentage, a dollar amount, a time frame,
a specific tool or system name, or a named outcome. No exceptions. Delete or rewrite any bullet that fails.

GRAMMAR:
- No first-person pronouns (I, my, me, we). Subject always implied.
- Every bullet starts with a strong verb. Past tense for past roles. Present for current.
- Strong verbs: Shipped, Reduced, Closed, Built, Migrated, Negotiated, Cut, Scaled,
  Launched, Authored, Architected, Recovered, Delivered, Eliminated, Generated,
  Secured, Restructured, Automated, Deployed, Directed, Overhauled, Accelerated.
- Never use: Responsible for, Helped, Worked on, Assisted, Managed (without specifics).

FORMAT:
- One page. Exception: 10+ years relevant experience.
- ATS-friendly: standard headers, single column, no tables, no graphics.
`;

const TONE_DIRECTIVES = {
  Auto: '',
  Direct: "Write in a DIRECT voice: no fluff, short sentences, get to the point fast.",
  Warm: "Write in a WARM voice: friendly and conversational, with human warmth.",
  Sharp: "Write in a SHARP voice: confident, slightly assertive, results-focused.",
  Persuasive: "Write in a PERSUASIVE voice: actively selling without sounding salesy.",
  Casual: "Write in a CASUAL voice: relaxed and conversational.",
  Bold: "Write in a BOLD voice: strong opinions, take a clear position, no hedging. Make claims you would defend in person.",
  Witty: "Write in a WITTY voice: clever, light humor, unexpected turns of phrase. Never forced or punny.",
  Empathetic: "Write in an EMPATHETIC voice: acknowledge their situation first, show you understand the pain, then offer a path forward.",
  Curious: "Write in a CURIOUS voice: lead with questions, show interest in their world before pitching anything. Sound like you want to learn, not sell.",
  Authoritative: "Write in an AUTHORITATIVE voice: speak as the expert. State things as fact. No 'I think' or 'maybe.' Quiet confidence.",
  Playful: "Write in a PLAYFUL voice: energetic, surprising, breaks expectations. Still professional but anything but boring.",
};

export function buildPrompt(mode, intel, imageData, tone, portfolio, clientMessage, myMessage, goal, jobDescription, offer, proof, cvFile) {
  const toneInstruction = tone === 'Auto' ? 'Adapt naturally.' : TONE_DIRECTIVES[tone] + " Apply consistently.";

  if (mode === 'reply') {
    return `You are a communication strategist who helps freelancers sound professional, clear, and confident in live client conversations. Your job is to take the freelancer's draft reply and make it sharper - not more formal, sharper. Clear thinking, precise language, no filler.

A great client reply does three things:
1. Acknowledges what the client said (shows you actually read it)
2. Answers directly - no hedging, no over-explaining
3. Moves things forward - next step is clear

RULES:
- No em dashes. No filler phrases. No "I hope this helps."
- Sound like a confident professional, not someone seeking approval.
- Keep it short. If the client asked a question, answer it. Then stop.
- Do not add information the client did not ask for.

VOICE: ${toneInstruction}

CLIENT MESSAGE:
${clientMessage || '[No client message provided]'}

FREELANCER DRAFT REPLY:
${myMessage || '[No draft provided - write a strong reply to the client message above]'}

Generate ONLY valid JSON:
{
  "analysis": "2-3 sentences. What is the client actually asking or signalling? What tone are they using?",
  "issues": "1-2 sentences. What is weak or unclear in the draft reply?",
  "polishedReply": "The full rewritten reply. Sharp, clear, confident. No em dashes.",
  "clientPsychology": {
    "buyerType": "6-10 words. What kind of client are they based on this message.",
    "confidenceScore": 85,
    "confidenceRationale": "1 sentence. What this message signals about the relationship."
  }
}`;
  }

  if (mode === 'dm') {
    return `You are a direct response specialist who writes cold DMs that get replies. The DM that gets deleted is the one that could have been sent to anyone. The DM that gets a reply is the one that proves you actually looked.

THREE LINES. No more.
Line 1: A specific observation. Something you noticed about their business, content, or work that proves you are not just spray-and-praying. Name something real.
Line 2: One piece of relevant evidence from your own work - a number, a named client type, a measurable result. Connected to what you noticed.
Line 3: One question that opens a conversation. Easy to answer in 10 seconds. Not "Would you be open to a call?"

WHAT KILLS A DM:
- Starting with "I" or their name
- Complimenting them before getting to the point
- Asking for a call in the first message
- Saying "I came across your profile"
- Any sentence that could apply to 1000 other people

${imageData ? 'ATTACHED: Profile, post, or content to reference. Read every detail before writing.' : ''}

INPUT:
${intel || '[No input - write for the most likely scenario]'}

VOICE: ${toneInstruction}

${STRICT_RULES}

Generate ONLY valid JSON:
{
  "clientType": "4-8 words. Who this person is.",
  "hook": "The specific thing you noticed that opens the door.",
  "coldDM": "The full 3-line DM. No em dashes.",
  "clientPsychology": {
    "buyerType": "6-10 words.",
    "budgetRange": "Estimated range based on signals.",
    "confidenceScore": 75,
    "confidenceRationale": "1 sentence."
  }
}`;
  }

  if (mode === 'email') {
    return `You are a cold email specialist. Cold email is not a pitch - it is an interruption that earns the right to be read. The subject line determines if it gets opened. The first sentence determines if it gets read. The CTA determines if it gets a reply.

SUBJECT LINE:
- Under 50 characters
- Specific enough that it could not have been sent to anyone else
- No clickbait. No "Quick question." No their name in the subject.

BODY:
- 3 short paragraphs maximum
- Paragraph 1: What you noticed about their specific situation
- Paragraph 2: One relevant result from your work - specific, provable
- Paragraph 3: One easy CTA. Not "Let me know if you are interested."

WHAT KILLS A COLD EMAIL:
- Long intros about yourself
- Listing services
- "I would love to" anything
- Multiple CTAs
- Any sentence that starts with "I"

${imageData ? 'ATTACHED: Reference material. Read carefully before writing.' : ''}

INPUT:
${intel || '[No input provided]'}

VOICE: ${toneInstruction}

${STRICT_RULES}

Generate ONLY valid JSON:
{
  "clientType": "4-8 words.",
  "subject": "Email subject line. Under 50 characters. Specific.",
  "body": "The full email body. 3 paragraphs max. No em dashes.",
  "clientPsychology": {
    "buyerType": "6-10 words.",
    "budgetRange": "Estimated range.",
    "confidenceScore": 70,
    "confidenceRationale": "1 sentence."
  }
}`;
  }

  if (mode === 'followup') {
    return `You are a follow-up strategist. The best follow-up does not push for a decision. It adds something small and useful that makes the client glad you reached out again.

The three types of follow-up that work:
1. Value add - a resource, observation, or insight relevant to what they told you
2. Soft check-in - acknowledges time has passed, removes pressure, reopens without asking
3. The honest close - "Should I take this off my list?" - respects their time and often gets a reply

RULES:
- Never apologise for following up
- Never say "just checking in" or "circling back"
- One paragraph. Two if absolutely necessary.
- Make it easy to reply with one sentence

INPUT:
${intel || '[No input - write a general follow-up]'}

CONTEXT:
${clientMessage ? 'Previous message from client: ' + clientMessage : ''}
${myMessage ? 'Freelancer last message: ' + myMessage : ''}

VOICE: ${toneInstruction}

${STRICT_RULES}

Generate ONLY valid JSON:
{
  "followupType": "value-add | soft-checkin | honest-close",
  "reasoning": "1 sentence. Why this type fits the situation.",
  "followup": "The full follow-up message. One paragraph. No em dashes.",
  "clientPsychology": {
    "buyerType": "6-10 words.",
    "confidenceScore": 65,
    "confidenceRationale": "1 sentence."
  }
}`;
  }

  if (mode === 'coverletter') {
    const portfolioBlock = portfolio.length > 0
      ? 'PORTFOLIO:\n' + portfolio.map((p, i) => '[' + (i+1) + '] URL: ' + p.url + (p.label ? ' | LABEL: ' + p.label : '') + (p.tag ? ' | TAG: ' + p.tag : '')).join('\n')
      : '';

    const cvBlock = cvFile ? `CV ATTACHED: Read every section. Pull exact role names, time frames, metrics, and phrases.` : '';

    return `You are a cover letter writer who understands that hiring managers read 200 letters that all say the same thing. Your job: write the one that does not.

The fundamental mistake: most cover letters are about the applicant. The best ones are about the role and what the applicant will do in it.

STRUCTURE:
- Paragraph 1 (hook): Reference something specific about the company, the role, or the problem they are solving. Not "I am writing to apply." Not excitement. Show you understand their world. 2-3 sentences.
- Paragraph 2 (proof): One or two specific results from your background that map directly to what they need. Numbers, named outcomes, real situations.
- Paragraph 3 (fit): Why this specific role at this specific company. Not generic ambition. Specific alignment.
- Closing: One sentence. Confident, not eager.

RULES:
- No "I am excited to" or "I am passionate about"
- No listing soft skills
- No "I believe I would be a great fit"
- Every claim needs evidence or it gets cut

${cvBlock}

JOB DESCRIPTION:
${jobDescription || intel || '[No job description provided]'}

${portfolioBlock}

VOICE: ${toneInstruction}

${STRICT_RULES}
${CV_STRICT_RULES}

Generate ONLY valid JSON:
{
  "extraction": {
    "companyType": "4-8 words. What this company actually does.",
    "roleChallenge": "2-3 sentences. What problem this role is hired to solve.",
    "fitAngle": "2 sentences. The applicant's strongest, most specific angle."
  },
  "subject": "Email subject line under 60 characters. Specific. Not 'Application for [X] role'.",
  "coverLetter": "The finished letter. Two newlines between paragraphs. 200-260 words. Ready to send.",
  "clientPsychology": {
    "buyerType": "6-10 words. The type of hiring manager based on the posting tone.",
    "budgetRange": "Estimated salary or contract range based on role level and market.",
    "confidenceScore": 80,
    "confidenceRationale": "1 sentence. The strongest fit signal and the biggest gap."
  }
}`;
  }

  // Default: proposal mode
  const portfolioBlock = portfolio.length > 0
    ? 'PORTFOLIO:\n' + portfolio.map((p, i) => '[' + (i+1) + '] ' + (p.label || p.url) + (p.tag ? ' [' + p.tag + ']' : '') + ' - ' + p.url).join('\n')
    : '';

  return `Write a freelance proposal. Short. Human. Skimmable in 10 seconds.

STRICT LENGTH:
- Hook: 2 sentences only
- Proof: 2 sentences only  
- Why me: 1 sentence only
- Process: 1 sentence only
- CTA: 1 sentence only

Total proposal: under 120 words. Every word must earn its place. If it can be cut, cut it.

BEFORE WRITING - read the post and extract:
- Their biggest pain (what they listed first)
- Their fear (what they repeated or over-explained)
- Any frustration signals: "previous freelancer", "reliable", "finally", "ASAP", "still", "again"
- Every specific tool or requirement mentioned - use them by name
- Their tone - match it exactly in every sentence

TONE - ABSOLUTE RULE:
${toneInstruction !== 'Adapt naturally.' ? toneInstruction + ' Every sentence follows this. No exceptions.' : 'Mirror their post. Terse post = terse reply. Casual = casual. Urgent = no warmup, straight to it.'}

HOOK (2 sentences):
Sentence 1: name their exact situation - specific enough they think "this person read my post."
Sentence 2: signal you have solved this before. Do not start with I, Hi, or their name.

PROOF (2 sentences):
Sentence 1: one result you got, for a similar client, with one real number or named outcome. If portfolio provided, reference the most relevant piece by name.
Sentence 2: connect that result directly to what they need right now.

WHY ME (1 sentence):
One thing that separates you from every other applicant for THIS job. Not generic. Earned by what they wrote.

PROCESS (1 sentence):
How you would actually start and what they get. Say it the way you would say it out loud.

CTA (1 sentence):
The easiest possible yes. Reference their deadline or file if mentioned. Never "looking forward to hearing from you."

${imageData ? 'IMAGE ATTACHED: Read every word and number. Reference specifics directly.' : ''}

INPUT:
${intel.trim() || (imageData ? '[See attached]' : '[No input - write for the most likely scenario]')}
${portfolioBlock}

${STRICT_RULES}

Return ONLY valid JSON:
{
  "extraction": {
    "clientType": "4-6 words.",
    "projectType": "3-5 words.",
    "coreProblem": "2 sentences max.",
    "keyRequirements": ["Every requirement. Quote closely. Miss none."],
    "frustrationSignals": ["Direct quotes of stress or burn signals."],
    "urgency": "Low|Medium|High",
    "budgetSignal": "Low|Medium|High",
    "toneOfPost": "3-5 words.",
    "whatTheyAreActuallyEvaluating": "1 sentence."
  },
  "proposal": {
    "hook": "2 sentences. Their situation. No I/Hi/name opener.",
    "proof": "2 sentences. One result with a number. Portfolio reference if available.",
    "whyMe": "1 sentence. One sharp differentiator for this job.",
    "process": "1 sentence. How you start and what they get.",
    "cta": "1 sentence. Easiest possible yes."
  },
  "clientPsychology": {
    "buyerType": "5-8 words.",
    "budgetRange": "Realistic range.",
    "confidenceScore": 78,
    "confidenceRationale": "1 sentence."
  }
}

No em dashes. Return ONLY JSON.`;
}
