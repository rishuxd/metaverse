import express, { Request, Response } from "express";
import cors from "cors";
import v1Routes from "./routes/v1Routes";
import path from "path";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.use("/api/v1/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req: Request, res: Response) => {
  res.end("Hello World!");
});

app.use("/api/v1", v1Routes);

app.listen(5000, () => {
  console.log("Server is running on port 5000 :)");
});
