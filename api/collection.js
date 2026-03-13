export default async function handler(req, res) {

  try {

    const response = await fetch(
      "https://api.catalogit.app/v1/entries/search",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          limit: 1000
        })
      }
    );

    if (!response.ok) {
      throw new Error(`CatalogIt API error: ${response.status}`);
    }

    const data = await response.json();

    res.status(200).json({
      count: data.results?.length || 0,
      results: data.results || []
    });

  } catch (error) {

    res.status(500).json({
      error: "CatalogIt proxy error",
      details: error.message
    });

  }

}
