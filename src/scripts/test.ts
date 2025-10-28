/// <reference path="../../@types/index.d.ts" />
import "dotenv/config";
import Query from "../models/Query";
import { connectDB } from "./config/db";
import findMaxId from "./utils/findMaxId";

const test = async () => {
  await connectDB();
  try {
    const query = await Query.findOne({});
    if (!query) throw new Error("Query not Found");

    const maxId = await findMaxId(query);

    console.log("Max ID:", maxId);

    process.exit();
  } catch (error) {
    console.log(error);
  }
};

test();
