import express, { Request, Response } from "express";
import cors from "cors";
import v1Routes from "./routes/v1Routes";
import path from "path";

const app = express();

app.use(
  cors({
    origin: [
      "https://spaces.rishuffled.in",
      "https://www.spaces.rishuffled.in",
      "http://localhost:3000",
      "http://localhost:7001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/v1/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req: Request, res: Response) => {
  res.end("Hello World!");
});

app.use("/api/v1", v1Routes);

const PORT = process.env.PORT || 7002;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} :)`);
});
