const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration (Stores in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Image Upload & Processing Route
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const targetWidth = 300;
        const targetHeight = 300;
        const outputPath = path.join(uploadDir, `processed_${Date.now()}.jpeg`);

        // Process Image with Sharp
        await sharp(req.file.buffer)
            .resize(targetWidth, targetHeight)
            .jpeg({ quality: 80 })
            .toFile(outputPath);

        res.json({
            message: "File uploaded and processed successfully",
            fileUrl: `/uploads/${path.basename(outputPath)}`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Export Router
module.exports = router;
