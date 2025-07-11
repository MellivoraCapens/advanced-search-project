import express from "express";
import "dotenv/config";
import { connectDB } from "./config/db";
import user from "./routes/user";
import cors from "cors";
import { errorHandler } from "./middlewares/error";

connectDB();

const PORT = process.env.PORT;

const app: express.Application = express();

app.use(express.json());

app.use(cors({ origin: "http://localhost:3000" }));

app.use(errorHandler);

app.use("/advance-search/api/v1", user);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
