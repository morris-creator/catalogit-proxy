export default async function handler(req, res) {
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
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
