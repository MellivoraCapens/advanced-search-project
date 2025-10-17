import Query from "../../models/Query";
import color from "./color";

const queryFinder = async (intervalTime: number) => {
  process.stdout.write("\n");
  console.log(color(`${new Date().toTimeString()}`, "magenta"));
  console.log(color("Searching for Pending Query...", "cyan"));

  const [pendingQuery] = await Query.aggregate([
    { $match: { status: "pending" } },
    { $sort: { createdAt: 1 } },
    { $limit: 1 },
  ]);

  if (pendingQuery) {
    console.log(
      color("Pending Query Found: ", "cyan") +
        color(`${pendingQuery.title}`, "greenBright")
    );
    return pendingQuery;
  }

  console.log(color("No Pending Query Found!", "red"));

  console.log(color("Searching for Updatable Query...", "cyan"));

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
    console.log(
      color("Updating Query: ", "magenta") +
        color(`${updateQuery.title}`, "greenBright")
    );
    return updateQuery;
  }
  console.log(color("No Updatable Query Found!", "red"));

  return null;
};

export default queryFinder;
