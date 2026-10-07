// api/scan-pdf.js  ─  Add this file to your catalogit-proxy project under /api/
//
// Also add to package.json dependencies:
//   "pdf-parse": "^1.1.1"
//
// This endpoint downloads a PDF from a given URL, extracts text page by page,
// and returns the first page number where each search term appears.

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { url, terms } = req.body || {};
  if (!url || !Array.isArray(terms) || !terms.length) {
    return res.status(400).json({ error: "url (string) and terms (string[]) are required" });
  }

  try {
    // Fetch the PDF from S3 (CatalogIt CDN)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const pdfRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!pdfRes.ok) {
      return res.status(502).json({ error: "PDF fetch failed: " + pdfRes.status });
    }

    const buffer = Buffer.from(await pdfRes.arrayBuffer());
    const pdfParse = require("pdf-parse");

    // Collect per-page text via the pagerender callback
    const pageTexts = [];
    await pdfParse(buffer, {
      pagerender: async function (pageData) {
        const content = await pageData.getTextContent();
        // Collapse all whitespace (including double-spaces from line breaks) to single space
        const text = content.items.map(function (i) { return i.str; }).join(" ").replace(/\s+/g, " ").trim();
        pageTexts.push(text);
        return text;
      }
    });

    // Normalize text for comparison
    function norm(s) {
      return s
        // Fix PDF ligature splits: "fi ve-part" → "five-part", "fl at" → "flat", etc.
        .replace(/\b(ffi|ffl|fi|fl|ff)\s+([a-z])/g, '$1$2')
        // Fix OCR artifact in scanned journals: "Set3 0.09" → "Set 30.09"
        .replace(/\bSet(\d)\s+(\d\.\d{2}A?)\b/gi, 'Set $1$2')
        // All dash/hyphen variants → regular hyphen
        .replace(/[‐‑‒–—―−﹘﹣－]/g, '-')
        // Strip leading zeros from date-like patterns (all parts): "08/03/99" → "8/3/99"
        .replace(/(^|[\s(])0(\d(?:\/\d+)+)/g, '$1$2')
        .replace(/\/0(\d)/g, '/$1');
    }

    // Find pages containing each term (case-insensitive, dash+date normalized)
    // matches: first page per term (existing behaviour, used for direct title matches)
    // allMatches: ALL pages per term (used for seriesNumberMatch intersection)
    const matches = {};
    const allMatches = {};
    terms.forEach(function (term) {
      if (!term || term.length < 4) return;
      const termLow = norm(term.toLowerCase());
      for (let i = 0; i < pageTexts.length; i++) {
        if (norm(pageTexts[i].toLowerCase()).includes(termLow)) {
          if (!(term in matches)) matches[term] = i + 1; // 1-indexed, first occurrence
          if (!allMatches[term]) allMatches[term] = [];
          allMatches[term].push(i + 1);
        }
      }
    });

    res.json({ pages: pageTexts.length, matches: matches, allMatches: allMatches });

  } catch (err) {
    console.error("scan-pdf error:", err.message);
    res.status(500).json({ error: err.message || "Scan failed" });
  }
};
