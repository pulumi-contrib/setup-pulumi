import * as core from "@actions/core";

import { acquirePulumi } from "./installer";

async function run() {
  try {
    await acquirePulumi();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
