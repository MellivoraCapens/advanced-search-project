import chalk, { Chalk } from "chalk";
import { chalkColor, chalkStyles } from "../types/types";

function color(message: string, color: chalkColor, style?: chalkStyles) {
  if (style) return chalk[style][color](message);
  return chalk[color](message);
}

export const style = (message: string, styleMethods: chalkColor[]) => {
  let chainedChalk: Chalk = chalk;

  styleMethods.forEach((methodName) => {
    if (typeof chainedChalk[methodName] === "function") {
      chainedChalk = chainedChalk[methodName] as Chalk;
    }
  });

  const finalOutput = chainedChalk(message);

  return finalOutput;
};

export default color;
