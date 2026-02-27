export default async function handler(req, res) {
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
  const response = await fetch(
    "https://api.catalogit.app/api/public/accounts/16688/search",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
      },
      body: JSON.stringify({
        size: 200,
        cursor: cursor
      })
    }
  );

  const data = await response.json();

  if (!data.results) break;

  allResults.push(...data.results);
  cursor = data.cursor;

} while (cursor);

    return res.status(200).json({ results: allResults });

  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
}
