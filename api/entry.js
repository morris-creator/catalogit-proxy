export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const { uid } = req.query;
  if (!uid) {
    return res.status(400).json({ error: "uid parameter required" });
  }

  try {
    const response = await fetch(
      `https://api.catalogit.app/api/public/accounts/16688/entries/${uid}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `CatalogIt API returned ${response.status}`
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
