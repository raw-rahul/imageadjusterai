const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");

const app = express();
app.use(cors());
app.use(express.json());

// Store files in memory (No disk storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const MIN_SIZE_KB = 10; // Minimum 10KB
const MAX_SIZE_KB = 20; // Maximum 20KB
const INITIAL_QUALITY = 90; // Start with high quality
const SIZE_MARGIN_KB = 2; // Margin to ensure size remains within limits

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    let quality = INITIAL_QUALITY;
    let buffer = await sharp(req.file.buffer)
      .resize(300, 300, { fit: "inside" }) // Ensure it fits without cropping
      .jpeg({ quality, mozjpeg: true }) // Use MozJPEG for better compression
      .toBuffer();

    let iterations = 0;

    // Optimize compression while keeping quality high
    while (
      (buffer.length > MAX_SIZE_KB * 1024 || buffer.length < MIN_SIZE_KB * 1024) &&
      iterations < 15
    ) {
      if (buffer.length > MAX_SIZE_KB * 1024) {
        quality -= 5; // Reduce quality if file size is too large
      } else if (buffer.length < MIN_SIZE_KB * 1024 - SIZE_MARGIN_KB * 1024) {
        quality += 2; // Increase quality if file size is too low
      }

      if (quality < 40) break; // Prevent over-compression

      buffer = await sharp(req.file.buffer)
        .resize(300, 300, { fit: "inside" }) // Maintain aspect ratio
        .jpeg({ quality, mozjpeg: true }) // Optimize JPEG format
        .toBuffer();

      iterations++;
    }

    // Convert to Base64 so frontend can display/download the image
    const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

    res.json({
      message: "File processed successfully",
      fileUrl: base64Image,
      finalQuality: quality,
      sizeKB: (buffer.length / 1024).toFixed(2),
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Image processing failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
