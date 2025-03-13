const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp"); // Import Sharp

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use("/uploads", express.static("uploads"));

// Ensure "uploads" directory exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Configure Multer to handle file uploads
const storage = multer.memoryStorage(); // Store in memory for processing
const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const filename = `compressed_${Date.now()}.jpg`;
        const outputPath = path.join(__dirname, "uploads", filename);

        // Compress and resize image
        await sharp(req.file.buffer)
            .resize(800) // Resize to 800px width (height auto)
            .jpeg({ quality: 70 }) // Compress (quality: 70%)
            .toFile(outputPath);

        res.json({
            message: "File uploaded & compressed successfully",
            fileUrl: `/uploads/${filename}`,
        });

    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).json({ message: "Error processing image" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
