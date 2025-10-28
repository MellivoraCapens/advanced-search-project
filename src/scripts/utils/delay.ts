import color from "./color";
import { logger } from "./logger";

async function delay(ms: number) {
  process.stdout.write("\n");
  logger.debug(
    color("on Stand-by to ", "cyan") +
      color(`${new Date(Date.now() + ms).toTimeString()}`, "yellowBright")
  );
  await new Promise((_) => setTimeout(_, ms));
}

export default delay;
