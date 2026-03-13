export default async function handler(req, res) {

  try {

    const response = await fetch("https://api.catalogit.app/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
      },
      body: JSON.stringify({
        query: `
          query {
            entries(first: 1000) {
              edges {
                node {
                  id
                  properties
                  media {
                    path
                    derivatives {
                      public_highres {
                        path
                      }
                    }
                  }
                }
              }
            }
          }
        `
      })
    });

    const json = await response.json();

    const results = json.data.entries.edges.map(e => e.node);

    res.status(200).json({
      count: results.length,
      results
    });

  } catch (error) {

    res.status(500).json({
      error: "CatalogIt proxy error",
      details: error.message
    });

  }

}
