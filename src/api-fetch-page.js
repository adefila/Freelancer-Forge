// api/fetch-page.js — Vercel serverless function
// Fetches a URL server-side, extracts clean text from HTML,
// and returns it in a structured format for Claude to audit.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL' });
  }

  // Validate URL
  let parsedUrl;
  try {
    parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'URL must use http or https' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Block private/internal IPs (basic SSRF protection)
  const hostname = parsedUrl.hostname.toLowerCase();
  const blockedPatterns = [
    /^localhost$/,
    /^127\./,
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^169\.254\./,
    /^0\./,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];
  if (blockedPatterns.some(re => re.test(hostname))) {
    return res.status(400).json({ error: 'URL not allowed' });
  }

  try {
    // Fetch with realistic headers to avoid basic bot blocks
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(502).json({
        error: `Site returned ${response.status}. The page may block automated requests. Try pasting the copy or uploading a screenshot instead.`
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return res.status(415).json({
        error: 'URL does not return HTML. Try a different URL.'
      });
    }

    const html = await response.text();

    // Cap at ~500KB to avoid massive pages
    if (html.length > 500000) {
      const truncated = html.substring(0, 500000);
      const extracted = extractText(truncated);
      return res.status(200).json({
        url,
        finalUrl: response.url,
        title: extracted.title,
        text: extracted.text,
        meta: extracted.meta,
        truncated: true,
      });
    }

    const extracted = extractText(html);

    return res.status(200).json({
      url,
      finalUrl: response.url,
      title: extracted.title,
      text: extracted.text,
      meta: extracted.meta,
      truncated: false,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({
        error: 'The site took too long to respond. Try pasting the copy instead.'
      });
    }
    return res.status(500).json({
      error: `Could not fetch the page: ${err.message}. Try pasting the copy or uploading a screenshot.`
    });
  }
}

/* ====================================================================== */
/* HTML-to-text extraction                                                */
/* ====================================================================== */

function extractText(html) {
  // Get title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? cleanText(titleMatch[1]) : '';

  // Get meta description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const description = descMatch ? cleanText(descMatch[1]) : '';

  // Get OG title and description (often more accurate)
  const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const ogTitle = ogTitleMatch ? cleanText(ogTitleMatch[1]) : '';

  const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  const ogDesc = ogDescMatch ? cleanText(ogDescMatch[1]) : '';

  // Strip script, style, noscript, iframe, svg, comments
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '');

  // Try to find <main>, <article>, or fall back to <body>
  let mainContent = cleaned;
  const mainMatch = cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  const articleMatch = cleaned.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  const bodyMatch = cleaned.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);

  if (mainMatch) mainContent = mainMatch[1];
  else if (articleMatch) mainContent = articleMatch[1];
  else if (bodyMatch) mainContent = bodyMatch[1];

  // Extract structured content with hierarchy preserved
  const sections = [];

  // Headings get prefixed
  mainContent = mainContent.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, c) => `\n\n# ${cleanText(c)}\n`);
  mainContent = mainContent.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, c) => `\n\n## ${cleanText(c)}\n`);
  mainContent = mainContent.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, c) => `\n\n### ${cleanText(c)}\n`);
  mainContent = mainContent.replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, (_, c) => `\n#### ${cleanText(c)}\n`);

  // List items
  mainContent = mainContent.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, c) => `• ${cleanText(c)}\n`);

  // Buttons and links (preserve CTAs)
  mainContent = mainContent.replace(/<button[^>]*>([\s\S]*?)<\/button>/gi, (_, c) => {
    const txt = cleanText(c);
    return txt ? `[Button: ${txt}] ` : '';
  });
  mainContent = mainContent.replace(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, c) => {
    const txt = cleanText(c);
    if (!txt) return '';
    // Keep the anchor text, only call out if it looks like a CTA
    const ctaWords = /\b(get|start|book|try|buy|sign|join|download|schedule|contact|call|learn|see|view|hire|work)\b/i;
    if (ctaWords.test(txt) && txt.length < 40) {
      return `[Link: ${txt}] `;
    }
    return txt + ' ';
  });

  // Paragraphs and breaks
  mainContent = mainContent.replace(/<\/p>/gi, '\n\n');
  mainContent = mainContent.replace(/<br\s*\/?>/gi, '\n');
  mainContent = mainContent.replace(/<\/(div|section|article|header|footer|nav|aside)>/gi, '\n\n');

  // Strip all remaining tags
  mainContent = mainContent.replace(/<[^>]+>/g, ' ');

  // Decode entities
  mainContent = decodeEntities(mainContent);

  // Collapse whitespace
  mainContent = mainContent
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter(line => line.length > 0)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  // Cap at ~30k chars (Claude has a context limit, this leaves room)
  if (mainContent.length > 30000) {
    mainContent = mainContent.substring(0, 30000) + '\n\n[...content truncated for length...]';
  }

  return {
    title: ogTitle || title || '',
    text: mainContent.trim(),
    meta: {
      description: ogDesc || description || '',
    },
  };
}

function cleanText(s) {
  if (!s) return '';
  return decodeEntities(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function decodeEntities(s) {
  if (!s) return '';
  const named = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&apos;': "'", '&nbsp;': ' ', '&mdash;': ',',
    '&ndash;': ',', '&hellip;': '…', '&copy;': '©', '&reg;': '®',
    '&trade;': '™', '&rsquo;': "'", '&lsquo;': "'", '&rdquo;': '"',
    '&ldquo;': '"', '&laquo;': '«', '&raquo;': '»',
  };
  return s
    .replace(/&[a-zA-Z]+;/g, m => named[m] || m)
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}
