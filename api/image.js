export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "url parameter required" });

  // Only allow CatalogIt CDN URLs
  if (!url.startsWith("https://d3f1jyudfg58oi.cloudfront.net/") &&
      !url.startsWith("https://d8e7jbdw4fu0e.cloudfront.net/")) {
    return res.status(403).json({ error: "URL not allowed" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `CDN returned ${response.status}` });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
