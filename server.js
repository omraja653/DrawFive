const express = require("express");
const fetch = require("node-fetch"); // or: const fetch = (...await import('node-fetch')).default; for ESM
const cors = require("cors");
const app = express();
const path = require("path");

// Enable CORS for all routes so your client can connect
app.use(cors());

// Status endpoint
app.get("/status", (req, res) => {
  res.json({ status: "UP" });
});

// Proxy endpoint for images
app.get("/proxy-image", async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send("Missing url query parameter");

  try {
    const fetchOptions = {
      headers: { "User-Agent": "SpectraImageProxy/1.0" },
    };
    const response = await fetch(imageUrl, fetchOptions);

    if (!response.ok)
      return res
        .status(response.status)
        .send(`Failed to fetch image: ${response.statusText}`);

    const contentType = response.headers.get("content-type");
    if (!contentType?.startsWith("image/"))
      return res
        .status(400)
        .send(`Resource is not an image. Content-Type: ${contentType}`);

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Content-Type", contentType);
    response.body.pipe(res);
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).send("Proxy encountered an error");
  }
});

// You can add other API routes here if needed

// Start server
const port = process.env.PORT || 5100; // default to 5100 if PORT not set
app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
