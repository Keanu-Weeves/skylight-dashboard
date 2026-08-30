/* eslint-env node */
import ical from 'node-ical';

export default async function handler(req, res) {
  console.log("Backend hit! Fetching calendar...");
  
  try {
    const url = process.env.VITE_ICAL_URL;
    
    if (!url) {
      console.log("Error: No URL found in .env");
      return res.status(500).json({ error: "Missing Calendar URL" });
    }

    const events = await ical.async.fromURL(url);
    console.log("Success! Events fetched.");
    res.status(200).json(events);
  } catch (error) {
    console.error("Calendar fetch error:", error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
}