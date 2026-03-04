export default async function handler(req, res) {

  try {

    let allResults = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {

      const response = await fetch(
        `https://api.catalogit.app/api/v1/collection?page=${page}&page_size=200`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`CatalogIt API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        allResults = allResults.concat(data.results);
        page++;
      } else {
        hasMore = false;
      }

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
