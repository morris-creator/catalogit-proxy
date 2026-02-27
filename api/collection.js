export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.jameshowellfoundation.org");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    let allResults = [];
let page = 1;

while (true) {
  const url = `https://api.catalogit.app/api/public/accounts/16688/entries?size=200&page=${page}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
    }
  });

  const data = await response.json();

  if (!data.results || data.results.length === 0) break;

  allResults.push(...data.results);

  if (data.results.length < 200) break;

  page++;
}

    return res.status(200).json({ results: allResults });

  } catch (error) {
    return res.status(500).json({ error: error.toString() });
  }
}
