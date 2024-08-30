import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Set up the static folder to serve images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// MongoDB connection
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const URI =
  process.env.MONGO_URI ||
  `mongodb+srv://${USERNAME}:${PASSWORD}@cluster0.rth5xhw.mongodb.net/PhotoDB?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Multer setup for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Photo schema and model
const photoSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
});

const Photo = mongoose.model("Photo", photoSchema);

// Routes
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const newPhoto = new Photo({ imageUrl: `/uploads/${req.file.filename}` });
    await newPhoto.save();
    res.json(newPhoto);
  } catch (err) {
    res.status(500).json({ error: "Failed to upload image" });
  }
});

app.get("/photos", async (req, res) => {
  try {
    const photos = await Photo.find();
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});
const PORT = process.env.PORT || 5000;
if (PORT) {
  app.listen(PORT);
}
export default app;
//made a commit
