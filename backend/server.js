// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const sharp = require("sharp");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Store files in memory (No disk storage)
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// const MIN_SIZE_KB = 10; // Minimum 10KB
// const MAX_SIZE_KB = 20; // Maximum 20KB
// const INITIAL_QUALITY = 90; // Start with high quality
// const SIZE_MARGIN_KB = 2; // Margin to ensure size remains within limits

// app.post("/api/upload", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded" });
//   }

//   try {
//     let quality = INITIAL_QUALITY;
//     let buffer = await sharp(req.file.buffer)
//       .resize(300, 300, { fit: "inside" }) // Ensure it fits without cropping
//       .jpeg({ quality, mozjpeg: true }) // Use MozJPEG for better compression
//       .toBuffer();

//     let iterations = 0;

//     // Optimize compression while keeping quality high
//     while (
//       (buffer.length > MAX_SIZE_KB * 1024 || buffer.length < MIN_SIZE_KB * 1024) &&
//       iterations < 15
//     ) {
//       if (buffer.length > MAX_SIZE_KB * 1024) {
//         quality -= 5; // Reduce quality if file size is too large
//       } else if (buffer.length < MIN_SIZE_KB * 1024 - SIZE_MARGIN_KB * 1024) {
//         quality += 2; // Increase quality if file size is too low
//       }

//       if (quality < 40) break; // Prevent over-compression

//       buffer = await sharp(req.file.buffer)
//         .resize(300, 300, { fit: "inside" }) // Maintain aspect ratio
//         .jpeg({ quality, mozjpeg: true }) // Optimize JPEG format
//         .toBuffer();

//       iterations++;
//     }

//     // Convert to Base64 so frontend can display/download the image
//     const base64Image = `data:image/jpeg;base64,${buffer.toString("base64")}`;

//     res.json({
//       message: "File processed successfully",
//       fileUrl: base64Image,
//       finalQuality: quality,
//       sizeKB: (buffer.length / 1024).toFixed(2),
//     });
//   } catch (error) {
//     console.error("Error processing image:", error);
//     res.status(500).json({ error: "Image processing failed" });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sharp = require("sharp");

const app = express();
app.use(cors());
app.use(express.json());

// Store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Exam-specific constraints
const examConstraints = {
  upsc: { width: 300, height: 300, type: "jpeg", size: [10, 20] },
  gate: { width: 200, height: 200, type: "png", size: [15, 25] },
  jee: { width: 250, height: 250, type: "jpeg", size: [5, 15] },
  neet: { width: 350, height: 350, type: "jpeg", size: [10, 25] },
  cat: { width: 280, height: 280, type: "png", size: [8, 18] },
  ssc: { width: 320, height: 320, type: "jpeg", size: [12, 22] }
};

// Search API
app.get("/api/search", (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  const results = Object.keys(examConstraints)
    .filter(exam => exam.toLowerCase().includes(query.toLowerCase()))
    .map(exam => ({
      name: exam.toUpperCase(),
      constraints: examConstraints[exam]
    }));

  res.json({ results });
});

// Get constraints for specific exam
app.get("/api/constraints/:exam", (req, res) => {
  const { exam } = req.params;
  
  if (!examConstraints[exam.toLowerCase()]) {
    return res.status(404).json({ message: "Exam not found" });
  }
  
  res.json(examConstraints[exam.toLowerCase()]);
});

// Upload API
app.post("/api/upload", upload.single("file"), async (req, res) => {
  const { exam } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!examConstraints[exam]) {
    return res.status(400).json({ message: "Invalid exam type" });
  }

  const { width, height, type, size } = examConstraints[exam];
  const [minSizeKB, maxSizeKB] = size;

  try {
    let quality = 90;
    let buffer = await sharp(req.file.buffer)
      .resize(width, height, { fit: "inside" })
      .toFormat(type, { quality })
      .toBuffer();

    let iterations = 0;

    // Optimize compression
    while (
      (buffer.length > maxSizeKB * 1024 || buffer.length < minSizeKB * 1024) &&
      iterations < 15
    ) {
      if (buffer.length > maxSizeKB * 1024) {
        quality = Math.max(40, quality - 5);
      } else if (buffer.length < minSizeKB * 1024 - 2 * 1024) {
        quality = Math.min(100, quality + 2);
      }

      buffer = await sharp(req.file.buffer)
        .resize(width, height, { fit: "inside" })
        .toFormat(type, { quality })
        .toBuffer();

      iterations++;
    }

    // Convert to Base64 for preview/download
    const fileUrl = `data:image/${type};base64,${buffer.toString("base64")}`;

    res.json({
      message: "File processed successfully",
      fileUrl,
      finalQuality: quality,
      sizeKB: (buffer.length / 1024).toFixed(2),
      dimensions: `${width}x${height}`,
      format: type
    });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Image processing failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

