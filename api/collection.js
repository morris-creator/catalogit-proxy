export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {

    let allResults = [];
    let nextURL =
      "https://api.catalogit.app/api/public/accounts/16688/entries?size=200";

    while (nextURL) {

      const response = await fetch(nextURL, {
        headers: {
          Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
        }
      });

      const data = await response.json();

      if (data.results) {
        allResults = allResults.concat(data.results);
      }

      if (data.cursor) {
        nextURL =
          "https://api.catalogit.app/api/public/accounts/16688/entries?cursor=" +
          data.cursor +
          "&size=200";
      } else {
        nextURL = null;
      }

    }

    res.status(200).json({
      results: allResults,
      total: allResults.length
    });

  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
