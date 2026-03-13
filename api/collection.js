export default async function handler(req, res) {
  try {

    let allEntries = [];
    let page = 0;
    const size = 200;
    let hasMore = true;

    while (hasMore) {

      const response = await fetch(
        `https://api.catalogit.app/api/public/accounts/16688/entries?page=${page}&size=${size}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CATALOGIT_TOKEN}`
          }
        }
      );

      const data = await response.json();

      if (data.entries && data.entries.length > 0) {
        allEntries = allEntries.concat(data.entries);
        page++;
      } else {
        hasMore = false;
      }

    }

    res.status(200).json({
      entries: allEntries,
      total: allEntries.length
    });

  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}
