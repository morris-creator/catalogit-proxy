export default async function handler(req, res) {

  try {

    const response = await fetch("https://api.catalogit.app/v1/", {
      headers: {
        Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
      }
    });

    const text = await response.text();

    res.status(200).send(text);

  } catch (error) {

    res.status(500).json({
      error: "CatalogIt proxy error",
      details: error.message
    });

  }

}
