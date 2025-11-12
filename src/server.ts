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

app.use(
  cors({
    origin: "https://mellivoracapens.github.io/advanced-search-project-client",
  })
);

app.use("/advance-search/api/v1", user);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
