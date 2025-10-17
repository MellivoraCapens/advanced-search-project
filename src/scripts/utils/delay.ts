import color from "./color";

async function delay(ms: number) {
  process.stdout.write("\n");
  console.log(
    color("on Stand-by from ", "cyan") +
      color(`${new Date().toTimeString()} `, "yellowBright") +
      color("to ", "cyan") +
      color(`${new Date(Date.now() + ms).toTimeString()}`, "yellowBright")
  );
  await new Promise((_) => setTimeout(_, ms));
}

export default delay;
