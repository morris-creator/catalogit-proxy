const pdfParse = require("pdf-parse");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { url, terms } = req.body || {};
  if (!url || !Array.isArray(terms) || !terms.length) {
    return res.status(400).json({ error: "url and terms[] required" });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    const pdfRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!pdfRes.ok) {
      return res.status(502).json({ error: "PDF fetch failed: " + pdfRes.status });
    }

    const buffer = Buffer.from(await pdfRes.arrayBuffer());
    const pageTexts = [];

    await pdfParse(buffer, {
      pagerender: async function (pageData) {
        const content = await pageData.getTextContent();
                const text = content.items.map(function (i) { return i.str; }).join(" ").replace(/\s+/g, " ").trim();
        pageTexts.push(text);
        return text;
      }
    });

        // Normalize leading zeros in date-like patterns so "08/31/99" matches "8/31/99"
    function normDates(s) {
      return s.replace(/(^|[\s(])0(\d(?:\/\d+)+)/g, '$1$2');
    }

    // Find the first page containing each term (case-insensitive, date-normalized)
    const matches = {};
    terms.forEach(function (term) {
      if (!term || term.length < 4) return;
      const termLow = normDates(term.toLowerCase());
      for (let i = 0; i < pageTexts.length; i++) {
        if (normDates(pageTexts[i].toLowerCase()).includes(termLow)) {
          matches[term] = i + 1;
          return;
        }
      }
    });

    res.json({ pages: pageTexts.length, matches: matches });

  } catch (err) {
    console.error("scan-pdf error:", err.message);
    res.status(500).json({ error: err.message || "Scan failed" });
  }
};
