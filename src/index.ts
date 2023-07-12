import * as core from "@actions/core";

import { acquirePulumi } from "./installer";

async function run() {
  try {
    await acquirePulumi();
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void run();
