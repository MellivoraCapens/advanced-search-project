import "dotenv/config";
import { connectDB } from "./config/db";
import Query from "../models/Query";
import Data from "../models/Data";
import queryFinder from "./utils/queryFinder";
import pipelineMaker from "./utils/pipelineMaker";
import color, { style } from "./utils/color";
import delay from "./utils/delay";
import { logger } from "./utils/logger";
import findMaxId from "./utils/findMaxId";

const BATCH_SIZE = 100;
const PARALLEL = 5;

const MIN = 1;
const POLL_MS = 1000 * 60 * MIN;
const DAY = 5;
const UPDATE_INTERVAL_DAY = 1000 * 60 * 60 * 24 * DAY;

async function start() {
  console.log(
    style("  - Q U E R Y   S A V E R -  ", ["bgCyan", "black"]) +
      color("v0.1", "gray", "italic")
  );

  await connectDB();

  while (true) {
    try {
      await querySaver();
      await delay(UPDATE_INTERVAL_DAY);
    } catch (error) {
      logger.error("[GLOBAL_ERROR] An unhandled error occurred on Start.", {
        error,
      });

      await delay(POLL_MS);
    }
  }
}

const querySaver = async () => {
  try {
    const query = await queryFinder(POLL_MS);

    if (!query) {
      logger.info("Couldn't found any Pending or Updatable Query!");
      return;
    }

    const pipeline = pipelineMaker(
      query.query,
      query.status === "completed" ? query.lastUpdatedId : null
    );

    let matched = 0;
    let modified = 0;
    let errorCount = 0;
    let lastUpdatedId = query.lastUpdatedId ? query.lastUpdatedId : null;
    let active = false;

    await Data.aggregate(pipeline, { allowDiskUse: true })
      .cursor()
      .eachAsync(
        async (datas) => {
          const ids = datas.map((data) => data._id);
          active = true;

          const update = await Data.updateMany(
            { _id: { $in: ids } },
            {
              $addToSet: { savedQueryIds: query._id },
            }
          );

          if (!update.acknowledged) {
            logger.debug(
              color(`Error: "`, "red") +
                color("Could Not modified data count: ", "magenta") +
                color(`${update.matchedCount - update.modifiedCount}"`, "red")
            );

            errorCount += 1;
          }

          matched += update.matchedCount;
          modified += update.modifiedCount;
          logger.debug(
            color("Processing: ", "magenta") +
              color(
                `${matched - update.matchedCount + 1} - ${matched} docs`,
                "yellow"
              )
          );
        },
        { batchSize: BATCH_SIZE, parallel: PARALLEL }
      )
      .then(async () => {
        if (!active) {
          logger.debug(color("No Data found for updating.", "red"));

          const updatedQuery = await Query.findByIdAndUpdate(query._id, {
            lastUpdate: new Date(),
          });

          logger.info(`[QUERY_END_NO_DATA] Query: ${query.title}.`, {
            result: {
              success: true,
              query: {
                _id: query._id,
                title: query.title,
              },
            },
          });

          return;
        }

        logger.debug(
          color(`${modified}`, "yellow") +
            color(" modified out of ", "magenta") +
            color(`${matched}`, "yellow") +
            color(". Error Count: ", "magenta") +
            color(`${errorCount}`, errorCount ? "red" : "green")
        );

        let status = "completed";
        let numberOfResults = 0;

        lastUpdatedId = await findMaxId(query);

        if (query.status === "pending") numberOfResults = matched;

        if (query.status === "completed")
          numberOfResults = query.numberOfResults + modified;

        if (errorCount) {
          status = "pending";
          logger.error(
            `Could Not modified data count: ${
              matched - modified
            }. ErrorCount: ${errorCount}`
          );
        }
        await Query.findByIdAndUpdate(query._id, {
          status,
          numberOfResults,
          lastUpdate: new Date(),
          lastUpdatedId,
        });

        logger.info(
          `[QUERY_END_SUCCESS] Query: ${query.title} (${query._id}).`,
          {
            result: {
              success: true,
              query: {
                _id: query.id,
                title: query.title,
              },
              doc: {
                matched,
                modified,
                between: {
                  from: query.lastUpdatedId ? query.lastUpdatedId : null,
                  to: lastUpdatedId._id,
                },
              },
            },
          }
        );
      })
      .catch((error) => {
        logger.error(`[CRITICAL_ERROR] Query: ${query.title}.`, { error });
      });
  } catch (error) {
    console.error(error);
    logger.error(`[GLOBAL_ERROR] An unhandled error occurred in querySaver.`, {
      error,
    });
  }
};

start();
