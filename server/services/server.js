import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Scheme Sathi backend is running.",
  });
});

app.use("/api", aiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

app.listen(PORT, () => {
  console.log(`Scheme Sathi backend listening on http://localhost:${PORT}`);
});
