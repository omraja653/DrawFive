const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const cors = require("cors");

const app = express();

// Enable CORS for all origins so frontend can connect
app.use(cors());

// Optional: serve static files if needed
// app.use(express.static(path.join(__dirname, "public")));

// Status endpoint
app.get("/status", (req, res) => {
  res.json({ status: "UP" });
});

// Proxy endpoint for images
app.get("/proxy-image", async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).send("Missing url query parameter");
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "DrawFiveServer/1.0",
      },
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .send(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return res.status(400).send("Resource is not a valid image");
    }

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Content-Type", contentType);
    response.body.pipe(res);
  } catch (err) {
    console.error("Error in /proxy-image:", err);
    res.status(500).send("Proxy encountered an error");
  }
});

// Start server using Render-provided PORT
const port = process.env.PORT || 5100;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
