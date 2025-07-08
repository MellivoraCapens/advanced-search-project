import mongoose from "mongoose";

export const connectDB = async () => {
  const conn = mongoose.connect(`${process.env.MONGO_URI}`);

  if ((await conn).Error.DocumentNotFoundError === null) {
    console.log((await conn).Error);
  }

  console.log(`MongoDB Connected: ${(await conn).connection.host}`);
};
