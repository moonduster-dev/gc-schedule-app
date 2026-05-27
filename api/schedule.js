export default async function handler(req, res) {
  const url =
    "https://docs.google.com/spreadsheets/d/1TefMflV31mWBIhuSY8Bui5e20-0SrOfo/export?format=csv&gid=1745228852";

  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      redirect: "follow",
    });

    const text = await resp.text();

    // If Google redirected to a login page, return 403
    if (text.trimStart().startsWith("<")) {
      return res.status(403).json({ error: "Sheet not publicly accessible" });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Cache-Control", "s-maxage=300"); // cache 5 min on CDN
    res.send(text);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
