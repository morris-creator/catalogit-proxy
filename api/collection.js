export default async function handler(req, res) {
  // 🔥 ADD CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "https://www.jameshowellfoundation.org");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
   const allResults = [];
let cursor = null;

do {
  const url = cursor
    ? `https://api.catalogit.app/api/public/accounts/16688/entries?size=200&cursor=${cursor}`
    : `https://api.catalogit.app/api/public/accounts/16688/entries?size=200`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
    }
  });

  const data = await response.json();

  allResults.push(...data.results);
  cursor = data.cursor;

} while (cursor);

res.status(200).json({ results: allResults });
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
