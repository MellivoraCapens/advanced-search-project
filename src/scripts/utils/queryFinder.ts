import Query from "../../models/Query";
import color from "./color";
import { logger } from "./logger";

const queryFinder = async (intervalTime: number) => {
  process.stdout.write("\n");

  const [pendingQuery] = await Query.aggregate([
    { $match: { status: "pending" } },
    { $sort: { createdAt: 1 } },
    { $limit: 1 },
  ]);

  if (pendingQuery) {
    logger.debug(
      color("Pending Query Found: ", "cyan") +
        color(`${pendingQuery.title}`, "greenBright")
    );
    return pendingQuery;
  }

  logger.debug(color("No Pending Query Found!", "red"));

  const [updateQuery] = await Query.aggregate([
    {
      $match: {
        $and: [
          { status: { $regex: "^(?!pending$).*$" } },
          {
            lastUpdate: {
              $lt: new Date(Date.now() - intervalTime),
            },
          },
        ],
      },
    },
    { $sort: { lastUpdate: 1 } },
    { $limit: 1 },
  ]);

  if (updateQuery) {
    logger.debug(
      color("Updating Query: ", "magenta") +
        color(`${updateQuery.title}`, "greenBright")
    );
    return updateQuery;
  }
  logger.debug(color("No Updatable Query Found!", "red"));

  return null;
};

export default queryFinder;
