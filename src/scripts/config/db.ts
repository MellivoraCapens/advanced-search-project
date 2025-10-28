import mongoose from "mongoose";
import { logger } from "../utils/logger";

export const connectDB = async () => {
  const conn = mongoose.connect(`${process.env.MONGO_URI}`);

  if ((await conn).Error.DocumentNotFoundError === null) {
    logger.error("Database Connection Error!", (await conn).Error);
  }

  if ((await conn).connection.host) {
    logger.debug(`MongoDB Connected: ${(await conn).connection.host}`);
  }
};
