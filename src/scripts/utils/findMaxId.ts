import "dotenv/config";
import { IQuery } from "../../models/Query";
import Data from "../../models/Data";
import { connectDB } from "../config/db";

connectDB();

const findMaxId = async (query: IQuery) => {
  const filter: { $and: Array<Record<string, any>> } = {
    $and: [
      {
        savedQueryIds: query._id,
      },
    ],
  };
  if (query.lastUpdatedId) {
    filter.$and.push({
      _id: { $gte: query.lastUpdatedId },
    });
  }

  const maxIdResult = await Data.aggregate(
    [
      { $match: filter },
      { $group: { _id: null, maxId: { $max: "$_id" } } },
      { $project: { _id: 0, maxId: 1 } },
    ],
    { allowDiskUse: true }
  );

  return maxIdResult[0].maxId;
};

export default findMaxId;
