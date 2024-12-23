import express, { Request, Response } from "express";
import v1Routes from "./routes/v1Routes";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.end("Hello World!");
});

app.use("/api/v1", v1Routes);

app.listen(5000, () => {
  console.log("Server is running on port 5000 :)");
});
