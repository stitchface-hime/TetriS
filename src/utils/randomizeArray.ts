import { getRandomInt } from "./getRandomInt";

export const randomizeArray = <T>(arr: T[]): T[] => {
  const original = [...arr];
  const randomized: T[] = [];

  while (original.length > 0) {
    // remove from original array and push it into the randomized list
    const [selectedEl] = original.splice(getRandomInt(original.length), 1);
    if (selectedEl !== undefined) {
      randomized.push(selectedEl);
    }
  }

  return randomized;
};
