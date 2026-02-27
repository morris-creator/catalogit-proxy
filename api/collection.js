export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.jameshowellfoundation.org");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
  const response = await fetch(
    "https://api.catalogit.app/api/public/accounts/16688/entries?size=200",
    {
      headers: {
        Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
      }
    }
  );

  const data = await response.json();

  return res.status(200).json({ results: data.results || [] });

} catch (error) {
  return res.status(500).json({ error: error.toString() });
}
}
