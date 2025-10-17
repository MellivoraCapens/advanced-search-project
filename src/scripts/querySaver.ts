import "dotenv/config";
import { connectDB } from "./config/db";
import Query from "../models/Query";
import Data from "../models/Data";
import queryFinder from "./utils/queryFinder";
import pipelineMaker from "./utils/pipelineMaker";
import color, { style } from "./utils/color";
import delay from "./utils/delay";

const BATCH_SIZE = 100;
const PARALLEL = 2;

const MIN = 1;
const POLL_MS = 1000 * 60 * MIN;
const DAY = 2;
const UPDATE_INVALID_DAY = 1000 * 60 * 60 * 24 * DAY;

async function start() {
  console.log(
    style("  - Q U E R Y   S A V E R -  ", ["black", "bgMagenta", "bold"]) +
      color(".v0.1", "gray", "italic")
  );

  await connectDB();
  while (true) {
    try {
      await querySaver();
      await delay(POLL_MS);
    } catch (error) {
      console.error(error);
      await delay(POLL_MS);
    }
  }
}

const querySaver = async () => {
  try {
    const query = await queryFinder(UPDATE_INVALID_DAY);
    if (query) {
      const pipeline = pipelineMaker(
        query.query,
        query.status === "completed" ? query.lastUpdate : null
      );

      let matched = 0;
      let modified = 0;
      let errorCount = 0;
      let lastData = query.lastData ? query.lastData : null;

      await Data.aggregate(pipeline)
        .cursor()
        .eachAsync(
          async (datas) => {
            const ids = datas.map((data) => data._id);

            const update = await Data.updateMany(
              { _id: { $in: ids } },
              {
                $addToSet: { savedQueryIds: query._id },
              }
            );

            lastData = lastData = datas[datas.length - 1]._id;

            if (!update.acknowledged) {
              console.log(
                color(`Error: "`, "red") +
                  color("Could Not modified data count: ", "magenta") +
                  color(`${update.matchedCount - update.modifiedCount}"`, "red")
              );
              errorCount += 1;
            }
            matched += update.matchedCount;
            modified += update.modifiedCount;
            console.log(
              color("Matched Data Count: ", "magenta") +
                color(`${matched}`, "yellow") +
                color(", Modified Data Count: ", "magenta") +
                color(`${modified}`, "yellow")
            );
          },
          { batchSize: BATCH_SIZE, parallel: PARALLEL }
        )
        .then(async () => {
          if (matched) {
            console.log(
              color(`${modified}`, "yellow") +
                color(" modified out of ", "magenta") +
                color(`${matched}`, "yellow") +
                color(". Error Count: ", "magenta") +
                color(`${errorCount}`, errorCount ? "red" : "green")
            );

            let status = "completed";
            let numberOfResults = query.numberOfResults + modified;
            if (errorCount) {
              status = "pending";
            }
            const updatedQuery = await Query.findByIdAndUpdate(query._id, {
              status,
              numberOfResults,
              lastUpdate: new Date(),
              lastUpdatedId: lastData,
            });
          } else {
            console.log(color("No Data found for updating.", "red"));
            const updatedQuery = await Query.findByIdAndUpdate(query._id, {
              lastUpdate: new Date(),
            });
          }

          console.log(
            color(`"${query.title}"`, "green") +
              color(" is updated.", "magenta")
          );
        })
        .catch((error) => console.error(error));
    }
  } catch (error) {
    console.error(error);
  }
};

start();
