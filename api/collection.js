export default async function handler(req, res) {

  try {

    let allResults = [];
    let nextURL = "https://api.catalogit.app/api/v1/collections";

    while (nextURL) {

      const response = await fetch(nextURL, {
        headers: {
          Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error(`CatalogIt API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results) {
        allResults = allResults.concat(data.results);
      }

      nextURL = data.next;

    }

    res.status(200).json({
      count: allResults.length,
      results: allResults
    });

  } catch (error) {

    res.status(500).json({
      error: "CatalogIt proxy error",
      details: error.message
    });

  }

}
