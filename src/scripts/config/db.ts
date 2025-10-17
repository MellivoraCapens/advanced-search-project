import mongoose from "mongoose";
import chalk from "chalk";

export const connectDB = async () => {
  const conn = mongoose.connect(`${process.env.MONGO_URI}`);

  if ((await conn).Error.DocumentNotFoundError === null) {
    console.log((await conn).Error);
  }

  console.log(
    chalk.cyan("MongoDB Connected:") +
      chalk.greenBright(` ${(await conn).connection.host}`)
  );
};
